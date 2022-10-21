<!--
* @description RoySimpleText
* @filename RoySimpleText.vue
* @author ROYIANS
* @date 2022/10/20 11:24
!-->
<template>
  <div
    style="width: 100%; height: 100%"
    class="RoySimpleText"
    @dblclick="setEdit"
  >
    <StyledSimpleText
      ref="editArea"
      class="edit-area"
      v-bind="style"
      :contenteditable="canEdit"
      :class="{ 'can-edit': canEdit }"
      tabindex="0"
      @paste="clearStyle"
      @mousedown="handleMousedown"
      @blur="handleBlur"
      v-html="propValue"
    ></StyledSimpleText>
  </div>
</template>

<script>
import { StyledSimpleText } from '@/components/PageComponents/style'
import commonMixin from '@/mixin/commonMixin'
import { mapState } from 'vuex'

/**
 *
 */
export default {
  name: 'RoySimpleText',
  mixins: [commonMixin],
  components: {
    StyledSimpleText
  },
  props: {
    element: {
      type: Object,
      default: () => {}
    },
    propValue: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState({
      curComponent: (state) => state.printTemplateModule.curComponent
    }),
    style() {
      return this.element.style || {}
    },
    mayEdit() {
      return this.curComponent?.id === this.element?.id
    }
  },
  data() {
    return {
      canEdit: false
    }
  },
  methods: {
    initMounted() {},
    setEdit() {
      if (this.element.isLock) {
        return
      }
      this.canEdit = true
      // 全选
      this.selectText(this.$refs.editArea.$el)
      // 聚焦
      this.$refs.editArea.$el.focus()
    },
    selectText(element) {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(element)
      selection.removeAllRanges()
      selection.addRange(range)
    },
    handleBlur() {
      this.canEdit = false
    },
    handleMousedown(e) {
      if (this.canEdit) {
        e.stopPropagation()
      }
    },
    handleMouseDown(e) {
      if (this.canEdit) {
        e.stopPropagation()
      }
    },
    clearStyle(e) {
      e.preventDefault()
      const clp = e.clipboardData
      const text = clp.getData('text/plain') || ''
      if (text !== '') {
        document.execCommand('insertText', false, text)
      }

      this.$emit('input', this.element, e.target.innerHTML)
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {
    mayEdit(newVal) {
      if (!newVal) {
        this.canEdit = false
      }
    },
    canEdit(newVal) {
      if (!newVal) {
        this.$store.commit('printTemplateModule/setPropValue', {
          id: this.element.id,
          propValue: this.$refs.editArea.$el.innerHTML
        })
      }
    }
  }
}
</script>

<style lang="scss">
.RoySimpleText {
  .edit-area {
    width: 100%;
    height: 100%;
    outline: none;
    word-break: break-all;
  }
  .can-edit {
    height: 100%;
    cursor: text;
  }
}
</style>
