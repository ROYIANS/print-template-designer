<!--
* @description RoySimpleText
* @filename RoySimpleText.vue
* @author ROYIANS
* @date 2022/10/20 11:24
!-->
<template>
  <div
    class="RoySimpleText"
    style="width: 100%; height: 100%"
    @click="setEdit"
    @contextmenu="setEdit"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <StyledSimpleText
      ref="editArea"
      :class="{
        'can-edit': canEdit,
        'is-drag-over': dragOver
      }"
      :contenteditable="canEdit"
      class="edit-area"
      tabindex="0"
      v-bind="style"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @mousedown="handleMouseDown"
      @paste="clearStyle"
    >
      <div class="roy-simple-text-inner" v-html="propValue"></div>
    </StyledSimpleText>
  </div>
</template>

<script>
import { StyledSimpleText } from '@/components/PageComponents/style'
import commonMixin from '@/mixin/commonMixin'
import { mapState } from 'vuex'
import toast from '@/utils/toast'

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
    },
    bindValue: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapState({
      curComponent: (state) => state.printTemplateModule.curComponent,
      dataSource: (state) => state.printTemplateModule.dataSource
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
      canEdit: false,
      dragOver: false
    }
  },
  methods: {
    initMounted() {},
    setEdit() {
      if (this.canEdit) {
        return
      }
      if (this.bindValue) {
        return
      }
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
    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()

      this.dragOver = false

      const index = e.dataTransfer.getData('datasource-index')
      if (index) {
        let bindingDataSource = this.dataSource[index]
        if (bindingDataSource) {
          this.$store.commit('printTemplateModule/setBindValue', {
            id: this.element.id,
            bindValue: bindingDataSource
          })
          this.$store.commit('printTemplateModule/setPropValue', {
            id: this.element.id,
            propValue: `<span class="roy-binding-value">[绑定:${bindingDataSource.title}]</span>`
          })
          this.canEdit = false
        }
      } else {
        toast('拖拽元素非数据源元素，此次拖拽无效', 'info')
      }
    },
    handleBlur() {
      this.canEdit = false
    },
    handleMouseDown(e) {
      if (this.canEdit) {
        e.stopPropagation()
      }
    },
    handleKeyDown(e) {
      if (this.canEdit && [13].includes(e.keyCode)) {
        e.preventDefault()
        document.execCommand('insertLineBreak')
        return false
      }
    },
    clearStyle(e) {
      this.$emit('input', this.element, e.target.innerHTML)
    },
    handleDragEnter() {
      this.dragOver = true
    },
    handleDragLeave() {
      this.dragOver = false
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

  .is-drag-over {
    border: 2px solid var(--roy-color-warning);
    background: #cccccc;
  }

  .can-edit {
    height: 100%;
    cursor: text;
  }
}
</style>
