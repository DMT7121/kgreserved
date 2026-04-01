<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUIStore } from '@/stores/useUIStore'
import { useFormStore } from '@/stores/useFormStore'
import { useAppStore } from '@/stores/useAppStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useBillRender } from '@/composables/useBillRender'
import { useForm } from '@/composables/useForm'
import { formatVND } from '@/utils'

const ui = useUIStore()
const formStore = useFormStore()
const appStore = useAppStore()
const configStore = useConfigStore()
const { mobileScaleStyles, wrapperScaleStyles } = useBillRender()
const { depositTransferContent, qrImageUrl } = useForm()

const currentTimestamp = ref('')
setInterval(() => currentTimestamp.value = new Date().toLocaleString('vi-VN'), 1000)
</script>

<template>
  <!-- RIGHT PANEL (BILL PREVIEW) -->
  <div v-show="ui.tab === 'preview' || true" :class="['w-full md:w-7/12 overflow-y-auto bill-preview-wrapper', ui.tab !== 'preview' ? 'hidden md:block' : '']" class="custom-scrollbar">
    <div class="p-4 md:p-8">
      <!-- KDS Controls -->
      <div class="flex gap-2 mb-4 justify-center no-print">
        <button @click="formStore.billMode = 'full'" :class="['px-6 py-2 rounded-xl font-black text-xs uppercase transition-all min-h-[40px] active-effect', formStore.billMode === 'full' ? 'bg-white text-slate-800 shadow-lg' : 'bg-white/20 text-white/70 hover:bg-white/30']">Full Bill</button>
        <button @click="formStore.billMode = 'kitchen'" :class="['px-6 py-2 rounded-xl font-black text-xs uppercase transition-all min-h-[40px] active-effect', formStore.billMode === 'kitchen' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/20 text-white/70 hover:bg-white/30']">🔥 Bếp</button>
        <button @click="formStore.billMode = 'bar'" :class="['px-6 py-2 rounded-xl font-black text-xs uppercase transition-all min-h-[40px] active-effect', formStore.billMode === 'bar' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/20 text-white/70 hover:bg-white/30']">🍸 Quầy Bar</button>
      </div>

      <!-- Scaled wrapper -->
      <div :style="wrapperScaleStyles">
        <div id="bill-render" :style="mobileScaleStyles" class="bill-preview-container p-10 rounded-3xl relative">

          <!-- STAMP -->
          <div class="stamp-container">
            <div v-if="formStore.deposit.isPaid" class="stamp-box stamp-red"><div class="stamp-text">ĐÃ CỌC</div><div class="stamp-info">{{ formStore.deposit.time || 'N/A' }}</div></div>
            <div v-else class="stamp-box stamp-blue"><div class="stamp-text">CHỜ CỌC</div><div class="stamp-info">PENDING</div></div>
          </div>

          <!-- HEADER -->
          <div class="text-center mb-10">
            <div v-if="configStore.branding.logo" class="flex justify-center mb-4"><img :src="configStore.branding.logo" class="h-16 w-auto object-contain print-no-shadow" alt="Logo"></div>
            <h1 class="font-black tracking-widest text-slate-900 uppercase" style="font-family: 'Freeman', sans-serif;">KING'S GRILL</h1>
            <h2 class="font-bold tracking-[0.3em] text-slate-500 uppercase -mt-1" style="font-family: 'Freeman', sans-serif;">{{ formStore.previewTitle }}</h2>
            <div class="w-40 h-1 mx-auto mt-4 rounded-full" :style="{ backgroundColor: configStore.branding.color }"></div>
          </div>

          <!-- INFO CARD -->
          <div class="info-card">
            <div class="info-row"><span class="info-label">Khách hàng</span><span class="info-value font-black text-xl">{{ formStore.customer.name || '---' }}</span></div>
            <div class="info-row"><span class="info-label">SĐT/Zalo</span><span class="info-value highlight">{{ formStore.customer.phone || '---' }}</span></div>
            <div class="info-row"><span class="info-label">Thời gian</span><span class="info-value">{{ formStore.customer.time || '--:--' }} &mdash; {{ formStore.customer.date || 'dd/mm/yyyy' }}</span></div>
            <div class="info-row"><span class="info-label">Số khách</span><span class="info-value">{{ formStore.customer.pax || '0' }} người</span></div>
            <div class="info-row"><span class="info-label">Bàn</span><span class="info-value highlight">{{ formStore.customer.tables || '---' }}</span></div>
            <div class="info-row"><span class="info-label">Loại tiệc</span><span class="info-value">{{ formStore.customer.type || '---' }}</span></div>
            <div v-if="formStore.customer.note" class="info-row"><span class="info-label">Ghi chú</span><span class="info-value text-red-600 font-bold italic">{{ formStore.customer.note }}</span></div>
          </div>

          <!-- MENU TABLE -->
          <table class="bill-table">
            <thead><tr><th class="w-10 text-center">#</th><th>Tên món</th><th class="text-center w-16">SL</th><th class="text-right w-28">Đơn giá</th><th class="text-right w-32">Thành tiền</th></tr></thead>
            <tbody>
              <tr v-for="(item, i) in formStore.filteredBillItems" :key="i">
                <td class="text-center font-bold text-slate-400">{{ i + 1 }}</td>
                <td>
                  <div class="font-bold text-[15px]">{{ item.name || 'Chưa đặt tên' }}</div>
                  <div v-if="item.note" class="text-[12px] text-red-600 font-semibold mt-1 whitespace-pre-line italic leading-snug">{{ item.note }}</div>
                </td>
                <td class="text-center font-black text-lg">{{ item.qty }}</td>
                <td class="text-right font-bold text-slate-600 text-[14px]">{{ formatVND(item.price) }}</td>
                <td class="text-right font-black text-blue-700 text-[15px]">{{ formatVND(item.price * item.qty) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- TOTALS -->
          <div class="border-t-4 border-slate-900 pt-6 space-y-3 mb-10">
            <div class="flex justify-between items-center"><span class="text-lg font-bold text-slate-500 uppercase tracking-wider">Tạm tính</span><span class="text-xl font-black text-slate-700">{{ formatVND(formStore.calculatedTotals.sub) }}</span></div>
            <div v-if="formStore.taxEnabled" class="flex justify-between items-center"><span class="text-lg font-bold text-slate-500 uppercase tracking-wider">Thuế VAT</span><span class="text-xl font-black text-orange-600">{{ formatVND(formStore.calculatedTotals.tax) }}</span></div>
            <div class="flex justify-between items-center pt-4 border-t-2 border-dashed border-slate-200"><span class="text-2xl font-black text-slate-900 uppercase tracking-tighter">TỔNG CỘNG</span><span class="text-4xl font-black" :style="{ color: configStore.branding.color }">{{ formatVND(formStore.calculatedTotals.final) }}</span></div>
            <div class="flex justify-between items-center"><span class="text-lg font-bold uppercase tracking-wider" :class="formStore.deposit.isPaid ? 'text-emerald-600' : 'text-red-600'">{{ formStore.deposit.isPaid ? '✓ Đã đặt cọc' : '⏳ Yêu cầu đặt cọc' }}</span><span class="text-2xl font-black" :class="formStore.deposit.isPaid ? 'text-emerald-600' : 'text-red-600'">{{ formatVND(formStore.deposit.amount) }}</span></div>
          </div>

          <!-- QR BANK TRANSFER -->
          <div v-if="appStore.currentBank && !formStore.deposit.isPaid" class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 text-center mb-10">
            <h3 class="font-black text-lg text-blue-900 uppercase tracking-widest mb-6">THÔNG TIN CHUYỂN KHOẢN</h3>
            <div class="flex justify-center mb-6"><img :src="qrImageUrl" class="w-48 h-48 object-contain rounded-2xl shadow-xl border-4 border-white" alt="QR Code" crossorigin="anonymous"></div>
            <div class="space-y-3 text-left max-w-sm mx-auto">
              <div class="flex justify-between items-center py-2 border-b border-blue-100"><span class="text-sm font-bold text-blue-800 uppercase">Ngân hàng</span><span class="font-black text-blue-900 text-lg">{{ appStore.currentBank.name }}</span></div>
              <div class="flex justify-between items-center py-2 border-b border-blue-100"><span class="text-sm font-bold text-blue-800 uppercase">Số TK</span><span class="font-black text-blue-900 text-lg font-mono tracking-widest">{{ appStore.currentBank.number }}</span></div>
              <div class="flex justify-between items-center py-2 border-b border-blue-100"><span class="text-sm font-bold text-blue-800 uppercase">Chủ TK</span><span class="font-black text-blue-900 text-lg">{{ appStore.currentBank.owner }}</span></div>
              <div class="flex justify-between items-center py-2 border-b border-blue-100"><span class="text-sm font-bold text-blue-800 uppercase">Số tiền</span><span class="font-black text-red-600 text-xl">{{ formatVND(formStore.deposit.amount) }}</span></div>
              <div class="flex justify-between items-center py-2"><span class="text-sm font-bold text-blue-800 uppercase">Nội dung</span><span class="font-black text-indigo-600 text-sm">{{ depositTransferContent }}</span></div>
            </div>
          </div>

          <!-- DEPOSIT VERIFICATION IMAGE -->
          <div v-if="formStore.deposit.image" class="text-center mb-10">
            <h3 class="font-black text-sm text-slate-600 uppercase tracking-widest mb-4">BIÊN LAI CHUYỂN KHOẢN</h3>
            <img :src="formStore.deposit.image" class="max-h-64 mx-auto object-contain rounded-2xl shadow-xl border-4 border-white" crossorigin="anonymous" referrerpolicy="no-referrer">
          </div>

          <!-- FOOTER -->
          <div class="border-t-2 border-slate-100 pt-6 text-center space-y-2">
            <p class="text-xs text-slate-400 font-bold">Nhân viên: <span class="text-slate-600 font-black">{{ formStore.staff.name }}</span> &bull; {{ formStore.staff.phone }}</p>
            <p class="text-[10px] text-slate-300 font-mono">King's Grill Manager AI v1.8.6 | {{ currentTimestamp }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
