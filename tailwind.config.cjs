/* eslint-env node */
const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  prefix: 'ptd-',
  theme: {
    extend: {
      // ========== 颜色配置 ==========
      colors: {
        // 品牌色
        brand: {
          DEFAULT: 'var(--ptd-brand-color)',
          hover: 'var(--ptd-brand-color-hover)',
          focus: 'var(--ptd-brand-color-focus)',
          active: 'var(--ptd-brand-color-active)',
          disabled: 'var(--ptd-brand-color-disabled)',
          light: 'var(--ptd-brand-color-light)',
          1: 'var(--ptd-brand-color-1)',
          2: 'var(--ptd-brand-color-2)',
          3: 'var(--ptd-brand-color-3)',
          4: 'var(--ptd-brand-color-4)',
          5: 'var(--ptd-brand-color-5)',
          6: 'var(--ptd-brand-color-6)',
          7: 'var(--ptd-brand-color-7)',
          8: 'var(--ptd-brand-color-8)',
          9: 'var(--ptd-brand-color-9)',
          10: 'var(--ptd-brand-color-10)',
        },

        // 警告色
        warning: {
          DEFAULT: 'var(--ptd-warning-color)',
          hover: 'var(--ptd-warning-color-hover)',
          focus: 'var(--ptd-warning-color-focus)',
          active: 'var(--ptd-warning-color-active)',
          disabled: 'var(--ptd-warning-color-disabled)',
          light: 'var(--ptd-warning-color-light)',
          1: 'var(--ptd-warning-color-1)',
          2: 'var(--ptd-warning-color-2)',
          3: 'var(--ptd-warning-color-3)',
          4: 'var(--ptd-warning-color-4)',
          5: 'var(--ptd-warning-color-5)',
          6: 'var(--ptd-warning-color-6)',
          7: 'var(--ptd-warning-color-7)',
          8: 'var(--ptd-warning-color-8)',
          9: 'var(--ptd-warning-color-9)',
          10: 'var(--ptd-warning-color-10)',
        },

        // 错误色
        error: {
          DEFAULT: 'var(--ptd-error-color)',
          hover: 'var(--ptd-error-color-hover)',
          focus: 'var(--ptd-error-color-focus)',
          active: 'var(--ptd-error-color-active)',
          disabled: 'var(--ptd-error-color-disabled)',
          light: 'var(--ptd-error-color-light)',
          1: 'var(--ptd-error-color-1)',
          2: 'var(--ptd-error-color-2)',
          3: 'var(--ptd-error-color-3)',
          4: 'var(--ptd-error-color-4)',
          5: 'var(--ptd-error-color-5)',
          6: 'var(--ptd-error-color-6)',
          7: 'var(--ptd-error-color-7)',
          8: 'var(--ptd-error-color-8)',
          9: 'var(--ptd-error-color-9)',
          10: 'var(--ptd-error-color-10)',
        },

        // 成功色
        success: {
          DEFAULT: 'var(--ptd-success-color)',
          hover: 'var(--ptd-success-color-hover)',
          focus: 'var(--ptd-success-color-focus)',
          active: 'var(--ptd-success-color-active)',
          disabled: 'var(--ptd-success-color-disabled)',
          light: 'var(--ptd-success-color-light)',
          1: 'var(--ptd-success-color-1)',
          2: 'var(--ptd-success-color-2)',
          3: 'var(--ptd-success-color-3)',
          4: 'var(--ptd-success-color-4)',
          5: 'var(--ptd-success-color-5)',
          6: 'var(--ptd-success-color-6)',
          7: 'var(--ptd-success-color-7)',
          8: 'var(--ptd-success-color-8)',
          9: 'var(--ptd-success-color-9)',
          10: 'var(--ptd-success-color-10)',
        },

        // 灰色
        gray: {
          1: 'var(--ptd-gray-color-1)',
          2: 'var(--ptd-gray-color-2)',
          3: 'var(--ptd-gray-color-3)',
          4: 'var(--ptd-gray-color-4)',
          5: 'var(--ptd-gray-color-5)',
          6: 'var(--ptd-gray-color-6)',
          7: 'var(--ptd-gray-color-7)',
          8: 'var(--ptd-gray-color-8)',
          9: 'var(--ptd-gray-color-9)',
          10: 'var(--ptd-gray-color-10)',
          11: 'var(--ptd-gray-color-11)',
          12: 'var(--ptd-gray-color-12)',
          13: 'var(--ptd-gray-color-13)',
          14: 'var(--ptd-gray-color-14)',
        },

        // 文字颜色
        'for-text': {
          primary: 'var(--ptd-text-color-primary)',
          secondary: 'var(--ptd-text-color-secondary)',
          placeholder: 'var(--ptd-text-color-placeholder)',
          disabled: 'var(--ptd-text-color-disabled)',
          anti: 'var(--ptd-text-color-anti)',
          brand: 'var(--ptd-text-color-brand)',
          link: 'var(--ptd-text-color-link)',
        },

        // 背景色
        'for-background': {
          page: 'var(--ptd-bg-color-page)',
          container: 'var(--ptd-bg-color-container)',
          'container-hover': 'var(--ptd-bg-color-container-hover)',
          'container-active': 'var(--ptd-bg-color-container-active)',
          'container-select': 'var(--ptd-bg-color-container-select)',
          secondarycontainer: 'var(--ptd-bg-color-secondarycontainer)',
          'secondarycontainer-hover': 'var(--ptd-bg-color-secondarycontainer-hover)',
          'secondarycontainer-active': 'var(--ptd-bg-color-secondarycontainer-active)',
          component: 'var(--ptd-bg-color-component)',
          'component-hover': 'var(--ptd-bg-color-component-hover)',
          'component-active': 'var(--ptd-bg-color-component-active)',
          secondarycomponent: 'var(--ptd-bg-color-secondarycomponent)',
          'secondarycomponent-hover': 'var(--ptd-bg-color-secondarycomponent-hover)',
          'secondarycomponent-active': 'var(--ptd-bg-color-secondarycomponent-active)',
          'component-disabled': 'var(--ptd-bg-color-component-disabled)',
          specialcomponent: 'var(--ptd-bg-color-specialcomponent)',
        },

        // 边框颜色
        'for-border': {
          1: 'var(--ptd-border-level-1-color)',
          2: 'var(--ptd-border-level-2-color)',
          component: 'var(--ptd-component-border)',
          stroke: 'var(--ptd-component-stroke)',
        },
      },

      // ========== 间距配置 ==========
      spacing: {
        spacer: 'var(--ptd-spacer)', // 8px
        'spacer-s': 'var(--ptd-spacer-s)', // 4px
        'spacer-m': 'var(--ptd-spacer-m)', // 6px
        'spacer-l': 'var(--ptd-spacer-l)', // 12px
        1: 'var(--ptd-spacer-1)', // 8px
        2: 'var(--ptd-spacer-2)', // 16px
        3: 'var(--ptd-spacer-3)', // 24px
        4: 'var(--ptd-spacer-4)', // 32px
        5: 'var(--ptd-spacer-5)', // 40px
        6: 'var(--ptd-spacer-6)', // 48px
        7: 'var(--ptd-spacer-7)', // 56px
        8: 'var(--ptd-spacer-8)', // 64px
        9: 'var(--ptd-spacer-9)', // 72px
        10: 'var(--ptd-spacer-10)', // 80px
      },

      // ========== 字体配置 ==========
      fontFamily: {
        sans: 'var(--ptd-font-family)', // 常规字体
        medium: 'var(--ptd-font-family-medium)', // 中等字重
      },
      fontSize: {
        'body-sm': 'var(--ptd-font-size-body-small)',
        'body-md': 'var(--ptd-font-size-body-medium)',
        'body-lg': 'var(--ptd-font-size-body-large)',
        'title-lg': 'var(--ptd-font-size-title-large)',
        'headline-lg': 'var(--ptd-font-size-headline-large)',

        // 特殊字体组合
        'link-sm': 'var(--ptd-font-link-small)',
        'link-md': 'var(--ptd-font-link-medium)',
        'link-lg': 'var(--ptd-font-link-large)',
        'mark-sm': 'var(--ptd-font-mark-small)',
        'mark-md': 'var(--ptd-font-mark-medium)',
        'title-sm': 'var(--ptd-font-title-small)',
        'title-md': 'var(--ptd-font-title-medium)',
        'headline-sm': 'var(--ptd-font-headline-small)',
        'headline-md': 'var(--ptd-font-headline-medium)',
        'display-md': 'var(--ptd-font-display-medium)',
        'display-lg': 'var(--ptd-font-display-large)',
      },
      lineHeight: {
        'body-sm': 'var(--ptd-line-height-body-small)',
        'body-md': 'var(--ptd-line-height-body-medium)',
        'body-lg': 'var(--ptd-line-height-body-large)',
        'title-lg': 'var(--ptd-line-height-title-large)',
        'headline-lg': 'var(--ptd-line-height-headline-large)',
      },

      // ========== 圆角配置 ==========
      borderRadius: {
        sm: 'var(--ptd-radius-small)', // 2px
        DEFAULT: 'var(--ptd-radius-default)', // 3px
        md: 'var(--ptd-radius-medium)', // 6px
        lg: 'var(--ptd-radius-large)', // 9px
        xl: 'var(--ptd-radius-extraLarge)', // 12px
        round: 'var(--ptd-radius-round)', // 999px
        full: 'var(--ptd-radius-circle)', // 50%
      },

      // ========== 阴影配置 ==========
      boxShadow: {
        'layer-1': 'var(--ptd-shadow-1)',
        'layer-2': 'var(--ptd-shadow-2)',
        'layer-3': 'var(--ptd-shadow-3)',
        'inset-top': 'var(--ptd-shadow-inset-top)',
        'inset-right': 'var(--ptd-shadow-inset-right)',
        'inset-bottom': 'var(--ptd-shadow-inset-bottom)',
        'inset-left': 'var(--ptd-shadow-inset-left)',
        'combined-2': 'var(--ptd-shadow-2-inset)',
        'combined-3': 'var(--ptd-shadow-3-inset)',
      },

      // ========== 尺寸配置 ==========
      width: {
        sizes: {
          1: 'var(--ptd-size-1)',
          2: 'var(--ptd-size-2)',
          3: 'var(--ptd-size-3)',
          4: 'var(--ptd-size-4)',
          5: 'var(--ptd-size-5)',
          6: 'var(--ptd-size-6)',
          7: 'var(--ptd-size-7)',
          8: 'var(--ptd-size-8)',
          9: 'var(--ptd-size-9)',
          10: 'var(--ptd-size-10)',
          11: 'var(--ptd-size-11)',
          12: 'var(--ptd-size-12)',
          13: 'var(--ptd-size-13)',
          14: 'var(--ptd-size-14)',
          15: 'var(--ptd-size-15)',
          16: 'var(--ptd-size-16)',
        },
      },
      height: {
        sizes: {
          1: 'var(--ptd-size-1)',
          2: 'var(--ptd-size-2)',
          3: 'var(--ptd-size-3)',
          4: 'var(--ptd-size-4)',
          5: 'var(--ptd-size-5)',
          6: 'var(--ptd-size-6)',
          7: 'var(--ptd-size-7)',
          8: 'var(--ptd-size-8)',
          9: 'var(--ptd-size-9)',
          10: 'var(--ptd-size-10)',
          11: 'var(--ptd-size-11)',
          12: 'var(--ptd-size-12)',
          13: 'var(--ptd-size-13)',
          14: 'var(--ptd-size-14)',
          15: 'var(--ptd-size-15)',
          16: 'var(--ptd-size-16)',
        },
      },

      // ========== 组件尺寸 ==========
      components: {
        xxxs: 'var(--ptd-comp-size-xxxs)',
        xxs: 'var(--ptd-comp-size-xxs)',
        xs: 'var(--ptd-comp-size-xs)',
        s: 'var(--ptd-comp-size-s)',
        m: 'var(--ptd-comp-size-m)',
        l: 'var(--ptd-comp-size-l)',
        xl: 'var(--ptd-comp-size-xl)',
        xxl: 'var(--ptd-comp-size-xxl)',
        xxxl: 'var(--ptd-comp-size-xxxl)',
        xxxxl: 'var(--ptd-comp-size-xxxxl)',
        xxxxxl: 'var(--ptd-comp-size-xxxxxl)',
      },

      // ========== 断点配置 ==========
      screens: {
        xs: '320px',
        sm: '768px',
        md: '992px',
        lg: '1200px',
        xl: '1400px',
        xxl: '1880px',
      },

      // ========== 动效配置 ==========
      transitionTimingFunction: {
        easing: 'var(--ptd-anim-time-fn-easing)',
        'ease-out': 'var(--ptd-anim-time-fn-ease-out)',
        'ease-in': 'var(--ptd-anim-time-fn-ease-in)',
      },
      transitionDuration: {
        base: 'var(--ptd-anim-duration-base)', // 0.2s
        moderate: 'var(--ptd-anim-duration-moderate)', // 0.24s
        slow: 'var(--ptd-anim-duration-slow)', // 0.28s
      },

      // ========== 层级配置 ==========
      zIndex: {
        'back-top': 'var(--ptd-z-index-back-top)',
        affix: 'var(--ptd-z-index-affix)',
        drawer: 'var(--ptd-z-index-drawer)',
        dialog: 'var(--ptd-z-index-dialog)',
        'image-viewer': 'var(--ptd-z-index-image-viewer)',
        loading: 'var(--ptd-z-index-loading)',
        message: 'var(--ptd-z-index-message)',
        popup: 'var(--ptd-z-index-Popup)',
        tooltip: 'var(--ptd-z-index-Tooltip)',
        notification: 'var(--ptd-z-index-Notification)',
        dragging: 'var(--ptd-z-index-dragging)',
        guide: 'var(--ptd-z-index-guide)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    iconsPlugin({
      // Collections: https://icones.js.org/
      collections: getIconCollections(['ri', 'mdi']),
    }),
    function ({ addComponents, addUtilities }) {
      // ========== 自定义组件 ==========
      addComponents({
        // 图标系统
        '.ptd-icon': {
          width: 'var(--ptd-icon-default)',
          height: 'var(--ptd-icon-default)',
          flexShrink: 0,
          '&-l': {
            width: 'var(--ptd-icon-l)',
            height: 'var(--ptd-icon-l)',
          },
        },

        // 表单元素
        '.ptd-form-control': {
          height: 'var(--ptd-form-height)',
          backgroundColor: 'var(--ptd-form-bg-color)',
          borderColor: 'var(--ptd-form-border-color)',
          color: 'var(--ptd-form-text-color)',
        },

        // 滚动条样式
        '.ptd-scrollbar': {
          '&::-webkit-scrollbar': {
            width: 'var(--ptd-scrollbar-width, 6px)',
            height: 'var(--ptd-scrollbar-height, 6px)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--ptd-scrollbar-color)',
            '&:hover': {
              backgroundColor: 'var(--ptd-scrollbar-hover-color)',
            },
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'var(--ptd-scroll-track-color)',
          },
        },
      })

      // ========== 自定义工具类 ==========
      addUtilities({
        // 特殊背景遮罩
        '.bg-mask-active': {
          'background-color': 'var(--ptd-mask-active)',
        },
        '.bg-mask-disabled': {
          'background-color': 'var(--ptd-mask-disabled)',
        },

        // 复合阴影
        '.shadow-inset': {
          'box-shadow': 'var(--ptd-shadow-inset)',
        },
        '.shadow-layer-2-inset': {
          'box-shadow': 'var(--ptd-shadow-2-inset)',
        },
        '.shadow-layer-3-inset': {
          'box-shadow': 'var(--ptd-shadow-3-inset)',
        },
      })
    },
  ],
}
