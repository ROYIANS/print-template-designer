<template>
  <div v-if="initCompleted" class="roy-page-tools">
    <div v-if="curActiveComponent && curActiveComponent.id">
      <vxe-form
        ref="form"
        sync-resize
        :title-overflow="formGlobalConfigIn.titleOverflow"
        :data="formData"
        :items="formItemConfig"
        :rules="{}"
        :span="formGlobalConfigIn.span"
        :align="formGlobalConfigIn.align"
        :valid-config="formGlobalConfigIn.validConfig"
        :size="formGlobalConfigIn.size"
        :title-align="formGlobalConfigIn.titleAlign"
        :title-width="formGlobalConfigIn.titleWidth"
        :title-colon="formGlobalConfigIn.titleColon"
        :prevent-submit="formGlobalConfigIn.preventSubmit"
        :loading="formGlobalConfigIn.loading"
      />
    </div>
    <div
      v-else
      class="roy-page-tools__empty animate__animated animate__headShake"
    >
      <i
        class="ri-door-lock-box-line animate__backInUp"
        style="color: var(--roy-color-warning)"
      />
      <div>请先选定一个组件，再进行该组件的属性设置</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import commonMixin from '@/mixin/commonMixin'
import { renderers } from '@/components/config/renderers'
import { paletteConfigList } from '@/components/config/paletteConfig'

export default {
  name: 'PagePalette',
  mixins: [commonMixin],
  computed: {
    ...mapState({
      curComponent: (state) => state.printTemplateModule.curComponent,
      curTableCell: (state) => state.printTemplateModule.curTableCell
    }),
    formItemConfig() {
      let curComponentCode = this.curActiveComponent?.component || 'no'
      return this.formItemConfigs[curComponentCode] || []
    },
    curActiveComponent() {
      return this.curTableCell || this.curComponent
    }
  },
  data() {
    return {
      initCompleted: false,
      formGlobalConfigIn: {
        titleOverflow: true,
        span: 8,
        align: 'left',
        size: 'medium',
        titleAlign: 'right',
        titleWidth: '200',
        titleColon: false,
        preventSubmit: false,
        loading: false,
        validConfig: {
          autoPos: true
        }
      },
      formData: {},
      formItemConfigs: paletteConfigList
    }
  },
  methods: {
    async registerTableRender(renderers) {
      // 注册渲染器
      for (let i in renderers) {
        this.$VXETable.renderer.add(i, renderers[i])
      }
    }
  },
  async mounted() {
    await this.registerTableRender(renderers)
    this.$nextTick(() => {
      this.initCompleted = true
    })
  },
  watch: {
    curActiveComponent: {
      handler() {
        if (this.curActiveComponent) {
          this.formData = this.curActiveComponent.style
        }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.roy-page-tools {
  overflow: auto;
  height: calc(100% - 16px);
  padding: 8px;

  .roy-page-tools__empty {
    font-size: 10px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: row wrap;

    i {
      font-size: 28px;
      width: 100%;
      align-self: end;
      text-align: center;
    }

    div {
      text-align: center;
    }
  }
}
</style>

<style lang="scss">
.roy-page-tools {
  .vxe-form.size--medium .vxe-form--item-inner {
    display: grid;
  }
  .vxe-form--item-title {
    font-size: 10px;
    text-align: left !important;
    margin-bottom: 5px;
    .vxe-form--item-title-label:before {
      content: '';
      width: 1px;
      height: 80%;
      margin-right: 5px;
      border-left: var(--roy-color-primary) 3px solid;
    }
  }
  .vxe-form--item {
    float: inherit !important;
  }
  .vxe-input--inner {
    border-radius: unset;
    background: transparent;
    color: var(--roy-text-color-primary);
    border-color: var(--roy-border-color);
  }
}

.roy-btn-radio-group {
  .roy-btn-radio-group__btn {
    background: var(--roy-bg-color-page);
    height: 24px;
    width: 24px;
    font-size: 14px;
    line-height: 24px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
      color: #ffffff !important;
      background: var(--roy-color-primary-light-3);
    }
    & + .roy-btn-radio-group__btn {
      margin-left: 5px;
    }
    &.roy-btn-radio-group__btn--active {
      background: var(--roy-color-primary);
      color: #fff;
    }
  }
}

.roy-color-picker {
  width: 100%;

  .el-color-picker__color {
    border-radius: 0;
  }
  .el-color-picker__trigger {
    padding: 0;
    margin: 0;
    width: 100% !important;
    border: none;
    border-radius: unset;
  }
}
</style>
