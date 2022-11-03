<template>
  <div class="roy-page-setting">
    <header>
      <el-tooltip
        v-for="(btn, index) in buttons"
        :key="index"
        :content="btn.content"
        :open-delay="400"
        :visible-arrow="false"
        effect="dark"
        placement="bottom"
      >
        <i :class="btn.icon"></i>
      </el-tooltip>
    </header>
    <el-row
      v-for="(page, index) in pages"
      :key="index"
      :class="page.active ? 'active' : ''"
      :data-index="index"
      :gutter="10"
      @click.native="doActivePage(index)"
    >
      <el-col :span="4">{{ index + 1 }}</el-col>
      <el-col :span="20">
        <PageThumbnail v-if="page.canvas" :element="page.canvas" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PageThumbnail from './PageThumbnail.vue'
import html2canvas from 'html2canvas'

export default {
  name: 'PageSetting',
  data() {
    return {
      pages: [],
      buttons: [
        {
          icon: 'ri-file-line',
          content: '新增空白页'
        },
        {
          icon: 'ri-file-copy-line',
          content: '复制'
        },
        {
          icon: 'ri-delete-bin-4-line',
          content: '删除'
        },
        {
          icon: 'ri-arrow-up-fill',
          content: '上移'
        },
        {
          icon: 'ri-arrow-down-fill',
          content: '下移'
        },
        {
          icon: 'ri-align-top',
          content: '置顶'
        },
        {
          icon: 'ri-align-bottom',
          content: '置底'
        }
      ]
    }
  },
  components: {
    PageThumbnail
  },
  methods: {
    doActivePage(index) {
      for (let i = 0; i < this.pages.length; i++) {
        this.$set(this.pages[i], 'active', i === index)
      }
    }
  },
  async mounted() {
    for (let i = 0; i < 3; i++) {
      let element = await html2canvas(
        document.querySelector('#designer-page'),
        {
          scale: '0.6'
        }
      )
      element.style.width = 'auto'
      element.style.height = '96px'
      this.pages.push({
        canvas: element
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.roy-page-setting {
  overflow: auto;
  height: calc(100% - 16px);
  padding: 0 8px 8px 8px;

  header {
    height: 30px;
    width: calc(100% - 10px);
    padding: 15px 5px 5px 5px;
    text-align: right;
    position: sticky;
    top: 0;
    left: 0;
    background: var(--roy-bg-color-overlay);
    z-index: 1;

    i {
      & + i {
        margin-left: 5px;
      }

      &:hover {
        color: var(--roy-color-primary);
        cursor: pointer;
      }
    }
  }

  .el-row {
    height: 100px;
    width: 100%;
    user-select: none;

    & + .el-row {
      margin-top: 10px;
    }

    .el-col {
      height: 100%;

      &:first-child {
        text-align: right;
      }

      &:last-child {
        cursor: pointer;
        background: var(--roy-bg-block-color);
        border: 2px solid var(--roy-border-block-color);
        height: 100%;
      }
    }

    &:hover {
      opacity: 0.75;
    }

    &.active {
      .el-col {
        color: var(--roy-color-warning-dark-2);

        &:last-child {
          border: 2px solid var(--roy-color-warning-dark-2);
        }
      }
    }
  }
}
</style>
