import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'
import { PLATFORMS, AI_MODELS, CACHE_KEYS } from '@/utils/constants'
import { useUIStore } from './useUIStore'
import * as api from '@/services/api'

export const useConfigStore = defineStore('config', () => {
  const uiStore = useUIStore()

  // --- Branding ---
  const branding = reactive(
    JSON.parse(localStorage.getItem(CACHE_KEYS.BRANDING) || '{"logo": null, "color": "#eab308"}')
  )

  // --- AI Keys (Platform-Centric) ---
  const savedKeys = JSON.parse(localStorage.getItem(CACHE_KEYS.KEYS) || '{}') as Record<string, string[]>
  Object.keys(PLATFORMS).forEach(pId => {
    if (!savedKeys[pId]) savedKeys[pId] = pId === 'pollinations' ? ['free'] : []
  })

  const keys = reactive<Record<string, string[]>>(savedKeys)
  const defaults = reactive(
    JSON.parse(localStorage.getItem(CACHE_KEYS.DEFAULTS) || '{"text":"llama-3.3-70b", "vision":"gemini-2.0-flash-exp"}')
  )
  const visibleKeys = reactive<Record<string, boolean>>({})
  const tempKeys = reactive<Record<string, string>>({})
  const borrowPass = ref('')

  // Init temp keys
  Object.keys(PLATFORMS).forEach(pId => { tempKeys[pId] = '' })

  // Auto-save defaults
  watch(() => defaults, (val) => {
    localStorage.setItem(CACHE_KEYS.DEFAULTS, JSON.stringify(val))
  }, { deep: true })

  // --- Computed ---
  const textModels = computed(() => AI_MODELS.filter(m => m.type === 'text').sort((a, b) => a.tier - b.tier))
  const visionModels = computed(() => AI_MODELS.filter(m => m.type === 'vision').sort((a, b) => a.tier - b.tier))
  const totalKeyCount = computed(() => Object.values(keys).reduce((a, b) => a + (b?.length || 0), 0))
  const totalKeysHasData = computed(() => totalKeyCount.value > 1)

  function getKeyCount(pId: string): number {
    return keys[pId]?.length || 0
  }

  function toggleKeyVisibility(pId: string, idx: number) {
    visibleKeys[`${pId}_${idx}`] = !visibleKeys[`${pId}_${idx}`]
  }

  // --- API Key Management ---
  async function saveApiKey(pId: string) {
    const keyVal = tempKeys[pId]?.trim()
    if (!keyVal) return

    uiStore.loading.is = true
    uiStore.loading.msg = 'ĐANG LƯU KEY LÊN MÁY CHỦ...'
    try {
      if (!keys[pId]) keys[pId] = []
      if (keys[pId].includes(keyVal)) {
        tempKeys[pId] = ''
        uiStore.showToast('Key này đã tồn tại trên hệ thống, đã bỏ qua lưu mới!', 'info')
        return
      }

      keys[pId].push(keyVal)
      tempKeys[pId] = ''
      localStorage.setItem(CACHE_KEYS.KEYS, JSON.stringify(keys))

      const data = await api.saveApiKeyToCloud(pId, keyVal, 'ADMINDMT')
      if (data.ok) {
        uiStore.showToast(`Đã lưu & đồng bộ API Key ${PLATFORMS[pId].name} lên Server!`, 'success')
      } else {
        if (data.message?.toLowerCase().includes('trùng')) {
          uiStore.showToast('Key đã có sẵn trên Cloud, bỏ qua lưu trùng.', 'info')
        } else {
          uiStore.showToast(`Đã lưu cục bộ nhưng lỗi Cloud: ${data.message}`, 'warning')
        }
      }
    } catch {
      uiStore.showToast('Đã lưu cục bộ (Chưa đồng bộ Cloud do lỗi mạng)', 'warning')
    } finally {
      uiStore.loading.is = false
    }
  }

  function deleteApiKey(pId: string, idx: number) {
    keys[pId].splice(idx, 1)
    localStorage.setItem(CACHE_KEYS.KEYS, JSON.stringify(keys))
  }

  async function borrowKeys() {
    if (!borrowPass.value) return uiStore.showToast('Nhập pass Admin!', 'warning')
    uiStore.loading.is = true
    uiStore.loading.msg = 'ĐANG KẾT NỐI SERVER TẢI KEYS...'
    try {
      const data = await api.borrowApiKeys(borrowPass.value)
      if (data.ok) {
        let addedCount = 0
        data.keys.forEach((k: any) => {
          let pId = k.provider === 'gemini' ? 'google' : k.provider
          if (PLATFORMS[pId]) {
            if (!keys[pId]) keys[pId] = []
            if (!keys[pId].includes(k.key)) {
              keys[pId].push(k.key)
              addedCount++
            }
          }
        })
        localStorage.setItem(CACHE_KEYS.KEYS, JSON.stringify(keys))
        if (borrowPass.value === 'ADMINDMT') {
          uiStore.showToast(`[QUYỀN ADMIN] Đã lấy toàn bộ ${data.keys.length} keys từ hệ thống! (Mới: ${addedCount})`, 'success', 5000)
        } else {
          uiStore.showToast(`Đã lấy ${data.keys.length} keys!`, 'success')
        }
        borrowPass.value = ''
      } else {
        uiStore.showToast(data.message || 'Mật khẩu không đúng hoặc từ chối truy cập!', 'error')
      }
    } catch {
      uiStore.showToast('Lỗi kết nối máy chủ', 'error')
    } finally {
      uiStore.loading.is = false
    }
  }

  // --- Branding ---
  function saveBranding() {
    localStorage.setItem(CACHE_KEYS.BRANDING, JSON.stringify(branding))
    uiStore.showToast('Đã lưu giao diện!', 'success')
    uiStore.showBrandingConfig = false
  }

  function handleLogoUpload(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0]
    if (f) {
      const r = new FileReader()
      r.onload = (ev) => { branding.logo = ev.target?.result }
      r.readAsDataURL(f)
    }
  }

  return {
    branding,
    keys, defaults, visibleKeys, tempKeys, borrowPass,
    textModels, visionModels, totalKeyCount, totalKeysHasData,
    getKeyCount, toggleKeyVisibility,
    saveApiKey, deleteApiKey, borrowKeys: borrowKeys,
    saveBranding, handleLogoUpload
  }
})
