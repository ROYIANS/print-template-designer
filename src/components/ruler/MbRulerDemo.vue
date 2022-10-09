<!--
* @description 标尺工具
* @filename MbRuler.vue
* @author ROYIANS
* @date 2022/10/9 11:14
!-->
<template>
  <MbRuler :height="100" :width="100" :is-open-menu-feature="false" />
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import MbRuler from "@/components/mb-ruler/index.js";

/**
 * 标尺工具
 */
export default {
  name: "MbRulerDemo",
  mixins: [commonMixin],
  components: {
    MbRuler,
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

<style lang="scss" scoped>
.MbRuler {
  height: 100%;
  padding: 6px;
}
</style>
