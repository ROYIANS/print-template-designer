<script setup lang="ts">
// See vite.config.ts for details about automatic imports
import PtdDesigner from '@/components/designer/designer.vue'

const store = useStore()
console.log(store)
</script>
<template>
  <ptd-designer />
</template>
