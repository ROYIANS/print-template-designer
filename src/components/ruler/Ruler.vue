<!--
* @description 标尺工具
* @filename Ruler.vue
* @author ROYIANS
* @date 2022/9/16 11:42
!-->
<template>
  <el-main class="Ruler"> 1 </el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

/**
 * 标尺工具
 */
export default {
  name: "RoyRuler",
  mixins: [commonMixin],
  components: {},
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

<style lang="scss">
.Ruler {
  height: 100%;
  padding: 6px;
}
</style>
