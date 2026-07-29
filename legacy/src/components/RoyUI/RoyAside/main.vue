<template>
  <aside :style="{ width }" class="roy-aside">
    <slot></slot>
  </aside>
</template>

<script>
export default {
  name: 'RoyAside',

  componentName: 'RoyAside',

  props: {
    width: {
      type: String,
      default: '300px'
    }
  }
}
</script>
