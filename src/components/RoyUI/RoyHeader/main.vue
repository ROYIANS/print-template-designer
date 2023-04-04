<template>
  <header class="roy-header" :style="{ height }">
    <slot></slot>
  </header>
</template>

<script>
export default {
  name: 'RoyHeader',

  componentName: 'RoyHeader',

  props: {
    height: {
      type: String,
      default: '60px'
    }
  }
}
</script>
