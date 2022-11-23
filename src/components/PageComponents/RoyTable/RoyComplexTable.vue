<!--
* @description 复杂表格
* @filename RoyComplexTable.vue
* @author ROYIANS
* @date 2022/11/23 9:55
!-->
<template>
  <div class="roy-complex-table">
    <StyledComplexTable v-bind="style">
      <table class="roy-complex-table__container">
        <tr>
          <td>
            <div class="roy-complex-table__prefix">
              <RoyTextInTable
                key="prefix"
                style="min-height: 50px; min-width: 200px"
                :element="prefixTextElement"
                :prop-value.sync="prefixTextElement.propValue"
                @componentUpdated="componentUpdated"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="roy-complex-table__head">
              <RoySimpleTable
                key="head"
                :scale="scale"
                :element="headSimpleTableElement"
                :prop-value.sync="headSimpleTableElement.propValue"
                @componentUpdated="componentUpdated"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="roy-complex-table__body">
              <table>
                <thead>
                  <tr>
                    <th v-for="(item, index) in tableCols" :key="index">
                      {{ item.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td :colspan="tableCols.length">
                      <div
                        style="
                          height: 30px;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          color: #ccc;
                          background: rgb(246, 246, 246);
                        "
                      >
                        自动填充
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="roy-complex-table__foot">
              <RoySimpleTable
                key="foot"
                :scale="scale"
                :element="footSimpleTableElement"
                :prop-value.sync="footSimpleTableElement.propValue"
                @componentUpdated="componentUpdated"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="roy-complex-table__suffix">
              <RoyTextInTable
                key="prefix"
                style="min-height: 50px; min-width: 200px"
                :element="suffixTextElement"
                :prop-value.sync="suffixTextElement.propValue"
                @componentUpdated="componentUpdated"
              />
            </div>
          </td>
        </tr>
      </table>
    </StyledComplexTable>
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import RoyTextInTable from './RoyTextInTable'
import RoySimpleTable from './RoySimpleTable'
import ResizeObserver from '@/components/PageComponents/RoyTable/ResizeObserver'
import { StyledComplexTable } from '@/components/PageComponents/style'

const defaultTextProp = {
  icon: 'ri-text',
  code: 'text',
  name: '文本',
  component: 'RoySimpleTextIn',
  propValue: '',
  style: {
    width: '100%',
    height: '100%',
    fontSize: 12,
    background: null,
    rotate: 0
  },
  groupStyle: {}
}

const defaultSimpleTableProp = {
  icon: 'ri-table-2',
  code: 'table',
  name: '单元格',
  component: 'RoySimpleTable',
  propValue: {},
  style: {
    width: '100%',
    height: 'auto',
    fontSize: 12,
    background: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#212121',
    rotate: 0,
    isRelative: true
  },
  groupStyle: {}
}

const defaultDataTableProp = {
  tableCols: [
    {
      field: 'field1',
      title: '表头R1',
      formatter: 'text'
    },
    {
      field: 'field2',
      title: '表头R2',
      formatter: 'text'
    },
    {
      field: 'field3',
      title: '表头R3',
      formatter: 'text'
    },
    {
      field: 'field4',
      title: '表头R4',
      formatter: 'text'
    },
    {
      field: 'field5',
      title: '表头R5',
      formatter: 'text'
    },
    {
      field: 'field6',
      title: '表头R6',
      formatter: 'money'
    }
  ]
}

/**
 * 复杂表格
 */
export default {
  name: 'RoyComplexTable',
  mixins: [commonMixin],
  components: {
    RoyTextInTable,
    RoySimpleTable,
    StyledComplexTable
  },
  props: {
    element: {
      type: Object,
      default: () => {}
    },
    propValue: {
      type: Object,
      default: () => {
        return {}
      }
    },
    scale: {
      required: true,
      type: [Number, String],
      default: 1
    }
  },
  computed: {
    style() {
      return this.element.style || {}
    },
    tableCols() {
      return this.bodyDataTableElement.tableCols || []
    }
  },
  data() {
    return {
      prefixTextElement: {},
      suffixTextElement: {},
      bodyDataTableElement: {},
      headSimpleTableElement: {},
      footSimpleTableElement: {}
    }
  },
  methods: {
    initMounted() {
      const {
        prefixTextElement,
        suffixTextElement,
        headSimpleTableElement,
        footSimpleTableElement,
        bodyDataTableElement
      } = this.propValue
      this.prefixTextElement =
        prefixTextElement || this.deepCopy(defaultTextProp)
      this.suffixTextElement =
        suffixTextElement || this.deepCopy(defaultTextProp)
      this.headSimpleTableElement =
        headSimpleTableElement || this.deepCopy(defaultSimpleTableProp)
      this.footSimpleTableElement =
        footSimpleTableElement || this.deepCopy(defaultSimpleTableProp)
      this.bodyDataTableElement =
        bodyDataTableElement || this.deepCopy(defaultDataTableProp)
      setTimeout(() => {
        // this.observeElementWidth()
      })
    },
    componentUpdated() {
      const propValue = Object.assign({}, this.propValue, {
        prefixTextElement: this.prefixTextElement,
        suffixTextElement: this.suffixTextElement,
        headSimpleTableElement: this.headSimpleTableElement,
        footSimpleTableElement: this.footSimpleTableElement,
        bodyDataTableElement: this.bodyDataTableElement
      })
      this.$store.commit('printTemplateModule/setPropValue', {
        id: this.element.id,
        propValue
      })
      this.$emit('update:propValue', propValue)
      this.$emit('componentUpdated')
    },
    observeElementWidth() {
      this.$nextTick(() => {
        const element = this.$el.querySelector('.roy-complex-table__container')
        if (!element) {
          return
        }
        const resizeObserver = new ResizeObserver()
        const callback = () => {
          this.$nextTick(() => {
            this.$store.commit('printTemplateModule/setShapeStyle', {
              width: element.clientWidth,
              height: element.clientHeight
            })
          })
        }
        resizeObserver.onElResize(element, callback)
      })
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss">
.roy-complex-table {
  padding: 0;
}
</style>
