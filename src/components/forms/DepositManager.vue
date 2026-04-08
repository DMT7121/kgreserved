<script setup lang="ts">
import { ref } from 'vue'
import { useUIStore } from '@/stores/useUIStore'
import { useFormStore } from '@/stores/useFormStore'
import { useForm } from '@/composables/useForm'
import { useAI } from '@/composables/useAI'
import { formatVND } from '@/utils'

const ui = useUIStore()
const formStore = useFormStore()
const { handleInputFocus, handleInputBlur, autoCalcDeposit, toggleDepositState, clearDeposit, handleTransferUpload } = useForm()
const { verifyTransferImage } = useAI()
const payImgIn = ref<HTMLInputElement>()

function onTransferUpload(e: Event) {
  handleTransferUpload(e)
  // After file is read, verify via AI
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => verifyTransferImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="glass-panel p-5 rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.2)]" :class="{'ring-2 ring-emerald-500/50 bg-[rgba(16,185,129,0.1)]': formStore.deposit.isPaid}">
    <div class="flex justify-between items-center mb-4">
      <label class="font-black text-[10px] uppercase text-emerald-400 tracking-widest"><i class="fa-solid fa-vault mr-1 drop-shadow-[0_0_5px_currentColor]"></i> Quản lý Tiền Cọc</label>
      <div class="flex gap-2">
        <div class="text-[9px] font-black glass-input px-3 py-1 rounded-full text-indigo-300 uppercase tracking-tighter" title="Nhân viên trực">{{ formStore.staff.name }}</div>
        <button @click="autoCalcDeposit" class="text-[9px] bg-indigo-600/20 px-3 py-1 rounded-full text-indigo-400 font-black hover:bg-indigo-600/40 border border-indigo-500/30 transition active-effect hover-effect min-h-[30px] shadow-[0_0_10px_rgba(99,102,241,0.2)]">AUTO 1/3</button>
      </div>
    </div>
    <div class="relative mb-4">
      <input type="number" v-model="formStore.deposit.amount" @focus="handleInputFocus" @blur="handleInputBlur" class="w-full h-14 glass-input rounded-2xl p-4 font-black text-red-400 text-3xl text-right transition-colors outline-none focus:shadow-[0_0_15px_rgba(248,113,113,0.3)]">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300/50 font-black text-lg uppercase tracking-widest">VNĐ</span>
    </div>

    <div class="flex items-center justify-between bg-[rgba(15,23,42,0.4)] p-4 rounded-2xl border border-[rgba(255,255,255,0.05)] mb-4 shadow-sm transition-all hover:border-emerald-500/40">
      <label class="flex items-center cursor-pointer select-none min-h-[44px]">
        <div class="relative">
          <input type="checkbox" :checked="formStore.deposit.isPaid" @click.prevent="toggleDepositState" class="sr-only toggle-checkbox">
          <div class="block bg-slate-700 w-12 h-7 rounded-full transition-colors border border-slate-600"></div>
          <div class="dot absolute left-1 top-1 bg-slate-300 w-5 h-5 rounded-full transition-transform duration-300 ease-in-out transform shadow-md" :class="{'translate-x-5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]': formStore.deposit.isPaid}"></div>
        </div>
        <div class="ml-3 font-black text-[11px] tracking-tight" :class="formStore.deposit.isPaid ? 'text-emerald-400 text-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-slate-400'">
          {{ formStore.deposit.isPaid ? 'BẢN GHI: ĐÃ NHẬN CỌC' : 'TRẠNG THÁI: CHỜ CỌC' }}
        </div>
      </label>
      <span v-if="formStore.deposit.isPaid" class="text-[9px] font-black text-emerald-950 bg-emerald-400 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] uppercase tracking-tighter">
        {{ formStore.deposit.note || 'Confirmed' }}
      </span>
    </div>

    <div v-if="!formStore.deposit.isPaid">
      <button @click="payImgIn?.click()" class="w-full h-12 bg-[rgba(99,102,241,0.2)] text-indigo-300 border border-[rgba(99,102,241,0.3)] rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[rgba(99,102,241,0.4)] shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all active:scale-95 active-effect hover-effect min-h-[50px]"><i class="fa-solid fa-magnifying-glass-dollar text-yellow-400"></i> AI SCAN BILL CHUYỂN KHOẢN</button>
      <input type="file" ref="payImgIn" @change="onTransferUpload" class="hidden" accept="image/*">
    </div>
    <div v-if="formStore.deposit.image" class="mt-4 relative group">
      <img :src="formStore.deposit.image" class="w-full h-32 object-contain rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] shadow-md" crossorigin="anonymous" referrerpolicy="no-referrer">
      <button @click="clearDeposit" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:bg-red-500 transition-colors min-h-[44px] min-w-[44px]"><i class="fa-solid fa-xmark"></i></button>
    </div>
  </div>
</template>
