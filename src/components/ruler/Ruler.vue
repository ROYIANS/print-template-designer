<!--
* @description 标尺工具
* @filename Ruler.vue
* @author ROYIANS
* @date 2022/9/16 11:42
!-->
<template>
  <div class="roy-ruler-box">
    <div class="roy-ruler-outer-box"></div>
    <div class="roy-ruler-horizontal-wrapper">
      <RulerHorizontal />
    </div>
    <div class="roy-ruler-vertical-wrapper">
      <RulerVertical />
    </div>
    <div class="roy-ruler-inner-box">
      <div class="roy-ruler-inner-box-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import RulerHorizontal from "@/components/ruler/RulerHorizontal.vue";
import RulerVertical from "@/components/ruler/RulerVertical.vue";

/**
 * 标尺工具
 */
export default {
  name: "RoyRuler",
  mixins: [commonMixin],
  components: {
    RulerHorizontal,
    RulerVertical,
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

<style lang="scss">
.Ruler {
  height: 100%;
  padding: 6px;
}
</style>
