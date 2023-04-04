<script>
import { createEditor } from '@wangeditor/editor'

function genErrorInfo(fnName) {
  let info = `请使用 '@${fnName}' 事件，不要放在 props 中`
  info += `\nPlease use '@${fnName}' event instead of props`
  return info
}

export default {
  //【注意】单独写 <template>...</template> 时，rollup 打包完浏览器运行时报错，所以先在这里写 template
  render(h) {
    return h('div', { ref: 'box' })
  },
  name: 'WangEditor',
  data() {
    return {
      curValue: '',
      editor: null
    }
  },
  props: ['defaultContent', 'defaultConfig', 'mode', 'defaultHtml', 'value'], // value 用于自定义 v-model
  mounted() {
    this.create()
  },
  watch: {
    // 监听 'value' 属性变化 - value 用于自定义 v-model
    value(newVal) {
      const isEqual = newVal === this.curValue
      if (isEqual) {
        return
      } // 和当前内容一样，则忽略
      // 重置 HTML
      this.setHtml(newVal)
    }
  },
  methods: {
    // 重置 HTML
    setHtml(newHtml) {
      const editor = this.editor
      if (editor == null) {
        return
      }
      editor.setHtml(newHtml)
    },
    // 创建 editor
    create() {
      if (this.$refs.box == null) {
        return
      }
      const defaultConfig = this.defaultConfig || {}
      const defaultContent = JSON.stringify(
        Array.isArray(this.defaultContent) ? this.defaultContent : []
      )
      createEditor({
        selector: this.$refs.box,
        html: this.defaultHtml || this.value || '',
        config: {
          ...defaultConfig,
          onCreated: (editor) => {
            this.editor = Object.seal(editor) // 注意，一定要用 Object.seal() 否则会报错
            this.$emit('onCreated', editor)
            if (defaultConfig.onCreated) {
              const info = genErrorInfo('onCreated')
              throw new Error(info)
            }
          },
          onChange: (editor) => {
            const editorHtml = editor.getHtml()
            this.curValue = editorHtml // 记录当前 html 内容
            this.$emit('input', editorHtml) // 用于自定义 v-model
            this.$emit('onChange', editor)
            if (defaultConfig.onChange) {
              const info = genErrorInfo('onChange')
              throw new Error(info)
            }
          },
          onDestroyed: (editor) => {
            this.$emit('onDestroyed', editor)
            if (defaultConfig.onDestroyed) {
              const info = genErrorInfo('onDestroyed')
              throw new Error(info)
            }
          },
          onMaxLength: (editor) => {
            this.$emit('onMaxLength', editor)
            if (defaultConfig.onMaxLength) {
              const info = genErrorInfo('onMaxLength')
              throw new Error(info)
            }
          },
          onFocus: (editor) => {
            this.$emit('onFocus', editor)
            if (defaultConfig.onFocus) {
              const info = genErrorInfo('onFocus')
              throw new Error(info)
            }
          },
          onBlur: (editor) => {
            this.$emit('onBlur', editor)
            if (defaultConfig.onBlur) {
              const info = genErrorInfo('onBlur')
              throw new Error(info)
            }
          },
          customAlert: (info, type) => {
            this.$emit('customAlert', info, type)
            if (defaultConfig.customAlert) {
              const info = genErrorInfo('customAlert')
              throw new Error(info)
            }
          },
          customPaste: (editor, event) => {
            if (defaultConfig.customPaste) {
              const info = genErrorInfo('customPaste')
              throw new Error(info)
            }
            let res
            this.$emit('customPaste', editor, event, (val) => {
              res = val
            })
            return res
          }
        },
        content: JSON.parse(defaultContent),
        mode: this.mode || 'default'
      })
    }
  }
}
</script>
