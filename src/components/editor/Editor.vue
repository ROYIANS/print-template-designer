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
    initMounted() {},
  },
  created() {},
  mounted() {
    this.initMounted();
  },
  watch: {},
};
</script>
