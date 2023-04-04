<template>
  <footer :style="{ height }" class="roy-footer">
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
