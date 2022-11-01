<template>
  <div class="roy-page-tools">
    <div v-if="curComponent && curComponent.id">
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

export default {
  name: 'PagePalette',
  mixins: [commonMixin],
  computed: {
    ...mapState({
      curComponent: (state) => state.printTemplateModule.curComponent
    }),
    formItemConfig() {
      let curComponentCode = this.curComponent?.component || 'no'
      return this.formItemConfigs[curComponentCode] || []
    }
  },
  data() {
    return {
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
      formItemConfigs: {
        RoyText: [
          {
            title: '坐标-X',
            field: 'left',
            align: 'left',
            span: 24,
            itemRender: {
              name: '$input',
              props: {
                type: 'number',
                size: 'mini'
              }
            }
          },
          {
            title: '坐标-Y',
            field: 'top',
            span: 24,
            itemRender: {
              name: '$input',
              props: {
                type: 'number',
                size: 'mini'
              }
            }
          },
          {
            title: '宽度',
            field: 'width',
            align: 'left',
            span: 24,
            itemRender: {
              name: '$input',
              props: {
                type: 'number',
                size: 'mini'
              }
            }
          },
          {
            title: '高度',
            field: 'height',
            span: 24,
            itemRender: {
              name: '$input',
              props: {
                type: 'number',
                size: 'mini'
              }
            }
          }
        ],
        RoySimpleText: [
          {
            title: '坐标-X',
            field: 'left',
            span: 24,
            itemRender: {
              name: '$input',
              props: {
                type: 'number',
                size: 'mini'
              }
            }
          },
          {
            title: '坐标-Y',
            field: 'top',
            span: 24,
            itemRender: {
              name: '$input',
              props: {
                type: 'number',
                size: 'mini'
              }
            }
          },
          {
            title: '水平对齐方式',
            field: 'justifyContent',
            span: 24,
            itemRender: {
              name: '$radio',
              options: [
                {
                  label: '居左',
                  value: 'flex-start'
                },
                {
                  label: '居中',
                  value: 'center'
                },
                {
                  label: '居右',
                  value: 'flex-end'
                }
              ]
            }
          },
          {
            title: '垂直对齐方式',
            field: 'alignItems',
            span: 24,
            itemRender: {
              name: '$radio',
              options: [
                {
                  label: '居上',
                  value: 'flex-start'
                },
                {
                  label: '居中',
                  value: 'center'
                },
                {
                  label: '居下',
                  value: 'flex-end'
                }
              ]
            }
          }
        ]
      }
    }
  },
  mounted() {},
  watch: {
    curComponent: {
      handler() {
        if (this.curComponent) {
          this.formData = this.curComponent.style
        }
      },
      deep: true
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
}
</style>
