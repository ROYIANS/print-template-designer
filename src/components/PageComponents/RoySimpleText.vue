<!--
* @description RoySimpleText
* @filename RoySimpleText.vue
* @author ROYIANS
* @date 2022/10/20 11:24
!-->
<template>
  <StyledText v-bind="style" class="RoySimpleText" @dblclick="setEdit">
    <div
      ref="editArea"
      class="edit-area"
      :contenteditable="canEdit"
      :class="{ 'can-edit': canEdit }"
      tabindex="0"
      @paste="clearStyle"
      @mousedown="handleMousedown"
      @blur="handleBlur"
      v-html="propValue"
    ></div>
  </StyledText>
</template>

<script>
import { StyledText } from '@/components/PageComponents/style'
import commonMixin from '@/mixin/commonMixin'
import { mapState } from 'vuex'

/**
 *
 */
export default {
  name: 'RoySimpleText',
  mixins: [commonMixin],
  components: {
    StyledText
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
      this.selectText(this.$refs.editArea)
      // 聚焦
      this.$refs.editArea.focus()
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
        this.$store.commit('printTemplateModule/setPropValueOfOne', {
          id: this.element.id,
          propValue: this.$refs.editArea.innerHTML
        })
      }
    }
  }
}
</script>

<style lang="scss">
.RoySimpleText {
  .edit-area {
    display: table-cell;
    width: 100%;
    height: 100%;
    outline: none;
    word-break: break-all;
    padding: 4px;
  }
  .can-edit {
    height: 100%;
    cursor: text;
  }
}
</style>
