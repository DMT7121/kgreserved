<script setup lang="ts">
import { ref } from 'vue'
import { useUIStore } from '@/stores/useUIStore'
import { useFormStore } from '@/stores/useFormStore'
import { useAppStore } from '@/stores/useAppStore'
import { useForm } from '@/composables/useForm'
import { formatVND } from '@/utils'

const ui = useUIStore()
const formStore = useFormStore()
const appStore = useAppStore()
const { handleInputFocus, handleInputBlur, addNewItem, onSearchInput, selectMenuItem, handleItemBlur, itemSuggestions } = useForm()

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(e: DragEvent, index: number) {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }
}

function onDrop(e: DragEvent, index: number) {
  e.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const items = formStore.items
    const draggedItem = items.splice(draggedIndex.value, 1)[0]
    items.splice(index, 0, draggedItem)
  }
  draggedIndex.value = null
  dragOverIndex.value = null
}

function swapItem(idx1: number, idx2: number) {
  if (idx2 < 0 || idx2 >= formStore.items.length) return
  const items = formStore.items
  const temp = items[idx1]
  items[idx1] = items[idx2]
  items[idx2] = temp
}
</script>

<template>
  <div class="glass-panel rounded-3xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
    <div class="flex justify-between items-center mb-6">
      <h3 class="font-black text-white text-[10px] uppercase tracking-widest flex items-center gap-2">
        <span class="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[11px] shadow-[0_0_10px_rgba(99,102,241,0.5)]">{{ formStore.items.length }}</span>
        <span>Danh sách món gọi</span>
        <span class="text-[9px] glass-input px-2 py-0.5 rounded-full text-indigo-300 font-bold uppercase">{{ appStore.activeSheet }}</span>
      </h3>
    </div>
    <div class="space-y-4">
      <div v-for="(item, index) in formStore.items" :key="index" 
           draggable="true"
           @dragstart="onDragStart($event, index)"
           @dragover.prevent="dragOverIndex = index"
           @dragleave="dragOverIndex = null"
           @drop="onDrop($event, index)"
           @dragend="draggedIndex = null; dragOverIndex = null"
           :class="[
             'relative glass-input bg-[rgba(15,23,42,0.4)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 shadow-sm hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:border-[rgba(255,255,255,0.1)] transition-all cursor-grab active:cursor-grabbing',
             draggedIndex === index ? 'opacity-40 scale-[0.98]' : '',
             dragOverIndex === index && draggedIndex !== index ? 'border-t-4 border-t-indigo-500 pt-6 scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.3)]' : ''
           ]">
        <div class="flex flex-col gap-4">
          <!-- Name & Suggestions (with Drag/Move helpers) -->
          <div class="relative w-full flex items-center gap-3">
            <div class="flex flex-col gap-1 p-2 bg-[rgba(15,23,42,0.6)] rounded-xl text-slate-400 border border-[rgba(255,255,255,0.05)] -ml-2">
              <button @click="swapItem(index, index - 1)" :disabled="index === 0" class="hover:text-indigo-400 disabled:opacity-20 active:scale-90 transition-transform"><i class="fa-solid fa-chevron-up"></i></button>
              <button @click="swapItem(index, index + 1)" :disabled="index === formStore.items.length - 1" class="hover:text-indigo-400 disabled:opacity-20 active:scale-90 transition-transform"><i class="fa-solid fa-chevron-down"></i></button>
            </div>
            
            <div class="relative flex-grow">
              <input v-model="item.name" @input="onSearchInput(index)" @blur="handleItemBlur" @focus="handleInputFocus" class="w-full font-black text-white bg-transparent text-base md:text-sm border-b-2 border-[rgba(255,255,255,0.1)] focus:border-indigo-500 outline-none pb-2 uppercase placeholder-slate-500 transition-colors" placeholder="NHẬP TÊN MÓN...">
              <ul v-if="ui.focusIdx === index && itemSuggestions.length > 0" class="absolute top-full left-0 right-0 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto z-50 mt-2 p-2 scroll-smooth">
                <li v-for="s in itemSuggestions" :key="s.id" @mousedown.prevent="selectMenuItem(s, index)" class="p-3 hover:bg-[rgba(99,102,241,0.2)] cursor-pointer flex justify-between rounded-xl transition-colors border-b border-[rgba(255,255,255,0.05)] last:border-0 min-h-[44px]">
                  <span class="font-black text-slate-200 text-sm uppercase">{{ s.name }}</span>
                  <span class="text-[11px] text-indigo-400 font-black tracking-tighter">{{ formatVND(s.price) }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Note -->
          <div class="w-full">
            <textarea v-model="item.note" @focus="handleInputFocus" @blur="handleInputBlur"
              :rows="item.note ? Math.min(item.note.split('\n').length + 1, 8) : 1"
              class="w-full text-[13px] text-orange-400 font-semibold bg-[rgba(15,23,42,0.3)] rounded-lg p-3 border border-[rgba(255,255,255,0.05)] focus:border-indigo-500/50 outline-none resize-none transition-all font-sans leading-snug placeholder-slate-600"
              placeholder="Ghi chú / Thành phần set..."></textarea>
          </div>

          <!-- Qty, Price, Delete -->
          <div class="flex gap-4 items-center justify-end">
            <div class="flex items-center gap-2 bg-[rgba(15,23,42,0.5)] p-1.5 rounded-xl border border-[rgba(255,255,255,0.05)] flex-grow md:flex-grow-0 justify-center shadow-inner">
              <input type="number" v-model="item.qty" @focus="handleInputFocus" @blur="handleInputBlur" class="w-12 text-center font-black border-none bg-transparent text-white text-base md:text-sm outline-none placeholder-slate-600" placeholder="SL">
              <div class="h-6 w-[1px] bg-[rgba(255,255,255,0.1)]"></div>
              <input type="number" v-model="item.price" @focus="handleInputFocus" @blur="handleInputBlur" class="w-28 text-right font-black text-indigo-300 bg-transparent text-base md:text-sm outline-none placeholder-slate-600" placeholder="Giá">
            </div>
            <button @click="formStore.items.splice(index, 1)" class="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors p-3 rounded-xl min-w-[44px] flex items-center justify-center border border-red-500/20 hover:border-red-500"><i class="fa-solid fa-trash-can text-lg"></i></button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ADD BUTTON MOVED HERE -->
    <button @click="addNewItem" class="mt-5 w-full glass-input border-2 border-dashed border-[rgba(255,255,255,0.2)] text-indigo-300 py-4 rounded-2xl font-black hover:bg-[rgba(99,102,241,0.1)] hover:border-[rgba(99,102,241,0.4)] transition active:scale-95 uppercase tracking-widest min-h-[50px] active-effect hover-effect flex items-center justify-center gap-2">
      <i class="fa-solid fa-plus text-lg"></i> THÊM MÓN MỚI
    </button>

    <!-- TAX CONFIG -->
    <div class="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4 flex justify-between items-center px-2">
      <label class="flex items-center cursor-pointer select-none min-h-[44px]">
        <div class="relative">
          <input type="checkbox" v-model="formStore.taxEnabled" class="sr-only toggle-checkbox">
          <div class="block bg-slate-700 w-10 h-6 rounded-full transition-colors border border-slate-600"></div>
          <div class="dot absolute left-1 top-1 bg-slate-300 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out transform shadow-sm" :class="{'translate-x-4 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]': formStore.taxEnabled}"></div>
        </div>
        <span class="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bao gồm VAT (8% - 10%)</span>
      </label>
      <div class="text-sm font-black text-indigo-300" v-if="formStore.taxEnabled">{{ formatVND(formStore.calculatedTotals.tax) }}</div>
    </div>
  </div>
</template>
