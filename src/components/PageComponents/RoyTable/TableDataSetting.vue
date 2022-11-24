<!--
* @description 表格数据设置
* @filename TableDataSetting.vue
* @author ROYIANS
* @date 2022/11/24 14:55
!-->
<template>
  <RoyModal
    v-if="visible"
    :show="visible"
    title="数据表格设置"
    height="80%"
    width="60%"
    class="TableDataSetting"
    @mousedown.stop.prevent="handleMouseDown"
    @close="handleModalClose"
  >
    <vxe-grid
      ref="xGrid"
      v-bind="gridOptions"
      height="100%"
      :data="tableDataIn"
      @toolbar-button-click="handleToolbarButtonClick"
    >
      <template v-slot:form>
        <div class="roy-table-data-form">
          <div>
            <span>绑定数据源：</span>
            <vxe-select v-model="tableDataSource" placeholder="请选择数据源">
              <vxe-option
                v-for="opt in dataSourceOption"
                :key="opt.field"
                :value="opt.field"
                :label="opt.title"
              ></vxe-option>
            </vxe-select>
          </div>
          <div>
            <span>表格行高：</span>
            <vxe-input
              v-model="tableRowHeight"
              placeholder="20-100"
              type="number"
              min="20"
              max="100"
            ></vxe-input>
          </div>
        </div>
      </template>
    </vxe-grid>
  </RoyModal>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import RoyModal from '@/components/RoyModal/RoyModal'
import { mapState } from 'vuex'
import toast from '@/utils/toast'

/**
 * 表格数据设置
 */
export default {
  name: 'TableDataSetting',
  mixins: [commonMixin],
  components: {
    RoyModal
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tableConfig: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    ...mapState({
      dataSource: (state) => state.printTemplateModule.dataSource
    }),
    dataSourceOption() {
      return this.dataSource.filter((item) => {
        return item.type === Array
      })
    }
  },
  data() {
    return {
      tableDataIn: [],
      tableDataSource: '',
      tableRowHeight: 40,
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
            title: '列标题',
            sortable: true,
            titlePrefix: { message: '用于展示于表头名称' },
            editRender: {
              name: 'input',
              attrs: { placeholder: '请输入列标题' }
            }
          },
          {
            field: 'field',
            title: '英文字段',
            sortable: true,
            titlePrefix: { message: '用于匹配对应列数据' },
            editRender: {
              name: 'input',
              attrs: { placeholder: '请输入英文字段' }
            }
          },
          {
            field: 'align',
            title: '对齐方式',
            sortable: true,
            titlePrefix: { message: '该列的对齐方式' },
            editRender: {
              name: '$select',
              options: [
                {
                  value: 'left',
                  label: '居左'
                },
                {
                  value: 'center',
                  label: '居中'
                },
                {
                  value: 'right',
                  label: '居右'
                }
              ],
              props: {
                placeholder: '请选择对齐方式'
              }
            }
          },
          {
            field: 'width',
            title: '列宽度',
            sortable: true,
            titlePrefix: { message: '该列宽度' },
            editRender: {
              name: 'input',
              attrs: {
                placeholder: '请输入列宽度',
                type: 'number',
                min: 10,
                max: 1000
              }
            }
          },
          {
            field: 'formatter',
            title: '列类型',
            sortable: true,
            titlePrefix: { message: '该列的数据的展现方式' },
            editRender: {
              name: '$select',
              options: [
                {
                  value: 'text',
                  label: '文本'
                },
                {
                  value: 'number',
                  label: '数字'
                },
                {
                  value: 'money',
                  label: '金额'
                }
              ],
              props: {
                placeholder: '请选择列类型'
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
          title: [{ required: true, message: '请输入列标题' }],
          field: [{ required: true, message: '请输入英文字段名' }],
          align: [{ required: true, message: '请选择对齐方式' }],
          width: [{ required: true, message: '请输入列宽度' }],
          formatter: [{ required: true, message: '请选择列类型' }]
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
      const { tableCols, tableRowHeight, tableDataSource } = this.tableConfig
      this.tableDataIn = this.deepCopy(tableCols)
      this.tableRowHeight = tableRowHeight
      this.tableDataSource = tableDataSource
    },
    handleMouseDown() {},
    handleModalClose() {
      this.$store.commit('printTemplateModule/setCurTableSettingId', null)
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
        width: 100,
        align: 'left',
        formatter: 'text'
      }
      this.$refs.xGrid.insertAt(defaultData, -1)
    },
    doSaveTableSetting() {
      const tableData = this.$refs.xGrid.getTableData().fullData
      this.$refs.xGrid.fullValidate(tableData, () => {
        if (this.isBlank(this.tableDataSource)) {
          toast('请选择数据源')
          return
        }
        if (this.isBlank(this.tableRowHeight)) {
          toast('请填写表格行高')
          return
        }
        this.$emit('onSave', {
          tableCols: tableData,
          tableRowHeight: this.tableRowHeight,
          tableDataSource: this.tableDataSource
        })
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
.TableDataSetting {
  height: 100%;
  padding: 6px;
  .roy-table-data-form {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    & > div {
      margin-left: 10px;
    }
  }
}
</style>
