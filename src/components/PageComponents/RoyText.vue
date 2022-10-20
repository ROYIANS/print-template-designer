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
  <StyledText v-bind="style" @dblclick="onDblClick">
    <RoyModal :show.sync="showEditor">
      <div
        class="roy-wang-editor"
        :style="`transform:rotate(${-style.rotate}deg)`"
        @mousedown="handleMouseDown"
      >
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
          @onBlur="onBlur"
        />
      </div>
    </RoyModal>
    <div v-html="propValue"></div>
  </StyledText>
</template>

<script>
import { StyledText } from '@/components/PageComponents/style'
import RoyModal from '@/components/RoyModal/RoyModal'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { mapState } from 'vuex'

export default {
  name: 'RoyText',
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
      toolbarConfig: {
        toolbarKeys: [
          'bold',
          'underline',
          'italic',
          'through',
          'sub',
          'sup',
          'clearStyle',
          'color',
          'bgColor',
          'fontSize',
          'fontFamily',
          'indent',
          'delIndent',
          'justifyLeft',
          'justifyRight',
          'justifyCenter',
          'justifyJustify',
          'lineHeight',
          'divider',
          'headerSelect',
          'header1',
          'header2',
          'header3',
          'header4',
          'header5',
          'undo',
          'redo',
          'enter',
          'bulletedList',
          'numberedList',
          'fullScreen'
        ]
      },
      editorConfig: {
        placeholder: '请输入内容...',
        scroll: true,
        autoFocus: true,
        MENU_CONF: {
          fontFamily: {
            fontFamilyList: [
              '黑体',
              '楷体',
              '仿宋',
              'Arial',
              'Tahoma',
              'Verdana'
            ]
          },
          fontSize: {
            fontSizeList: [
              '10pt',
              '12pt',
              '13pt',
              '14pt',
              '15pt',
              '16pt',
              '19pt',
              '22pt',
              '24pt',
              '29pt',
              '32pt',
              '40pt',
              '48pt'
            ]
          }
        }
      },
      mode: 'simple' // or 'default'
    }
  },
  methods: {
    onCreated(editor) {
      this.wangEditor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    onBlur() {
      this.$store.commit('printTemplateModule/setPropValue', this.html)
    },
    onDblClick() {
      this.showEditor = true
    },
    handleMouseDown(e) {
      e.stopPropagation()
    }
  },
  created() {},
  watch: {},
  beforeDestroy() {
    const editor = this.wangEditor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  }
}
</script>
