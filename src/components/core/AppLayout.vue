<script setup lang="ts">
import { useUIStore } from '@/stores/useUIStore'
import { useFormStore } from '@/stores/useFormStore'
import { useAppStore } from '@/stores/useAppStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useBillRender } from '@/composables/useBillRender'
import { useForm } from '@/composables/useForm'
import { isIOS } from '@/utils'
import { onMounted, onErrorCaptured, watch, nextTick, ref, defineAsyncComponent } from 'vue'
import LeftPanel from './LeftPanel.vue'
import BillPreview from './BillPreview.vue'

// Lazy-loaded Modals (only fetched when user opens them → ~40% smaller initial bundle)
const AiConfigModal = defineAsyncComponent(() => import('@/components/modals/AiConfigModal.vue'))
const StaffModal = defineAsyncComponent(() => import('@/components/modals/StaffModal.vue'))
const MenuManagerModal = defineAsyncComponent(() => import('@/components/modals/MenuManagerModal.vue'))
const BankConfigModal = defineAsyncComponent(() => import('@/components/modals/BankConfigModal.vue'))
const BrandingModal = defineAsyncComponent(() => import('@/components/modals/BrandingModal.vue'))
const VerifyTransferModal = defineAsyncComponent(() => import('@/components/modals/VerifyTransferModal.vue'))

const ui = useUIStore()
const formStore = useFormStore()
const appStore = useAppStore()
const configStore = useConfigStore()
const { updatePreviewScale, confirmStaffAndSave, triggerSave } = useBillRender()
const { handleInputFocus, handleInputBlur, copyToClipboard, copyBookingConfirmation } = useForm()

const promptInput = ref<HTMLInputElement>()
const componentError = ref<string | null>(null)

// --- Error Boundary ---
onErrorCaptured((err: Error, instance, info) => {
  console.error('[ErrorBoundary]', err, info)
  componentError.value = `${err.message} (${info})`
  ui.showToast(`Lỗi hệ thống: ${err.message}`, 'error')
  return false // prevent propagation
})

// --- Watchers ---
watch(() => ui.tempTable, (val) => {
  formStore.customer.tables = val.number ? `${val.zone}${val.number}` : ''
}, { deep: true })

watch(() => ui.tab, (v) => {
  if (v === 'preview') {
    nextTick(() => {
      updatePreviewScale()
      // Re-calc after layout settles
      setTimeout(() => updatePreviewScale(), 100)
      setTimeout(() => updatePreviewScale(), 300)
    })
  }
})

// --- Mounted ---
onMounted(() => {
  if (!formStore.id) formStore.id = crypto.randomUUID()
  ui.isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  appStore.fetchSheets()
  appStore.fetchMenu()
  appStore.loadHistory(true)
  appStore.fetchRemoteConfig()

  // Keyboard detection via visualViewport
  if (window.visualViewport) {
    const initialViewportHeight = window.visualViewport.height
    window.visualViewport.addEventListener('resize', () => {
      ui.isKeyboardOpen = window.visualViewport!.height < initialViewportHeight * 0.85
    })
  }

  // Preview scaling
  window.addEventListener('resize', () => {
    if (ui.tab === 'preview') updatePreviewScale()
  })

  setTimeout(() => {
    const observerTarget = document.getElementById('bill-render')
    if (observerTarget && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        if (ui.tab === 'preview') updatePreviewScale()
      })
      resizeObserver.observe(observerTarget)
    }
  }, 500)
})
</script>

<template>
  <div id="app-root" class="h-screen min-h-[100dvh] flex flex-col md:flex-row" v-cloak>

    <!-- LOADING OVERLAY -->
    <div v-if="ui.loading.is" class="fixed inset-0 bg-white/95 z-[9999] flex flex-col justify-center items-center backdrop-blur-sm text-center p-6">
      <div class="w-14 h-14 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin-fast mb-6"></div>
      <div class="text-slate-800 font-black text-xl tracking-tight animate-pulse whitespace-pre-line">{{ ui.loading.msg }}</div>
      <div v-if="ui.loading.subMsg" class="mt-2 text-xs text-blue-600 font-bold uppercase tracking-widest">{{ ui.loading.subMsg }}</div>
    </div>

    <!-- PROMISE-BASED MODALS -->
    <!-- Alert -->
    <transition name="modal">
    <div v-if="ui.modal.alert.show" class="fixed inset-0 bg-black/60 z-[12000] flex justify-center items-center p-4 backdrop-blur-sm">
      <div class="glass-panel shadow-2xl p-6 max-w-sm w-full border-t-8 border-blue-500">
        <h3 class="text-lg font-black text-white mb-2 uppercase">{{ ui.modal.alert.title }}</h3>
        <p class="text-sm text-slate-300 mb-6 font-medium whitespace-pre-line">{{ ui.modal.alert.msg }}</p>
        <button @click="ui.resolveModal('alert')" class="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest min-h-[44px] active-effect hover:bg-blue-500 transition">Đã Hiểu</button>
      </div>
    </div>
    </transition>

    <!-- Confirm -->
    <transition name="modal">
    <div v-if="ui.modal.confirm.show" class="fixed inset-0 bg-black/60 z-[12000] flex justify-center items-center p-4 backdrop-blur-sm">
      <div class="glass-panel shadow-2xl p-6 max-w-sm w-full border-t-8 border-red-500">
        <h3 class="text-lg font-black text-white mb-2 uppercase">{{ ui.modal.confirm.title }}</h3>
        <p class="text-sm text-slate-300 mb-6 font-medium whitespace-pre-line">{{ ui.modal.confirm.msg }}</p>
        <div class="grid grid-cols-2 gap-3">
          <button @click="ui.resolveModal('confirm', false)" class="py-3 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 rounded-xl font-black uppercase min-h-[44px] active-effect transition">Hủy</button>
          <button @click="ui.resolveModal('confirm', true)" class="py-3 bg-red-600 text-white rounded-xl font-black uppercase min-h-[44px] active-effect shadow-[0_0_15px_rgba(220,38,38,0.5)] transition hover:bg-red-500">Đồng Ý</button>
        </div>
      </div>
    </div>
    </transition>

    <!-- Prompt -->
    <transition name="modal">
    <div v-if="ui.modal.prompt.show" class="fixed inset-0 bg-black/60 z-[12000] flex justify-center items-center p-4 backdrop-blur-sm">
      <div class="glass-panel shadow-2xl p-6 max-w-sm w-full border-t-8 border-indigo-500">
        <h3 class="text-lg font-black text-white mb-2 uppercase">{{ ui.modal.prompt.title }}</h3>
        <p class="text-xs text-indigo-300 mb-3 font-bold uppercase">{{ ui.modal.prompt.msg }}</p>
        <input v-model="ui.modal.prompt.value" ref="promptInput" class="w-full glass-input rounded-xl p-3 mb-6 font-bold text-white transition focus:shadow-[0_0_15px_rgba(99,102,241,0.5)]" placeholder="Nhập nội dung...">
        <div class="grid grid-cols-2 gap-3">
          <button @click="ui.resolveModal('prompt', null)" class="py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-black uppercase min-h-[44px] active-effect hover:bg-slate-700 transition">Hủy</button>
          <button @click="ui.resolveModal('prompt', ui.modal.prompt.value)" class="py-3 bg-indigo-600 text-white rounded-xl font-black uppercase min-h-[44px] active-effect shadow-[0_0_15px_rgba(99,102,241,0.5)] transition hover:bg-indigo-500">Xác Nhận</button>
        </div>
      </div>
    </div>
    </transition>

    <!-- ERROR MODAL -->
    <div v-if="ui.error.show" class="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 backdrop-blur-md" @click.self="ui.error.show = false">
      <div class="glass-panel p-6 max-w-sm w-[95%] md:w-full border-l-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
        <h3 class="text-xl font-black text-red-400 mb-4 flex items-center gap-2"><i class="fa-solid fa-bolt-lightning"></i> AI Error</h3>
        <div class="bg-red-950/50 p-4 rounded-xl text-xs font-mono mb-4 max-h-40 overflow-y-auto border border-red-900/50 text-red-200">{{ ui.error.msg }}</div>
        <div class="flex gap-3">
          <button @click="copyToClipboard(ui.error.msg)" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 transition rounded-xl font-bold text-slate-300 min-h-[44px] border border-slate-700">Copy log</button>
          <button @click="ui.error.show = false" class="px-6 py-3 bg-red-600 hover:bg-red-500 transition text-white rounded-xl font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] min-h-[44px]">Đóng</button>
        </div>
      </div>
    </div>

    <!-- SETTINGS HUB MODAL -->
    <div v-if="ui.showSettingsHub" class="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 backdrop-blur-md" @click.self="ui.showSettingsHub = false">
      <div class="glass-panel p-8 max-w-md w-[95%] md:w-full flex flex-col border border-[rgba(255,255,255,0.1)] shadow-[0_0_50px_rgba(99,102,241,0.2)]">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-black text-white uppercase tracking-tighter"><i class="fa-solid fa-gear text-indigo-400 mr-2 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"></i>Cài Đặt Hệ Thống</h3>
          <button @click="ui.showSettingsHub = false" class="text-slate-400 hover:text-red-400 transition-colors p-2 min-h-[44px] min-w-[44px]"><i class="fa-solid fa-circle-xmark text-3xl"></i></button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <button @click="ui.openConfig('branding')" class="p-6 bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.2)] hover:border-[rgba(59,130,246,0.4)] rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all active:scale-95 group min-h-[120px]">
            <i class="fa-solid fa-palette text-3xl text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all drop-shadow-[0_0_8px_currentColor]"></i>
            <span class="font-black text-xs uppercase text-slate-300 tracking-wide mt-2">Giao Diện</span>
          </button>
          <button @click="ui.openConfig('menu')" class="p-6 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.2)] hover:border-[rgba(34,197,94,0.4)] rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all active:scale-95 group min-h-[120px]">
            <i class="fa-solid fa-utensils text-3xl text-green-400 group-hover:scale-110 group-hover:text-green-300 transition-all drop-shadow-[0_0_8px_currentColor]"></i>
            <span class="font-black text-xs uppercase text-slate-300 tracking-wide mt-2">Thực Đơn</span>
          </button>
          <button @click="ui.openConfig('bank')" class="p-6 bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] hover:bg-[rgba(168,85,247,0.2)] hover:border-[rgba(168,85,247,0.4)] rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all active:scale-95 group min-h-[120px]">
            <i class="fa-solid fa-building-columns text-3xl text-purple-400 group-hover:scale-110 group-hover:text-purple-300 transition-all drop-shadow-[0_0_8px_currentColor]"></i>
            <span class="font-black text-xs uppercase text-slate-300 tracking-wide mt-2">Ngân Hàng</span>
          </button>
          <button @click="ui.openConfig('staff')" class="p-6 bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] hover:bg-[rgba(249,115,22,0.2)] hover:border-[rgba(249,115,22,0.4)] rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all active:scale-95 group min-h-[120px]">
            <i class="fa-solid fa-users-gear text-3xl text-orange-400 group-hover:scale-110 group-hover:text-orange-300 transition-all drop-shadow-[0_0_8px_currentColor]"></i>
            <span class="font-black text-xs uppercase text-slate-300 tracking-wide mt-2">Nhân Viên</span>
          </button>
          <button @click="ui.openConfig('ai')" class="col-span-2 p-4 bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] rounded-2xl flex items-center justify-center gap-3 hover:bg-[rgba(30,41,59,0.8)] hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-95 min-h-[60px] group">
            <i class="fa-solid fa-microchip text-xl text-indigo-400 group-hover:text-indigo-300 transition drop-shadow-[0_0_5px_currentColor]"></i>
            <span class="font-black text-xs uppercase text-indigo-100 tracking-wide">Cấu hình AI Core v4.0</span>
          </button>
        </div>
      </div>
    </div>

    <!-- STAFF SELECTOR MODAL (ON SAVE) -->
    <div v-if="ui.showStaffSelector" class="fixed inset-0 bg-black/80 z-[10002] flex justify-center items-center p-4 backdrop-blur-sm" @click.self="ui.showStaffSelector = false">
      <div class="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border-4 border-slate-900">
        <h3 class="text-xl font-black text-center mb-6 text-slate-800 uppercase tracking-tighter">NHÂN VIÊN TẠO PHIẾU</h3>
        <div class="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
          <button v-for="(staff, idx) in appStore.staffList" :key="idx"
            @click="confirmStaffAndSave(staff)"
            class="p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 shadow-sm group min-h-[80px]">
            <i class="fa-solid fa-user-check text-2xl text-slate-300 group-hover:text-blue-500 mb-1"></i>
            <span class="font-black text-xs uppercase text-slate-700 text-center leading-tight">{{ staff.name }}</span>
            <span class="text-[9px] font-mono font-bold text-slate-400">{{ staff.phone }}</span>
          </button>
        </div>
        <button @click="ui.showStaffSelector = false" class="w-full mt-4 py-3 bg-gray-100 text-gray-500 font-black rounded-xl uppercase text-xs hover:bg-gray-200 min-h-[44px] active-effect">Hủy Bỏ</button>
      </div>
    </div>

    <!-- ALL CONFIG MODALS -->
    <VerifyTransferModal />
    <StaffModal />
    <AiConfigModal />
    <BrandingModal />
    <MenuManagerModal />
    <BankConfigModal />

    <!-- MAIN PANELS -->
    <LeftPanel />
    <BillPreview />

  </div>
</template>
