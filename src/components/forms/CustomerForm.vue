<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/useUIStore'
import { useFormStore } from '@/stores/useFormStore'
import { useForm } from '@/composables/useForm'

const ui = useUIStore()
const formStore = useFormStore()
const { handleInputFocus, handleInputBlur, formatDate, checkCRM, crmStatus } = useForm()
</script>

<template>
  <div class="glass-panel p-5 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
    <div class="flex items-center gap-2 border-b border-[rgba(255,255,255,0.1)] pb-3 mb-2">
      <i class="fa-solid fa-user-tag text-indigo-400"></i>
      <h3 class="font-black text-white text-[10px] uppercase tracking-widest">Thông tin khách hàng</h3>
      <div v-if="formStore.customer.phone && crmStatus" :class="['crm-badge', crmStatus === 'VIP' ? 'crm-vip' : 'crm-new']">
        <i class="fa-solid" :class="crmStatus === 'VIP' ? 'fa-crown' : 'fa-seedling'"></i> {{ crmStatus }}
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1"><label class="text-[9px] font-black text-indigo-300/80 uppercase ml-1 tracking-wider">Người đặt <span class="text-red-400">*</span></label><input v-model="formStore.customer.name" @focus="handleInputFocus" @blur="handleInputBlur" class="w-full glass-input rounded-xl px-4 py-3 text-base md:text-sm font-black transition-colors" placeholder="Tên khách"></div>
      <div class="space-y-1"><label class="text-[9px] font-black text-indigo-300/80 uppercase ml-1 tracking-wider">SĐT/Zalo <span class="text-red-400">*</span></label><input v-model="formStore.customer.phone" @focus="handleInputFocus" @blur="(e) => { handleInputBlur(); checkCRM(); }" class="w-full glass-input rounded-xl px-4 py-3 text-base md:text-sm font-black transition-colors" placeholder="09xxxxxxx"></div>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="space-y-1 text-center"><label class="text-[9px] font-black text-indigo-300/80 uppercase tracking-wider">Ngày <span class="text-red-400">*</span></label><input v-model="formStore.customer.date" @focus="handleInputFocus" @blur="(e) => { handleInputBlur(); formatDate(); }" class="w-full glass-input rounded-xl px-2 py-3 text-base md:text-sm text-center font-black transition-colors" placeholder="dd/mm/yyyy"></div>
      <div class="space-y-1 text-center"><label class="text-[9px] font-black text-indigo-300/80 uppercase tracking-wider">Giờ <span class="text-red-400">*</span></label><input v-model="formStore.customer.time" @focus="handleInputFocus" @blur="handleInputBlur" class="w-full glass-input rounded-xl px-2 py-3 text-base md:text-sm text-center font-black transition-colors" placeholder="18:30"></div>
      <div class="space-y-1 text-center"><label class="text-[9px] font-black text-indigo-300/80 uppercase tracking-wider">Khách <span class="text-red-400">*</span></label><input v-model="formStore.customer.pax" @focus="handleInputFocus" @blur="handleInputBlur" class="w-full glass-input rounded-xl px-2 py-3 text-base md:text-sm text-center font-black transition-colors" placeholder="SL"></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1"><label class="text-[9px] font-black text-indigo-300/80 uppercase ml-1 tracking-wider">Loại tiệc <span class="text-red-400">*</span></label><input v-model="formStore.customer.type" @focus="handleInputFocus" @blur="handleInputBlur" list="pTypes" class="w-full glass-input rounded-xl px-4 py-3 text-base md:text-sm font-black text-indigo-300 transition-colors" placeholder="Chọn hoặc nhập..."></div>
      <datalist id="pTypes"><option value="Sinh nhật"></option><option value="Ăn thường"></option><option value="Công quy"></option><option value="Tất niên"></option></datalist>
      <div class="space-y-1">
        <label class="text-[9px] font-black text-indigo-300/80 uppercase ml-1 tracking-wider">Số bàn / Khu vực <span class="text-red-400">*</span></label>
        <div class="flex gap-2">
          <select v-model="ui.tempTable.zone" class="w-1/3 glass-input rounded-xl px-1 py-1 text-base md:text-sm font-black transition-all uppercase text-center min-h-[44px]">
            <option v-for="z in ['A','B','C','D','E']" :key="z" :value="z" class="bg-slate-800 text-white">Khu {{ z }}</option>
          </select>
          <input type="number" v-model="ui.tempTable.number" @focus="handleInputFocus" @blur="handleInputBlur" class="w-2/3 glass-input rounded-xl px-4 py-3 text-base md:text-sm font-black transition-all" placeholder="Số bàn (1-50)">
        </div>
      </div>
    </div>
    <div class="space-y-1"><label class="text-[9px] font-black text-indigo-300/80 uppercase ml-1 tracking-wider">Ghi chú yêu cầu</label><textarea v-model="formStore.customer.note" @focus="handleInputFocus" @blur="handleInputBlur" class="w-full glass-input rounded-xl px-4 py-3 text-base md:text-sm font-medium resize-none transition-colors" rows="2" placeholder="VD: Trang trí sinh nhật, không lấy đá..."></textarea></div>
  </div>
</template>
