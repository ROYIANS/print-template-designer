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
import RulerHorizontal from "./RulerHorizontal.vue";
import RulerVertical from "./RulerVertical.vue";

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
.roy-ruler-box {
  width: 100%;
  height: calc(100% - 4px);
  position: relative;

  .roy-ruler-outer-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    background: var(--prism-background);
    box-sizing: border-box;
  }

  .roy-ruler-horizontal-wrapper {
    position: absolute;
    top: 0;
    left: 16px;
    width: calc(100% - 16px);
    height: 16px;
    overflow: hidden;
  }

  .roy-ruler-vertical-wrapper {
    position: absolute;
    left: 0;
    top: 16px;
    width: 16px;
    height: calc(100% - 16px);
  }

  .roy-ruler-inner-box {
    position: absolute;
    left: 16px;
    top: 16px;
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    overflow: auto;

    .roy-ruler-inner-box-content {
      position: absolute;
      width: fit-content;
      overflow: auto;
      left: 16px;
      top: 16px;
      padding: 8px;
    }
  }

  .roy-ruler {
    width: 100%;
    height: 100%;
  }
}
</style>
