<!--
* @description 标尺横向
* @filename RulerHorizontal.vue
* @author ROYIANS
* @date 2022/9/16 16:57
!-->
<template>
  <div ref="rulerDiv" class="roy-ruler"></div>
</template>

<script>
import commonMixin from "@/mixin/commonMixin";
import Ruler from "@scena/ruler";
import { mapState } from "vuex";

/**
 * 标尺横向
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
  computed: {
    isNightMode() {
      return this.$store.state.printTemplateModule.nightMode.isNightMode;
    },
  },
  methods: {
    initMounted() {
      let elements = document.getElementsByClassName("roy-ruler-outer-box");
      if (elements.length) {
        this.ruler = new Ruler(this.$refs.rulerDiv, {
          type: "horizontal",
          backgroundColor: window.getComputedStyle(elements[0]).backgroundColor,
          textColor: window.getComputedStyle(elements[0]).color,
          height: 16,
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
  watch: {
    isNightMode() {
      let elements = document.getElementsByClassName("roy-ruler-outer-box");
      if (elements.length) {
        this.ruler.backgroundColor = window.getComputedStyle(
          elements[0]
        ).backgroundColor;
        this.ruler.textColor = window.getComputedStyle(elements[0]).color;
      }
    },
  },
};
</script>
