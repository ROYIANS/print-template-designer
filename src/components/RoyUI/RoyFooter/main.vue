<template>
  <footer class="roy-footer" :style="{ height }">
    <slot></slot>
  </footer>
</template>

<script>
export default {
  name: 'RoyFooter',

  componentName: 'RoyFooter',

  props: {
    height: {
      type: String,
      default: '60px'
    }
  }
}
</script>
