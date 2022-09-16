<!--
* @description
* @filename RulerVertical.vue
* @author ROYIANS
* @date 2022/9/16 11:43
!-->
<template>
  <el-main class="RulerVertical"> 1 </el-main>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";

/**
 *
 */
export default {
  name: "RulerVertical",
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
.RulerVertical {
  height: 100%;
  padding: 6px;
}
</style>
