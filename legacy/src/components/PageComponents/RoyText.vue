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
  <div style="width: 100%; height: 100%" @dblclick="onDblClick">
    <RoyModal
      v-if="showEditor"
      :show.sync="showEditor"
      height="70%"
      title="长文本编辑"
      width="60%"
      @close="handleTextClosed"
    >
      <div class="roy-wang-editor" @mousedown="handleMouseDown">
        <WangToolbar
          :defaultConfig="toolbarConfig"
          :editor="wangEditor"
          style="border-bottom: 1px solid #ccc"
        />
        <WangEditor
          v-model="html"
          :defaultConfig="editorConfig"
          :mode="mode"
          style="height: 300px"
          @onCreated="onCreated"
        />
      </div>
    </RoyModal>
    <StyledText v-bind="style">
      <div class="roy-text-inner" v-html="propValue"></div>
    </StyledText>
  </div>
</template>

<script>
import { StyledText } from '@/components/PageComponents/style'
import RoyModal from '@/components/RoyModal/RoyModal'
import WangToolbar from '@/components/PageComponents/WangEditorVue/WangToolbar'
import WangEditor from '@/components/PageComponents/WangEditorVue/WangEditor'
import { toolBarConfig, editorConfig, mode } from '@/components/config/editorConfig'
import commonMixin from '@/mixin/commonMixin'
import { mapState } from 'vuex'

export default {
  name: 'RoyText',
  mixins: [commonMixin],
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
    WangEditor,
    WangToolbar,
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
      html: this.deepCopy(this.propValue),
      toolbarConfig: toolBarConfig,
      editorConfig: editorConfig,
      mode: mode
    }
  },
  methods: {
    onCreated(editor) {
      this.wangEditor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    onBlur() {
      this.$store.commit('printTemplateModule/setPropValue', {
        id: this.element.id,
        propValue: this.html
      })
    },
    onDblClick() {
      this.showEditor = true
    },
    handleMouseDown(e) {
      e.stopPropagation()
    },
    handleTextClosed() {
      this.onBlur()
    }
  },
  created() {},
  watch: {},
  beforeDestroy() {
    const editor = this.wangEditor
    if (editor == null) {
      return
    }
    editor.destroy() // 组件销毁时，及时销毁编辑器
  }
}
</script>
