<script setup lang="ts">
import { useUIStore } from '@/stores/useUIStore'
import { useFormStore } from '@/stores/useFormStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useAppStore } from '@/stores/useAppStore'
import { useBillRender } from '@/composables/useBillRender'
import { useForm } from '@/composables/useForm'
import AIInputPanel from '@/components/forms/AIInputPanel.vue'
import CustomerForm from '@/components/forms/CustomerForm.vue'
import DepositManager from '@/components/forms/DepositManager.vue'
import MenuItemsEditor from '@/components/forms/MenuItemsEditor.vue'
import HistoryList from '@/components/history/HistoryList.vue'

const ui = useUIStore()
const formStore = useFormStore()
const configStore = useConfigStore()
const appStore = useAppStore()
const { triggerSave } = useBillRender()
const { copyBookingConfirmation, validateForm } = useForm()

const doSave = (type: string) => triggerSave(type, validateForm)
</script>

<template>
  <div class="w-full md:w-5/12 bg-white flex flex-col shadow-2xl z-20 h-full border-r border-gray-100 text-[13px] safe-area-pt">
    <!-- HEADER -->
    <div class="flex-shrink-0 bg-slate-900 text-white p-4 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="bg-yellow-400 text-slate-900 p-2 rounded-xl text-xl font-black shadow-lg shadow-yellow-200" :style="{ backgroundColor: configStore.branding.color, color: '#1e293b' }"><i class="fa-solid fa-fire"></i></div>
        <div>
          <h1 class="font-black text-lg tracking-tighter leading-none text-white uppercase">KING'S GRILL</h1>
          <span class="text-[9px] bg-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest mt-1 inline-block">Manager AI v1.8.6</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
          <div class="w-2 h-2 rounded-full transition-colors" :class="{'bg-green-500': ui.connectionStatus === 'online', 'bg-yellow-500 animate-pulse': ui.connectionStatus === 'syncing', 'bg-red-500': ui.connectionStatus === 'error'}"></div>
          <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider hidden md:block">{{ ui.connectionStatus }}</span>
        </div>
        <button @click="ui.showSettingsHub = true" class="px-4 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center gap-2 border border-slate-700 transition text-white font-bold text-xs uppercase tracking-wider relative min-w-[44px]">
          <i class="fa-solid fa-gear"></i> CÀI ĐẶT
          <span v-if="configStore.totalKeysHasData" class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
        </button>
      </div>
    </div>

    <!-- TABS -->
    <div class="flex bg-white text-[11px] font-black border-b border-gray-100 uppercase tracking-widest">
      <button @click="ui.tab = 'create'" :class="['flex-1 py-4 flex justify-center gap-2 transition-all min-h-[44px]', ui.tab === 'create' ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-gray-400']" :style="ui.tab === 'create' ? { color: configStore.branding.color, borderColor: configStore.branding.color, backgroundColor: configStore.branding.color + '1a' } : {}"><i class="fa-solid fa-pen-nib"></i> Nhập Liệu</button>
      <button @click="appStore.loadHistory(false)" :class="['flex-1 py-4 flex justify-center gap-2 transition-all min-h-[44px]', ui.tab === 'history' ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-gray-400']" :style="ui.tab === 'history' ? { color: configStore.branding.color, borderColor: configStore.branding.color, backgroundColor: configStore.branding.color + '1a' } : {}"><i class="fa-solid fa-clock-rotate-left"></i> Lịch Sử</button>
      <button @click="ui.tab = 'preview'" class="md:hidden flex-1 py-4 flex justify-center gap-2 text-slate-800 bg-gray-100 min-h-[44px]"><i class="fa-solid fa-eye"></i> Preview</button>
    </div>

    <!-- CREATE TAB -->
    <div v-show="ui.tab === 'create'" class="flex-grow overflow-y-auto p-4 md:p-5 space-y-4 pb-28 md:pb-6 bg-gray-50/50 scroll-smooth custom-scrollbar">
      <AIInputPanel />
      <div class="space-y-4">
        <CustomerForm />
        <DepositManager />
        <MenuItemsEditor />
      </div>
    </div>

    <!-- DESKTOP FOOTER ACTIONS -->
    <div v-show="ui.tab === 'create' && !ui.isKeyboardOpen" class="hidden md:grid grid-cols-4 gap-3 p-5 border-t bg-white z-20">
      <button @click="doSave('save')" class="bg-emerald-600 text-white py-4 rounded-2xl font-black text-[11px] hover:bg-emerald-700 shadow-xl transition-all active:scale-95 flex flex-col items-center gap-1 uppercase tracking-tighter active-effect hover-effect min-h-[50px]">
        <i class="fa-solid fa-cloud-arrow-up text-lg"></i> LƯU & SYNC
        <span v-if="formStore.oldBillFileId" class="text-[8px] text-emerald-200 font-normal normal-case">Cleaning old ver...</span>
      </button>
      <button @click="doSave('image')" class="bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] hover:bg-indigo-700 shadow-xl transition-all active:scale-95 flex flex-col items-center gap-1 uppercase tracking-tighter active-effect hover-effect min-h-[50px]"><i class="fa-solid fa-file-image text-lg"></i> XUẤT ẢNH (4K)</button>
      <button @click="doSave('pdf')" class="bg-rose-600 text-white py-4 rounded-2xl font-black text-[11px] hover:bg-rose-700 shadow-xl transition-all active:scale-95 flex flex-col items-center gap-1 uppercase tracking-tighter active-effect hover-effect min-h-[50px]"><i class="fa-solid fa-file-pdf text-lg"></i> XUẤT PDF (HD)</button>
      <button @click="copyBookingConfirmation" class="bg-amber-500 text-white py-4 rounded-2xl font-black text-[11px] hover:bg-amber-600 shadow-xl transition-all active:scale-95 flex flex-col items-center gap-1 uppercase tracking-tighter active-effect hover-effect min-h-[50px]"><i class="fa-solid fa-copy text-lg"></i> COPY THÔNG TIN</button>
    </div>

    <!-- HISTORY TAB -->
    <HistoryList v-show="ui.tab === 'history'" />

    <!-- MOBILE FOOTER -->
    <div v-if="ui.tab === 'create' && !ui.isKeyboardOpen" class="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t z-40 grid grid-cols-4 gap-2 shadow-2xl safe-area-pb">
      <button @click="doSave('save')" class="bg-emerald-600 text-white py-4 rounded-2xl font-black flex flex-col items-center text-[9px] gap-1 shadow-lg active:scale-95 transition-transform uppercase tracking-tighter min-h-[60px] active-effect hover-effect"><i class="fa-solid fa-cloud-arrow-up text-xl"></i> LƯU</button>
      <button @click="doSave('image')" class="bg-indigo-600 text-white py-4 rounded-2xl font-black flex flex-col items-center text-[9px] gap-1 shadow-lg active:scale-95 transition-transform uppercase tracking-tighter min-h-[60px] active-effect hover-effect"><i class="fa-solid fa-file-image text-xl"></i> ẢNH</button>
      <button @click="doSave('pdf')" class="bg-rose-600 text-white py-4 rounded-2xl font-black flex flex-col items-center text-[9px] gap-1 shadow-lg active:scale-95 transition-transform uppercase tracking-tighter min-h-[60px] active-effect hover-effect"><i class="fa-solid fa-file-pdf text-xl"></i> PDF</button>
      <button @click="copyBookingConfirmation" class="bg-amber-500 text-white py-4 rounded-2xl font-black flex flex-col items-center text-[9px] gap-1 shadow-lg active:scale-95 transition-transform uppercase tracking-tighter min-h-[60px] active-effect hover-effect"><i class="fa-solid fa-copy text-xl"></i> COPY</button>
    </div>
  </div>
</template>
