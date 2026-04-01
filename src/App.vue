<script setup lang="ts">
import { onMounted } from 'vue'
import { isIOS } from '@/utils'
import AppLayout from '@/components/core/AppLayout.vue'
import ToastSystem from '@/components/modals/ToastSystem.vue'

// Add iOS class
if (isIOS) document.documentElement.classList.add('is-ios')

onMounted(() => {
  const setAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
  }
  window.addEventListener('resize', setAppHeight)
  setAppHeight()
})
</script>

<template>
  <AppLayout />
  <ToastSystem />
</template>
