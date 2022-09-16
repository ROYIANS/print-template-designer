<!--
* @description 标尺纵向
* @filename RulerVertical.vue
* @author ROYIANS
* @date 2022/9/16 11:43
!-->
<template>
  <div ref="rulerDiv" class="roy-ruler"></div>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import Ruler from "@scena/ruler";

/**
 * 标尺纵向
 */
export default {
  name: "RulerHorizontal",
  mixins: [commonMixin],
  components: {},
  props: {
    scale: {
      type: Number,
    },
    scroll: {
      type: Number,
    },
  },
  data() {
    return {
      ruler: null,
    };
  },
  methods: {
    initMounted() {
      let elements = document.getElementsByClassName("roy-ruler-outer-box");
      if (elements.length) {
        this.ruler = new Ruler(this.$refs.rulerDiv, {
          type: "vertical",
          backgroundColor: window.getComputedStyle(elements[0]).backgroundColor,
          textColor: window.getComputedStyle(elements[0]).color,
          width: 16,
          unit: 1,
          zoom: 50,
        });
      }
    },
  },
  created() {},
  mounted() {
    this.initMounted();
  },
  watch: {},
};
</script>
