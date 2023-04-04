<!--
* @description 全局设置
* @filename GlobalSetting.vue
* @author ROYIANS
* @date 2022/9/26 15:11
!-->
<template>
  <roy-main class="roy-designer-global">
    <vxe-form
      ref="global-setting-form"
      sync-resize
      :title-overflow="formGlobalConfigIn.titleOverflow"
      :data="globalSettingConfig"
      :items="globalSettingItem"
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
    <roy-row class="roy-designer-global__pages">
      <roy-col :span="24" class="roy-designer-global__title">纸张大小:</roy-col>
      <roy-col :span="24">
        <div class="roy-designer-global__pages__container">
          <div
            v-for="page in Object.values(pages)"
            :key="page.name"
            :class="
              currentPage === page.name
                ? 'roy-designer-global__pages__item--active'
                : ''
            "
            class="roy-designer-global__pages__item"
            @click="currentPage = page.name"
          >
            {{ page.name }}
          </div>
        </div>
      </roy-col>
    </roy-row>
  </roy-main>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { mapActions, mapState } from 'vuex'

/**
 * GlobalSetting
 */
export default {
  name: 'GlobalSetting',
  mixins: [commonMixin],
  components: {},
  props: {},
  data() {
    return {
      pages: {
        // A1: {
        //   name: 'A1',
        //   w: 594,
        //   h: 841
        // },
        // A2: {
        //   name: 'A2',
        //   w: 420,
        //   h: 594
        // },
        A3: {
          name: 'A3',
          w: 297,
          h: 420
        },
        A4: {
          name: 'A4',
          w: 210,
          h: 297
        },
        A5: {
          name: 'A5',
          w: 148,
          h: 210
        },
        A6: {
          name: 'A6',
          w: 105,
          h: 148
        },
        A7: {
          name: 'A7',
          w: 74,
          h: 105
        },
        // B1: {
        //   name: 'B1',
        //   w: 707,
        //   h: 1000
        // },
        // B2: {
        //   name: 'B2',
        //   w: 500,
        //   h: 707
        // },
        B3: {
          name: 'B3',
          w: 353,
          h: 500
        },
        B4: {
          name: 'B4',
          w: 250,
          h: 353
        },
        B5: {
          name: 'B5',
          w: 176,
          h: 250
        },
        B6: {
          name: 'B6',
          w: 125,
          h: 176
        },
        B7: {
          name: 'B7',
          w: 88,
          h: 125
        },
        // C1: {
        //   name: 'C1',
        //   w: 648,
        //   h: 917
        // },
        // C2: {
        //   name: 'C2',
        //   w: 458,
        //   h: 648
        // },
        C3: {
          name: 'C3',
          w: 324,
          h: 458
        },
        C4: {
          name: 'C4',
          w: 229,
          h: 324
        },
        C5: {
          name: 'C5',
          w: 162,
          h: 229
        },
        C6: {
          name: 'C6',
          w: 114,
          h: 162
        },
        C7: {
          name: 'C7',
          w: 81,
          h: 114
        }
      },
      currentPage: 'A4',
      globalSettingConfig: {},
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
      globalSettingItem: [
        {
          title: '模板名称',
          field: 'title',
          span: 24,
          itemRender: {
            name: '$input'
          }
        },
        {
          title: '纸张方向',
          field: 'pageDirection',
          span: 24,
          itemRender: {
            name: '$select',
            options: [
              {
                label: '横向',
                value: 'l'
              },
              {
                label: '纵向',
                value: 'p'
              }
            ],
            props: {
              disabled: true
            }
          }
        },
        {
          title: '页面上边距',
          field: 'pageMarginTop',
          span: 24,
          itemRender: {
            name: '$input',
            props: {
              type: 'number',
              min: 0,
              max: 50
            }
          }
        },
        {
          title: '页面下边距',
          field: 'pageMarginBottom',
          span: 24,
          itemRender: {
            name: '$input',
            props: {
              type: 'number',
              min: 0,
              max: 50
            }
          }
        },
        {
          title: '背景颜色',
          field: 'background',
          span: 24,
          itemRender: {
            name: '$colorPicker',
            props: {}
          }
        },
        {
          title: '默认字体',
          field: 'fontFamily',
          span: 24,
          itemRender: {
            name: '$select',
            options: [
              {
                label: '宋体',
                value: 'simsun'
              },
              {
                label: '黑体',
                value: 'simhei'
              },
              {
                label: '楷体',
                value: 'kaiti'
              },
              {
                label: '仿宋',
                value: 'fangsong'
              },
              {
                label: '微软雅黑',
                value: 'Microsoft YaHei'
              }
            ]
          }
        },
        {
          title: '默认行高',
          field: 'lineHeight',
          span: 24,
          itemRender: {
            name: '$select',
            options: [
              {
                value: '1',
                label: '1'
              },
              {
                value: '1.5',
                label: '1.5'
              },
              {
                value: '2',
                label: '2'
              },
              {
                value: '2.5',
                label: '2.5'
              },
              {
                value: '3',
                label: '3'
              }
            ]
          }
        }
        // {
        //   title: '默认字体颜色',
        //   field: 'color',
        //   span: 24,
        //   itemRender: {
        //     name: '$colorPicker',
        //     props: {}
        //   }
        // },
        // {
        //   title: '默认字体大小（pt）',
        //   field: 'fontSize',
        //   span: 24,
        //   itemRender: {
        //     name: '$input',
        //     props: {
        //       type: 'number',
        //       size: 'mini',
        //       min: 10,
        //       max: 120
        //     }
        //   }
        // }
      ]
    }
  },
  computed: {
    ...mapState({
      pageConfig: (state) => state.printTemplateModule.pageConfig
    })
  },
  methods: {
    ...mapActions({
      reDrawRuler: 'printTemplateModule/rulerThings/reDrawRuler',
      setRect: 'printTemplateModule/rulerThings/setRect'
    }),
    initMounted() {
      this.globalSettingConfig = this.deepCopy(this.pageConfig)
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {
    currentPage(newVal) {
      let page = this.pages[newVal]
      this.setRect(page)
      this.reDrawRuler()
      this.$store.commit('printTemplateModule/setPageSize', {
        pageSize: newVal,
        w: page.w,
        h: page.h
      })
    },
    globalSettingConfig(newVal) {
      this.$store.commit('printTemplateModule/setPageConfig', newVal)
    }
  }
}
</script>

<style lang="scss">
.roy-designer-global {
  height: 100%;
  padding: 12px 8px;
  font-size: 12px;

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

  .roy-designer-global__pages {
    .roy-designer-global__pages__container {
      margin: 8px;
      display: grid;
      grid-template-columns: repeat(4, auto);
      grid-gap: 5px;
      grid-template-rows: 50px;
    }

    .roy-designer-global__pages__item {
      font-size: 16px;
      line-height: 50px;
      text-align: center;
      border: 1px solid #ccc;
      user-select: none;
      cursor: pointer;

      &:hover {
        border: 1px solid #4579e1;
        background: var(--prism-background);
      }

      &.roy-designer-global__pages__item--active {
        border: 1px solid #4579e1;
        color: #4579e1;
      }
    }
  }

  .roy-designer-global__title {
    padding: 6px 5px;
    margin: 4px;

    &:before {
      content: '';
      width: 1px;
      height: 80%;
      margin-right: 5px;
      border-left: var(--roy-color-primary) 3px solid;
    }
  }
}
</style>
