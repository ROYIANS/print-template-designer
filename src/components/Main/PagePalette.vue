<template>
  <div class="roy-page-tools">
    <div v-if="curComponent && curComponent.id">
      <el-form ref="form" :model="formData">
        <el-form-item
          v-for="(formItem, index) in formItemConfig"
          :key="index"
          :label="formItem.title"
        >
          <component
            :is="formItem.component"
            v-model="formData[`${formItem.field}`]"
            v-bind="formItem.props"
          />
        </el-form-item>
      </el-form>
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
      formData: {},
      formItemConfigs: {
        RoyText: [
          {
            title: '坐标-x',
            field: 'left',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          },
          {
            title: '坐标-y',
            field: 'top',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          },
          {
            title: '宽度',
            field: 'width',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          },
          {
            title: '背景',
            field: 'background',
            component: 'el-color-picker',
            props: {
              size: 'mini'
            }
          },
          {
            title: '文本颜色',
            field: 'color',
            component: 'el-color-picker',
            props: {
              size: 'mini'
            }
          },
          {
            title: '旋转角度',
            field: 'rotate',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          }
        ],
        RoySimpleText: [
          {
            title: '坐标-x',
            field: 'left',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          },
          {
            title: '坐标-y',
            field: 'top',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          },
          {
            title: '宽度',
            field: 'width',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          },
          {
            title: '高度',
            field: 'height',
            component: 'elInput',
            props: {
              type: 'number',
              size: 'mini'
            }
          },
          {
            title: '背景',
            field: 'background',
            component: 'el-color-picker',
            props: {
              size: 'mini'
            }
          },
          {
            title: '文本颜色',
            field: 'color',
            component: 'el-color-picker',
            props: {
              size: 'mini'
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
  .el-form {
    .el-form-item {
      margin: 0;
      .el-form-item__label {
        font-size: 12px;
        padding: 6px 5px;
        margin: 4px;
        line-height: 12px;
        &:before {
          content: '';
          width: 1px;
          height: 80%;
          margin-right: 5px;
          border-left: var(--roy-color-primary) 3px solid;
        }
      }
    }
  }
}
</style>
