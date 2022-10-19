<template>
  <li v-if="divider" class="roy-context-divider"></li>

  <li
    v-else
    :class="classname"
    @click="handleClick"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <slot></slot>
  </li>
</template>

<script>
export default {
  name: 'ContextItem',

  inject: ['$$contextmenu'],

  props: {
    divider: Boolean,
    disabled: Boolean,
    autoHide: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      hover: false
    }
  },
  computed: {
    classname() {
      return {
        'roy-context-item': !this.divider,
        'roy-context-item--hover': this.hover,
        'roy-context-item--disabled': this.disabled
      }
    }
  },

  methods: {
    handleMouseenter(event) {
      if (this.disabled) {
        return
      }

      this.hover = true

      this.$emit('mouseenter', this, event)
    },
    handleMouseleave(event) {
      if (this.disabled) {
        return
      }

      this.hover = false

      this.$emit('mouseleave', this, event)
    },

    handleClick(event) {
      if (this.disabled) {
        return
      }

      this.$emit('click', this, event)

      this.autoHide && this.$$contextmenu.hide()
    }
  }
}
</script>
