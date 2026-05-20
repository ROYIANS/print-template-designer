<script>
import { createToolbar, DomEditor } from '@wangeditor/editor'

export default {
  name: 'WangToolbar',
  render(h) {
    return h('div', { ref: 'box' })
  },
  props: ['editor', 'defaultConfig', 'mode'],
  methods: {
    // 创建 toolbar
    create(editor) {
      if (this.$refs.box == null) {
        return
      }
      if (editor == null) {
        return
      }
      if (DomEditor.getToolbar(editor)) {
        return
      } // 不重复创建
      createToolbar({
        editor,
        selector: this.$refs.box,
        config: this.defaultConfig || {},
        mode: this.mode || 'default'
      })
    }
  },
  watch: {
    editor: {
      handler(e) {
        if (e == null) {
          return
        }
        this.create(e)
      },
      immediate: true
    }
  }
}
</script>
