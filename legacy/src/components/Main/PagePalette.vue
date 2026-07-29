<template>
  <div v-if="initCompleted" class="roy-page-tools">
    <div v-if="curActiveComponent && curActiveComponent.id">
      <roy-divider v-if="settingFormItemConfig.length" content-position="left">
        属性设置
      </roy-divider>
      <vxe-form
        ref="setting-form"
        :align="formGlobalConfigIn.align"
        :data="settingFormData"
        :items="settingFormItemConfig"
        :loading="formGlobalConfigIn.loading"
        :prevent-submit="formGlobalConfigIn.preventSubmit"
        :rules="{}"
        :size="formGlobalConfigIn.size"
        :span="formGlobalConfigIn.span"
        :title-align="formGlobalConfigIn.titleAlign"
        :title-colon="formGlobalConfigIn.titleColon"
        :title-overflow="formGlobalConfigIn.titleOverflow"
        :title-width="formGlobalConfigIn.titleWidth"
        :valid-config="formGlobalConfigIn.validConfig"
        sync-resize
      />
      <roy-divider content-position="left">样式设置</roy-divider>
      <vxe-form
        ref="paletteForm"
        :align="formGlobalConfigIn.align"
        :data="formData"
        :items="formItemConfig"
        :loading="formGlobalConfigIn.loading"
        :prevent-submit="formGlobalConfigIn.preventSubmit"
        :rules="{}"
        :size="formGlobalConfigIn.size"
        :span="formGlobalConfigIn.span"
        :title-align="formGlobalConfigIn.titleAlign"
        :title-colon="formGlobalConfigIn.titleColon"
        :title-overflow="formGlobalConfigIn.titleOverflow"
        :title-width="formGlobalConfigIn.titleWidth"
        :valid-config="formGlobalConfigIn.validConfig"
        sync-resize
      />
    </div>
    <div v-else class="roy-page-tools__empty animate__animated animate__headShake">
      <i class="ri-door-lock-box-line animate__backInUp" style="color: var(--roy-color-warning)" />
      <div>请先选定一个组件，再进行该组件的属性设置</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import commonMixin from '@/mixin/commonMixin'
import { paletteConfigList, settingConfigList } from '@/components/config/paletteConfig'

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
    settingFormItemConfig() {
      let curComponentCode = this.curActiveComponent?.component || 'no'
      return this.settingFormItemConfigs[curComponentCode] || []
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
      formItemConfigs: paletteConfigList,
      settingFormData: {},
      settingFormItemConfigs: settingConfigList
    }
  },
  methods: {},
  async mounted() {
    this.$nextTick(() => {
      this.initCompleted = true
    })
  },
  watch: {
    curActiveComponent: {
      handler() {
        if (this.curActiveComponent) {
          this.formData = this.curActiveComponent.style
          this.settingFormData = this.curActiveComponent
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
</style>
