<!--
* @description 全局设置
* @filename GlobalSetting.vue
* @author ROYIANS
* @date 2022/9/26 15:11
!-->
<template>
  <el-main class="GlobalSetting"> GlobalSetting</el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

/**
 * GlobalSetting
 */
export default {
  name: "GlobalSetting",
  mixins: [commonMixin],
  components: {},
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
.GlobalSetting {
  height: 100%;
  padding: 6px;
}
</style>
