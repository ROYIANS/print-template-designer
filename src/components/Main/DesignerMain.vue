<!--
* @description 主操作视图
* @filename DesignerMain.vue
* @author ROYIANS
* @date 2022/9/13 9:36
!-->
<template>
  <section class="height-all">
    <ToolBar>
      <template v-slot:roy-designer-toolbar-slot>
        <slot name="roy-designer-toolbar-slot"></slot>
      </template>
    </ToolBar>
    <div
      @dragover="handleDragOver"
      @drop="handleDrop"
      @mousedown="handleMouseDown"
      @mouseup="deselectCurComponent"
    >
      <Editor :show-right="showRight" />
    </div>
  </section>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import ToolBar from '@/components/ToolBar/ToolBar.vue'
import Editor from '@/components/Editor/Editor.vue'
import { componentList } from '@/components/config/componentList'
import { mapState } from 'vuex'
import toast from '@/utils/toast'

/**
 * 主操作视图
 */
export default {
  name: 'DesignerMain',
  mixins: [commonMixin],
  components: {
    ToolBar,
    Editor
  },
  props: {
    showRight: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      isClickComponent: (state) => state.printTemplateModule.isClickComponent
    })
  },
  methods: {
    initMounted() {},
    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()

      const index = e.dataTransfer.getData('code')
      const rectInfo = document.querySelector('#designer-page').getBoundingClientRect()
      if (index) {
        const component = this.deepCopy(
          componentList.find((item) => {
            return item.code === index
          })
        )
        component.style = component.style || {}
        component.style.top = e.clientY - rectInfo.y
        component.style.left = e.clientX - rectInfo.x
        component.id = this.getUuid()
        component.label = `${component.name}-${component.id}`

        // 根据画面比例修改组件样式比例 https://github.com/woai3c/visual-drag-demo/issues/91
        // changeComponentSizeWithScale(component);

        this.$store.commit('printTemplateModule/addComponent', { component })
        this.$store.commit('printTemplateModule/recordSnapshot')
      } else {
        toast('拖拽元素非页面组件，此次拖拽无效', 'info')
      }
    },

    handleDragOver(e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },

    handleMouseDown(e) {
      e.stopPropagation()
      this.$store.commit('printTemplateModule/setClickComponentStatus', false)
      this.$store.commit('printTemplateModule/setInEditorStatus', true)
    },

    deselectCurComponent() {
      if (!this.isClickComponent) {
        this.$store.commit('printTemplateModule/setCurComponent', {
          component: null,
          index: null
        })
        this.$store.commit('printTemplateModule/setComponentsCount')
      }
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>
