<!--
* @description 数据源设置
* @filename DataSourceMaintain.vue
* @author ROYIANS
* @date 2022/11/24 14:55
!-->
<template>
  <RoyModal
    v-if="visible"
    :show="visible"
    title="数据源设置"
    height="80%"
    width="60%"
    class="DataSourceMaintain"
    @mousedown.stop.prevent="handleMouseDown"
    @close="handleModalClose"
  >
    <vxe-grid
      ref="xGrid"
      v-bind="gridOptions"
      height="100%"
      :data="tableDataIn"
      @toolbar-button-click="handleToolbarButtonClick"
    />
  </RoyModal>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import RoyModal from '@/components/RoyModal/RoyModal'
import { mapState } from 'vuex'

/**
 * 数据源设置
 */
export default {
  name: 'DataSourceMaintain',
  mixins: [commonMixin],
  components: {
    RoyModal
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      dataSource: (state) => state.printTemplateModule.dataSource
    })
  },
  data() {
    return {
      tableDataIn: [],
      gridOptions: {
        border: true,
        showHeaderOverflow: true,
        showOverflow: true,
        keepSource: true,
        id: 'full_edit_1',
        rowId: 'id',
        rowConfig: {
          isHover: true
        },
        columnConfig: {
          resizable: true
        },
        toolbarConfig: {
          buttons: [
            {
              code: 'save',
              name: '保存',
              icon: 'ri-save-line',
              status: 'primary'
            },
            {
              code: 'add',
              name: '新增行',
              icon: 'ri-add-line'
            },
            {
              code: 'remove',
              name: '删除行',
              icon: 'ri-subtract-line'
            }
          ],
          refresh: false,
          import: false,
          export: false,
          print: false,
          zoom: false,
          custom: false
        },
        columns: [
          { type: 'checkbox', width: 50 },
          {
            field: 'title',
            title: '数据名称',
            sortable: true,
            titlePrefix: { message: '数据源的标识名称' },
            editRender: {
              name: 'input',
              attrs: { placeholder: '请输入数据名称' }
            }
          },
          {
            field: 'field',
            title: '英文字段',
            sortable: true,
            titlePrefix: { message: '用于匹配对应数据集' },
            editRender: {
              name: 'input',
              attrs: { placeholder: '请输入英文字段' }
            }
          },
          {
            field: 'typeName',
            title: '类型',
            sortable: true,
            titlePrefix: { message: '该数据的类型' },
            editRender: {
              name: '$select',
              options: [
                {
                  value: 'String',
                  label: '文本'
                },
                {
                  value: 'Number',
                  label: '数字'
                },
                {
                  value: 'Array',
                  label: '数组（表格数据）'
                },
                {
                  value: 'Money',
                  label: '金额'
                },
                {
                  value: 'Time',
                  label: '日期/时间'
                }
              ],
              props: {
                placeholder: '请选择类型'
              }
            }
          }
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: false
        },
        editRules: {
          title: [{ required: true, message: '请输入数据名称' }],
          field: [{ required: true, message: '请输入英文字段名' }],
          typeName: [{ required: true, message: '请选择数据类型' }]
        },
        editConfig: {
          trigger: 'click',
          mode: 'row',
          showStatus: true
        }
      }
    }
  },
  methods: {
    initMounted() {
      this.tableDataIn = this.deepCopy(this.dataSource)
    },
    handleMouseDown() {},
    handleModalClose() {
      this.$emit('update:visible', false)
    },
    handleToolbarButtonClick({ code }) {
      switch (code) {
        case 'save':
          this.doSaveTableSetting()
          break
        case 'add':
          this.doAddRow()
          break
      }
    },
    doAddRow() {
      const defaultData = {
        typeName: 'String',
        type: String
      }
      this.$refs.xGrid.insertAt(defaultData, -1)
    },
    doSaveTableSetting() {
      const tableData = this.$refs.xGrid.getTableData().fullData
      this.$refs.xGrid.fullValidate(tableData, () => {
        this.$store.commit('printTemplateModule/setDataSource', tableData)
        this.handleModalClose()
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
.DataSourceMaintain {
  height: 100%;
  padding: 6px;
}
</style>
