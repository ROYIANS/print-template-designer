<template functional>
  <div
    :class="[data.staticClass, 'roy-divider', `roy-divider--${props.direction}`]"
    v-bind="data.attrs"
    v-on="listeners"
  >
    <div
      v-if="slots().default && props.direction !== 'vertical'"
      :class="['roy-divider__text', `is-${props.contentPosition}`]"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoyDivider',
  props: {
    direction: {
      type: String,
      default: 'horizontal',
      validator(val) {
        return ['horizontal', 'vertical'].indexOf(val) !== -1
      }
    },
    contentPosition: {
      type: String,
      default: 'center',
      validator(val) {
        return ['left', 'center', 'right'].indexOf(val) !== -1
      }
    }
  }
}
</script>
