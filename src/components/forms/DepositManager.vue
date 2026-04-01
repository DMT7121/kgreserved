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
  <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm" :class="{'ring-4 ring-emerald-500/20 bg-emerald-50/30': formStore.deposit.isPaid}">
    <div class="flex justify-between items-center mb-4">
      <label class="font-black text-[10px] uppercase text-slate-700 tracking-widest"><i class="fa-solid fa-vault text-emerald-600 mr-1"></i> Quản lý Tiền Cọc</label>
      <div class="flex gap-2">
        <div class="text-[9px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200 uppercase tracking-tighter" title="Nhân viên trực">{{ formStore.staff.name }}</div>
        <button @click="autoCalcDeposit" class="text-[9px] bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 font-black hover:bg-indigo-200 transition active-effect hover-effect min-h-[30px]">AUTO 1/3</button>
      </div>
    </div>
    <div class="relative mb-4">
      <input type="number" v-model="formStore.deposit.amount" @focus="handleInputFocus" @blur="handleInputBlur" class="w-full h-14 border-2 border-slate-100 rounded-2xl p-4 font-black text-red-600 text-3xl text-right bg-white focus:border-red-400 outline-none shadow-inner">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg uppercase tracking-widest">VNĐ</span>
    </div>

    <div class="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm transition-all hover:border-emerald-200">
      <label class="flex items-center cursor-pointer select-none min-h-[44px]">
        <div class="relative">
          <input type="checkbox" :checked="formStore.deposit.isPaid" @click.prevent="toggleDepositState" class="sr-only toggle-checkbox">
          <div class="block bg-slate-200 w-12 h-7 rounded-full transition-colors"></div>
          <div class="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ease-in-out transform shadow-md" :class="{'translate-x-5': formStore.deposit.isPaid}"></div>
        </div>
        <div class="ml-3 font-black text-[11px] tracking-tight" :class="formStore.deposit.isPaid ? 'text-emerald-600' : 'text-slate-400'">
          {{ formStore.deposit.isPaid ? 'BẢN GHI: ĐÃ NHẬN CỌC' : 'TRẠNG THÁI: CHỜ CỌC' }}
        </div>
      </label>
      <span v-if="formStore.deposit.isPaid" class="text-[9px] font-black text-white bg-emerald-500 px-3 py-1 rounded-full shadow-lg shadow-emerald-200 uppercase tracking-tighter">
        {{ formStore.deposit.note || 'Confirmed' }}
      </span>
    </div>

    <div v-if="!formStore.deposit.isPaid">
      <button @click="payImgIn?.click()" class="w-full h-12 bg-indigo-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl transition-all active:scale-95 active-effect hover-effect min-h-[50px]"><i class="fa-solid fa-magnifying-glass-dollar text-yellow-300"></i> AI SCAN BILL CHUYỂN KHOẢN</button>
      <input type="file" ref="payImgIn" @change="onTransferUpload" class="hidden" accept="image/*">
    </div>
    <div v-if="formStore.deposit.image" class="mt-4 relative group">
      <img :src="formStore.deposit.image" class="w-full h-32 object-contain rounded-2xl border-2 border-slate-100 bg-white shadow-md" crossorigin="anonymous" referrerpolicy="no-referrer">
      <button @click="clearDeposit" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors min-h-[44px] min-w-[44px]"><i class="fa-solid fa-xmark"></i></button>
    </div>
  </div>
</template>
