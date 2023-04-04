<!--
* @description 数据源
* @filename DataSource.vue
* @author ROYIANS
* @date 2022/10/21 9:16
!-->
<template>
  <roy-main class="DataSource">
    <vxe-button
      status="primary"
      size="mini"
      type="text"
      icon="ri-database-line"
      style="float: right; padding: 5px 10px"
      @click="showDataSourceMaintainer = true"
    >
      编辑数据源
    </vxe-button>
    <div class="roy-datasource-node-list" @dragstart="handleDragStart">
      <div
        class="roy-datasource-node"
        v-for="(item, index) in dataSourceIn"
        :data-index="index"
        :key="index"
        :title="item.title"
        draggable="true"
      >
        <div class="roy-datasource-node--title">
          <span class="roy-datasource-node--tag">{{ item.typeName }}</span>
          <span>
            <span class="roy-datasource-node--text">{{ item.title }}</span>
          </span>
        </div>
        <div class="roy-datasource-node--content">{{ item.field }}</div>
      </div>
    </div>
    <DataSourceMaintain
      v-if="showDataSourceMaintainer"
      :visible.sync="showDataSourceMaintainer"
    />
  </roy-main>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import DataSourceMaintain from '@/components/Main/DataSourceMaintain'
import { mapState } from 'vuex'

/**
 * 数据源
 */
export default {
  name: 'DataSource',
  mixins: [commonMixin],
  components: {
    DataSourceMaintain
  },
  props: {},
  data() {
    return {
      showDataSourceMaintainer: false,
      dataSourceIn: []
    }
  },
  computed: {
    ...mapState({
      dataSource: (state) => state.printTemplateModule.dataSource
    })
  },
  methods: {
    initMounted() {
      this.dataSourceIn = this.deepCopy(this.dataSource)
    },
    handleDragStart(e) {
      e.dataTransfer.setData('datasource-index', e.target.dataset.index)
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {
    dataSource(newVal) {
      this.dataSourceIn = this.deepCopy(newVal)
    }
  }
}
</script>

<style lang="scss">
.DataSource {
  height: 100%;
  padding: 2px !important;
  .roy-datasource-node-list {
    width: 100%;
  }
  .roy-datasource-node {
    box-sizing: border-box;
    display: inline-block;
    position: relative;
    margin: 0;
    padding: 3px;
    border: 2px dashed transparent;
    text-align: center;
    user-select: none;
    cursor: move;
    width: 100%;
    .roy-datasource-node--title {
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      height: 20px;
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background-color: var(--roy-color-primary);
      color: var(--roy-bg-color-page);
      border-radius: 4px 4px 0 0;
    }
    .roy-datasource-node--text {
      margin: auto;
      display: block;
      width: 35%;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .roy-datasource-node--content {
      box-sizing: border-box;
      width: 100%;
      height: 20px;
      font-size: 11px;
      line-height: 18px;
      border: 1px solid var(--roy-color-primary);
      border-radius: 0 0 4px 4px;
      text-align: center;
      background-color: var(--roy-bg-color-page);
      color: var(--roy-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .roy-datasource-node--tag {
      font-size: 10px;
      position: absolute;
      color: #fff;
      background: var(--roy-color-info);
      font-weight: 100;
      border-radius: 2px;
      height: 13px;
      line-height: 13px;
      zoom: 0.8;
      padding: 2px;
      left: 10px;
      top: 8px;
    }
  }
}
</style>
