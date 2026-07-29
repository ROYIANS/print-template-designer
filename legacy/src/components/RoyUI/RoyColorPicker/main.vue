<template>
  <div
    ref="colorPicker"
    v-clickoutside="closePanel"
    class="roy-color-picker"
    @click="
      (event) => {
        event.stopPropagation()
      }
    "
  >
    <!-- 颜色显示小方块 -->
    <div
      :class="{ disabled: disabled }"
      :style="`background-color: ${showColor}`"
      class="roy-color-picker__color-btn"
      @click="openPanel"
    ></div>
    <!-- 颜色色盘 -->
    <div :class="{ open: openStatus }" class="roy-color-picker__box">
      <div class="roy-color-picker__hd">
        <div
          :style="{ 'background-color': showPanelColor }"
          class="roy-color-picker__color-view"
        ></div>
        <div
          class="roy-color-picker__default-color"
          @click="handleDefaultColor"
          @mouseout="handleOver('')"
          @mouseover="handleOver(defaultColor)"
        >
          默认颜色
        </div>
      </div>
      <div class="roy-color-picker__bd">
        <h3>主题颜色</h3>
        <ul class="roy-color-picker__t-color">
          <li
            v-for="(color, index) of tColor"
            :key="index"
            :style="{ backgroundColor: color }"
            @click="updateValue(color)"
            @mouseout="handleOver('')"
            @mouseover="handleOver(color)"
          ></li>
        </ul>
        <ul class="roy-color-picker__b-color">
          <li v-for="(item, index) of colorPanel" :key="index">
            <ul>
              <li
                v-for="(color, cindex) of item"
                :key="cindex"
                :style="{ backgroundColor: color }"
                @click="updateValue(color)"
                @mouseout="handleOver('')"
                @mouseover="handleOver(color)"
              ></li>
            </ul>
          </li>
        </ul>
        <h3>标准颜色</h3>
        <ul class="roy-color-picker__t-color">
          <li
            v-for="(color, index) of bColor"
            :key="index"
            :style="{ backgroundColor: color }"
            @click="updateValue(color)"
            @mouseout="handleOver('')"
            @mouseover="handleOver(color)"
          ></li>
        </ul>
        <h3>
          <span>更多颜色...</span>
          <i class="ri-arrow-right-line roy-color-picker__m-color" @click="triggerHtml5Color"></i>
        </h3>
        <!-- 用以激活HTML5颜色面板 -->
        <input
          ref="html5ColorEl"
          v-model="html5Color"
          type="color"
          @change="updateValue(html5Color)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Clickoutside from '../utils/clickoutside'

export default {
  name: 'RoyColorPicker',
  componentName: 'RoyColorPicker',
  directives: {
    clickoutside: Clickoutside
  },
  props: {
    modelValue: String,
    defaultColor: {
      type: String,
      default: '#000000'
    },
    disabled: Boolean
  },
  data() {
    return {
      openStatus: false,
      hoveColor: '',
      html5Color: this.modelValue,
      colorConfig: [
        ['#7f7f7f', '#f2f2f2'],
        ['#0d0d0d', '#808080'],
        ['#1c1a10', '#ddd8c3'],
        ['#0e243d', '#c6d9f0'],
        ['#233f5e', '#dae5f0'],
        ['#632623', '#f2dbdb'],
        ['#4d602c', '#eaf1de'],
        ['#3f3150', '#e6e0ec'],
        ['#1e5867', '#d9eef3'],
        ['#99490f', '#fee9da']
      ],
      tColor: [
        '#000000',
        '#ffffff',
        '#eeece1',
        '#1e497b',
        '#4e81bb',
        '#e2534d',
        '#9aba60',
        '#8165a0',
        '#47acc5',
        '#f9974c'
      ],
      bColor: [
        '#c21401',
        '#ff1e02',
        '#ffc12a',
        '#ffff3a',
        '#90cf5b',
        '#00af57',
        '#00afee',
        '#0071be',
        '#00215f',
        '#72349d'
      ]
    }
  },
  computed: {
    showPanelColor() {
      if (this.hoveColor) {
        return this.hoveColor
      } else {
        return this.showColor
      }
    },
    showColor() {
      if (this.modelValue) {
        return this.modelValue
      } else {
        return this.defaultColor
      }
    },
    colorPanel() {
      let colorArr = []
      for (let color of this.colorConfig) {
        colorArr.push(this.gradient(color[1], color[0], 5))
      }
      return colorArr
    }
  },
  methods: {
    openPanel() {
      this.openStatus = !this.disabled
    },
    closePanel() {
      this.openStatus = false
    },
    handleOver(color) {
      this.hoveColor = color
    },
    triggerHtml5Color() {
      this.$refs.html5ColorEl.click()
    },
    updateValue(value) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
      this.openStatus = false
    },
    handleDefaultColor() {
      this.updateValue(this.defaultColor)
    },
    parseColor(hexStr) {
      if (hexStr.length === 4) {
        return (hexStr =
          '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3])
      } else {
        return hexStr
      }
    },
    rgbToHex(r, g, b) {
      const hex = ((r << 16) | (g << 8) | b).toString(16)
      return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex
    },
    hexToRgb(hex) {
      hex = this.parseColor(hex)
      let rgb = []
      for (let i = 1; i < 7; i += 2) {
        rgb.push(parseInt('0x' + hex.slice(i, i + 2)))
      }
      return rgb
    },
    gradient(startColor, endColor, step) {
      // 将 hex 转换为 rgb
      let sColor = this.hexToRgb(startColor)
      let eColor = this.hexToRgb(endColor)
      // 计算R\G\B每一步的差值
      let rStep = (eColor[0] - sColor[0]) / step
      let gStep = (eColor[1] - sColor[1]) / step
      let bStep = (eColor[2] - sColor[2]) / step
      let gradientColorArr = []
      // 计算每一步的hex值
      for (let i = 0; i < step; i++) {
        gradientColorArr.push(
          this.rgbToHex(rStep * i + sColor[0], gStep * i + sColor[1], bStep * i + sColor[2])
        )
      }
      return gradientColorArr
    }
  }
}
</script>
