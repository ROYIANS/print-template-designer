<!--/*-->
<!-- * @Author: ROYIANS-->
<!-- * @Date: 2022/10/18 9:12-->
<!-- * @Description: 文本-->
<!-- * @sign: 迷路，并无小路大路短路长路之区别。不能说在大路长路上迷路就不是迷路了。走在达不到目的的路上，就是迷路。-->
<!-- * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗-->
<!-- * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗-->
<!-- * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝-->
<!-- */-->
<template>
  <div
    style="width: 100%; height: 100%"
    @click="activeCell"
    @dblclick="onDblClick"
  >
    <RoyModal
      v-if="showEditor"
      :show.sync="showEditor"
      title="长文本编辑"
      height="70%"
      width="60%"
    >
      <div class="roy-wang-editor" @mousedown="handleMouseDown">
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="wangEditor"
          :defaultConfig="toolbarConfig"
        />
        <Editor
          v-model="html"
          style="height: 300px"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="onCreated"
        />
      </div>
    </RoyModal>
    <StyledText v-bind="style" v-html="propValue"></StyledText>
  </div>
</template>

<script>
import { StyledText } from '@/components/PageComponents/style'
import RoyModal from '@/components/RoyModal/RoyModal'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import {
  toolBarConfig,
  editorConfig,
  mode
} from '@/components/config/editorConfig'
import { mapState } from 'vuex'

export default {
  name: 'RoyTextInTable',
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
  components: {
    Editor,
    Toolbar,
    StyledText,
    RoyModal
  },
  computed: {
    ...mapState({
      curComponent: (state) => state.printTemplateModule.curComponent
    }),
    style() {
      return this.element.style || {}
    }
  },
  data() {
    return {
      wangEditor: null,
      showEditor: false,
      html: this.propValue,
      toolbarConfig: toolBarConfig,
      editorConfig: editorConfig,
      mode: mode
    }
  },
  methods: {
    activeCell() {
      this.$emit('activeCell', {
        id: this.element.id
      })
    },
    onCreated(editor) {
      this.wangEditor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    onDblClick() {
      this.showEditor = true
    },
    handleMouseDown(e) {
      e.stopPropagation()
    }
  },
  created() {},
  watch: {
    html() {
      this.$store.commit('printTemplateModule/updateDataValue', {
        data: this.element,
        value: this.html,
        key: 'propValue'
      })
      // this.$emit('update:propValue', this.html)
      this.$emit('componentUpdated', this.html)
    }
  },
  beforeDestroy() {
    const editor = this.wangEditor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  }
}
</script>
