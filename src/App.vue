<template>
  <div style="height: 100%">
    <PtdDesigner
      ref="designer"
      :pre-data-source="preDataSource"
      :pre-data-set="preDataSet"
    >
      <template v-slot:roy-designer-header-slot>
        <div class="head-slot">
          <i
            v-for="(tool, index) in headIconConfig"
            :title="tool.title"
            :key="index"
            :class="tool.icon"
            class="roy-header-icon"
            @click="tool.event"
          ></i>
        </div>
      </template>
      <template v-slot:roy-designer-toolbar-slot>
        <el-tooltip
          v-for="(tool, index) in toolbarSlotConfig"
          :key="index"
          :content="tool.name"
          :open-delay="600"
          :visible-arrow="false"
          effect="dark"
          placement="bottom"
        >
          <div class="toolbar-slot-item" @click="tool.event">
            <i :class="tool.icon"></i>
          </div>
        </el-tooltip>
      </template>
    </PtdDesigner>
    <PtdViewer
      v-if="viewerVisible"
      :visible.sync="viewerVisible"
      :component-data="componentData"
      :page-config="pageConfig"
      :data-set="dataSet"
      :data-source="dataSource"
    />
    <TemplateViews
      v-if="templateVisible"
      :visible.sync="templateVisible"
      @load="loadTemp"
    />
    <div class="fork-me">
      <a
        href="https://github.com/ROYIANS/print-template-designer"
        target="_blank"
        >Give me a Star!
      </a>
    </div>
  </div>
</template>

<script>
import toast from '@/utils/toast'
import PtdViewer from '@/components/Viewer/PtdViewer'
import TemplateViews from '@/views/templates/TemplateViews'
import { mapState } from 'vuex'

export default {
  name: 'App',
  mounted() {
    toast('欢迎使用ROYIANS的打印模板设计器，仅个人学习使用', 'info')
    console.log('contributed by ROYIANS@Little-Dreamland﹢')
  },
  components: {
    PtdViewer,
    TemplateViews
  },
  computed: {
    ...mapState({
      pageConfig: (state) => state.printTemplateModule.pageConfig,
      componentData: (state) => state.printTemplateModule.componentData,
      dataSource: (state) => state.printTemplateModule.dataSource,
      dataSet: (state) => state.printTemplateModule.dataSet
    })
  },
  data() {
    return {
      fileList: [],
      toolbarSlotConfig: [
        {
          name: '从报表配置拉取表格',
          icon: 'ri-table-line',
          event: () => {
            toast('(开发者自定义按钮)')
          }
        }
      ],
      headIconConfig: [
        {
          name: 'Github',
          icon: 'ri-file-word-2-line',
          title: '预设模板',
          event: () => {
            this.templateVisible = true
          }
        },
        {
          name: 'ShowViewer',
          icon: 'ri-eye-line',
          title: '预览设计模板',
          event: () => {
            this.showViewer()
          }
        }
      ],
      preDataSource: [
        {
          id: '0001',
          title: '当前日期（中文）',
          field: 'curDateChn',
          typeName: 'BigCurDate'
        },
        {
          id: '0002',
          title: '当前日期（数字）',
          field: 'curDateNum',
          typeName: 'CurDateTime'
        },
        {
          id: '0003',
          title: '当前日期时间（数字）',
          field: 'curDateTime',
          typeName: 'CurDateTime'
        },
        {
          id: '0004',
          title: '表格数据',
          field: 'tableData',
          typeName: 'Array'
        }
      ],
      preDataSet: {
        curDateTime: 'YYYY.MM.DD hh:mm',
        curDateChn: '',
        curDateNum: 'YYYY年MM月DD日',
        currentTime: 'YYYY年MM月DD日',
        tableData: [{}, {}, {}, {}]
      },
      viewerVisible: false,
      templateVisible: false
    }
  },
  methods: {
    showViewer() {
      this.viewerVisible = true
    },
    loadTemp(data) {
      this.$refs.designer.loadTemplateData(data)
      this.templateVisible = false
    }
  }
}
</script>

<style lang="scss">
html,
body,
.height-all {
  height: 100%;
}

.head-slot {
  display: flex;
  height: 40px;
  align-items: center;

  .roy-upload-file {
    .el-upload {
      align-items: center;
      display: flex;
    }
  }

  .el-button,
  .el-button--mini {
    background: transparent !important;
    color: #fff !important;
    border: none !important;
    display: inline-flex !important;
    align-items: center !important;

    i {
      padding-right: 5px;
      font-size: 14px !important;
    }

    &:hover {
      background: var(--roy-color-primary-light-3) !important;
    }
  }

  .roy-header-icon {
    padding: 0 8px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background: var(--roy-color-primary-light-3);
    }
  }
}

.toolbar-slot-item {
  cursor: pointer;
  background: var(--roy-bg-color);
  display: grid;
  width: 18px;
  height: 18px;
  font-size: 10px;
  line-height: 18px;
  box-shadow: rgba(99, 99, 99, 0.2) 0 2px 8px 0;
  padding: 4px;
  text-align: center;
  border-radius: 4px;

  & + .roy-designer-main__toolbar__item {
    margin-left: 5px;
  }

  &:hover {
    background: var(--roy-bg-color-page);
  }

  i {
    padding: 0;
    margin: 0;
    font-size: 14px;
  }
}

.fork-me {
  a {
    text-decoration: none;
    color: #fff;
  }
  width: 250px;
  height: 32px;
  line-height: 32px;
  background: black;
  text-align: center;
  font-family: fantasy;
  transform: rotate(-45deg);
  position: fixed;
  right: -69px;
  bottom: 39px;
  cursor: pointer;
}
</style>
