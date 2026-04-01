import { ref, nextTick } from 'vue'
import { useFormStore } from '@/stores/useFormStore'
import { useAppStore } from '@/stores/useAppStore'
import { useUIStore } from '@/stores/useUIStore'
import { stripAccents, resizeImage, loadLibrary, isIOS } from '@/utils'
import { fetchWithRetry } from '@/services/api'
import { smartUploadImage } from '@/services/r2'
import { cacheBillImage } from '@/services/cache'


declare const html2canvas: any

/**
 * Bill rendering composable (SINGLETON)
 * Handles html2canvas rendering, save/export pipeline, and responsive scaling
 */
let _billInstance: ReturnType<typeof _createBillRender> | null = null

export function useBillRender() {
  if (!_billInstance) _billInstance = _createBillRender()
  return _billInstance
}

function _createBillRender() {
  const formStore = useFormStore()
  const appStore = useAppStore()
  const uiStore = useUIStore()

  const billRef = ref<HTMLElement | null>(null)
  const isRendering = ref(false)
  const mobileScaleStyles = ref<Record<string, string>>({})
  const wrapperScaleStyles = ref<Record<string, string>>({})

  // --- File Name Construction ---
  function constructFileName(): string {
    const depositStatus = formStore.deposit.isPaid ? '|Y|' : '|N|'
    const dateParts = formStore.customer.date.split('/')
    let dateStr = '00.00.00'
    if (dateParts.length === 3) {
      dateStr = `${dateParts[0]}.${dateParts[1]}.${dateParts[2].slice(-2)}`
    }
    let tables = (formStore.customer.tables || '0').trim()
    tables = stripAccents(tables).toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!tables) tables = '0'
    const name = stripAccents(formStore.customer.name || 'KHACH').toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim()
    return `${depositStatus} ${dateStr} ${tables} ${name}`
  }

  // --- Trigger Save ---
  function triggerSave(type: string, validateFn?: () => boolean) {
    if (validateFn && !validateFn()) return
    uiStore.pendingAction = type
    uiStore.showStaffSelector = true
  }

  // --- Confirm Staff & Save ---
  async function confirmStaffAndSave(staff: { name: string; phone: string }) {
    formStore.staff.name = staff.name
    formStore.staff.phone = staff.phone
    await nextTick()
    uiStore.showStaffSelector = false
    formStore.saveType = uiStore.pendingAction || ''
    await performOptimisticSave()
  }

  // --- Main Save Pipeline ---
  async function performOptimisticSave() {
    uiStore.loading.is = true
    uiStore.loading.msg = 'ĐANG XỬ LÝ...'
    uiStore.loading.subMsg = 'Rendering High-Res...'
    uiStore.connectionStatus = 'syncing'
    await nextTick()
    await new Promise(r => setTimeout(r, isIOS ? 150 : 50))

    const currentSnapshot = formStore.getDataSnapshot()
    const hasChanges = formStore.originalState !== currentSnapshot
    const isNewOrder = !formStore.originalState

    if (!isNewOrder && !hasChanges) {
      uiStore.connectionStatus = 'online'
      if (formStore.saveType === 'save') {
        uiStore.loading.is = false
        return uiStore.showToast('Dữ liệu đã đồng bộ - Không có thay đổi mới.', 'info')
      }
      if (formStore.saveType === 'image') {
        uiStore.loading.subMsg = 'Local Render (No Sync)...'
      }
    }

    if (!isNewOrder && hasChanges) {
      formStore.version = (formStore.version || 1) + 1
    }

    try {
      if (typeof html2canvas === 'undefined') {
        await loadLibrary('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      }
      await document.fonts.ready

      const currentScrollX = window.scrollX
      const currentScrollY = window.scrollY
      window.scrollTo(0, 0)

      const originalElement = document.getElementById('bill-render')
      let elementToRender: HTMLElement = originalElement!
      let container: HTMLDivElement | null = null

      const isHidden = originalElement!.offsetParent === null

      if (isHidden) {
        container = document.createElement('div')
        container.style.cssText = 'position:fixed;top:0;left:0;width:800px;z-index:-9999;visibility:visible;'
        const clone = originalElement!.cloneNode(true) as HTMLElement
        clone.style.cssText = 'transform:none;margin:0;'
        container.appendChild(clone)
        document.body.appendChild(container)
        elementToRender = clone
        await new Promise(r => setTimeout(r, isIOS ? 200 : 100))
      } else {
        await new Promise(r => setTimeout(r, isIOS ? 100 : 50))
      }

      const isMobile = window.innerWidth < 768 || isIOS
      let renderScale = isIOS ? 1.5 : (isMobile ? 2 : 3)
      let canvas: HTMLCanvasElement

      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

      try {
        canvas = await html2canvas(elementToRender, {
          scale: renderScale, useCORS: true, logging: false, allowTaint: false,
          backgroundColor: '#ffffff', width: 800, windowWidth: 800,
          ignoreElements: (el: Element) => el.classList.contains('no-print')
        })
      } catch {
        console.warn(`Render failed at scale ${renderScale}. Retrying with Safe Scale (1.5)...`)
        canvas = await html2canvas(elementToRender, {
          scale: 1.5, useCORS: true, logging: false, allowTaint: false,
          backgroundColor: '#ffffff', width: 800, windowWidth: 800,
          ignoreElements: (el: Element) => el.classList.contains('no-print')
        })
      }

      if (container) document.body.removeChild(container)
      window.scrollTo(currentScrollX, currentScrollY)
      const highResBase64 = canvas.toDataURL('image/jpeg', 0.85)

      if (highResBase64.length < 1000) throw new Error('Render ảnh thất bại (File quá nhỏ). Vui lòng thử lại.')

      const dynamicFileName = constructFileName()

      uiStore.loading.subMsg = 'Optimizing Payload...'
      const lowResBase64 = await resizeImage(highResBase64, 800)

      uiStore.loading.subMsg = 'Uploading Images...'

      // Smart upload bill image: R2 first, fallback to base64 for GAS
      const billUpload = await smartUploadImage(
        lowResBase64,
        `${dynamicFileName}.jpg`,
        formStore.id || undefined
      )

      // Smart upload transfer image if exists
      let transferUpload = { url: formStore.deposit.image || '', source: 'base64' as const }
      if (formStore.deposit.image && formStore.deposit.image.includes('base64')) {
        transferUpload = await smartUploadImage(
          formStore.deposit.image,
          `CK_${formStore.customer.name}_${Date.now()}.jpg`,
          formStore.id || undefined
        )
      }

      // Cache bill image locally for offline preview
      cacheBillImage(formStore.id || '', lowResBase64)

      uiStore.loading.subMsg = 'Building Payload...'

      const metadata = {
        customerName: formStore.customer.name,
        customerPhone: formStore.customer.phone,
        customerTable: formStore.customer.tables,
        bookingDate: formStore.customer.date,
        totalAmount: formStore.calculatedTotals.final,
        itemsCount: formStore.items.length,
        isDeposited: formStore.deposit.isPaid,
        staff: formStore.staff.name,
        aiEngine: formStore.aiMetadata ? formStore.aiMetadata.processedBy : '',
        timestamp: new Date().toISOString()
      }

      const payload: any = {
        customer: formStore.customer,
        items: formStore.items,
        deposit: { ...formStore.deposit, image: transferUpload.url },
        staff: formStore.staff,
        id: formStore.id || crypto.randomUUID(),
        version: formStore.version || 1,
        total: formStore.calculatedTotals.final,
        billImage: billUpload.source === 'r2' ? billUpload.url : lowResBase64,
        customFileName: dynamicFileName,
        oldBillFileId: formStore.oldBillFileId,
        smartIndex: metadata,
        renderPdf: formStore.saveType === 'pdf',
        imageSource: billUpload.source
      }

      if (formStore.saveType === 'pdf') {
        const styles = document.getElementsByTagName('style')[0]?.innerHTML || ''
        const body = document.getElementById('bill-render')?.outerHTML || ''
        payload.htmlContent = `<html><head><style>${styles}</style></head><body>${body}</body></html>`
      }

      uiStore.loading.subMsg = 'Syncing to Cloud...'

      let result: any = null
      const needsSync = isNewOrder || hasChanges || formStore.saveType === 'pdf'

      if (needsSync) {
        result = await fetchWithRetry({ action: 'saveOrder', data: payload })
        if (!result.ok) throw new Error(result.message)
      }

      if (formStore.saveType !== 'pdf') {
        const binStr = atob(highResBase64.split(',')[1])
        const len = binStr.length
        const arr = new Uint8Array(len)
        for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i)
        const blob = new Blob([arr], { type: 'image/jpeg' })
        const blobUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `${dynamicFileName}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)

        uiStore.loading.is = false
        uiStore.showToast(needsSync ? 'Đồng bộ hoàn tất!' : 'Xuất ảnh thành công!', 'success')
      } else {
        if (result?.billUrl) window.open(result.billUrl, '_blank')
        uiStore.loading.is = false
        uiStore.showToast('Đồng bộ hoàn tất!', 'success')
      }

      if (needsSync && result) {
        formStore.originalState = formStore.getDataSnapshot()
        uiStore.connectionStatus = 'online'
        if (result.syncResult && !result.syncResult.ok) {
          uiStore.showToast(result.syncResult.msg, 'error')
        }
        appStore.loadHistory(true)
        formStore.oldBillFileId = null
        formStore.aiMetadata = null
        if (formStore.saveType === 'save') uiStore.tab = 'history'
      }
    } catch (e: any) {
      uiStore.connectionStatus = 'error'
      uiStore.error = { show: true, msg: 'Sync Error: ' + e.message }
      uiStore.loading.is = false
    }
  }

  // --- Responsive Preview Scaling ---
  function updatePreviewScale() {
    const el = document.getElementById('bill-render')
    if (window.innerWidth < 800 && uiStore.tab === 'preview') {
      const s = (window.innerWidth - 30) / 800
      const h = el ? el.offsetHeight : 0
      mobileScaleStyles.value = { transform: `scale(${s})`, transformOrigin: 'top left', margin: '0' }
      wrapperScaleStyles.value = { width: `${800 * s}px`, height: h ? `${h * s}px` : 'auto', position: 'relative', transition: 'height 0.2s ease' }
    } else {
      mobileScaleStyles.value = { transform: 'none', transformOrigin: 'top center', margin: '0 auto' }
      wrapperScaleStyles.value = { width: '100%', display: 'flex', justifyContent: 'center' }
    }
  }

  return {
    billRef, isRendering, mobileScaleStyles, wrapperScaleStyles,
    constructFileName, triggerSave, confirmStaffAndSave, performOptimisticSave,
    updatePreviewScale
  }
}
