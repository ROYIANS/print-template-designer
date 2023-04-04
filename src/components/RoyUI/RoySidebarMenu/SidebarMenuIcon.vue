<template>
  <component
    :is="icon.element ? icon.element : 'i'"
    :class="typeof icon === 'string' || icon instanceof String ? icon : icon.class"
    class="vsm--icon"
    v-bind="icon.attributes"
  >
    {{ icon.text }}
  </component>
</template>

<script>
export default {
  name: 'SidebarMenuIcon',
  props: {
    icon: {
      type: [String, Object],
      default: ''
    }
  }
}
</script>
