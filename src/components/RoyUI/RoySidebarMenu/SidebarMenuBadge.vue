<template>
  <component
    :is="badge.element ? badge.element : 'span'"
    :class="badge.class"
    class="vsm--badge"
    v-bind="badge.attributes"
  >
    {{ badge.text }}
  </component>
</template>

<script>
export default {
  name: 'SidebarMenuBadge',
  props: {
    badge: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
