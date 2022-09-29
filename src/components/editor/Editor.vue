<!--
* @description 主编辑器
* @filename Editor.vue
* @author ROYIANS
* @date 2022/9/16 11:36
!-->
<template>
  <el-main class="roy-designer-main__page">
    <Ruler>
      <div id="designer-page">
        <div>测试页面</div>
      </div>
    </Ruler>
  </el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import Ruler from "@/components/ruler/Ruler.vue";

/**
 * 主编辑器
 */
export default {
  name: "RoyEditor",
  mixins: [commonMixin],
  components: {
    Ruler,
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    initMounted() {
    },
  },
  created() {
  },
  mounted() {
    this.initMounted();
  },
  watch: {},
};
</script>

<style lang="scss">
.roy-designer-main__page {
  height: calc(100% - 50px);
  padding: 0;
  margin: 0;
  background-color: rgb(255, 255, 255);
  background-image: linear-gradient(
      45deg,
      rgb(247, 247, 247) 25%,
      transparent 25%
    ),
    linear-gradient(-45deg, rgb(247, 247, 247) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgb(247, 247, 247) 75%),
    linear-gradient(-45deg, transparent 75%, rgb(247, 247, 247) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;

  #designer-page {
    margin: auto;
    padding: 15px;
    background: var(--roy-bg-color);
    box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
    width: calc(210mm * 1.25);
    height: calc(297mm * 1.25);
  }
}

body[theme="dark"] {
  .roy-designer-main__page {
    background-color: #1c1c1c;
    background-image: linear-gradient(45deg, #212121 25%, transparent 25%),
      linear-gradient(-45deg, #232323 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #232323 75%),
      linear-gradient(-45deg, transparent 75%, #232323 75%);
  }
}
</style>
