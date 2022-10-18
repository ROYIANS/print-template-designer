<template>
  <ul v-show="visible" ref="contextmenu" :class="contextmenuCls" :style="style">
    <slot></slot>
  </ul>
</template>

<script>
export default {
  name: "RoyContext",

  provide() {
    return {
      $$contextmenu: this,
    };
  },

  props: {
    eventType: {
      type: String,
      default: "contextmenu",
    },
    theme: {
      type: String,
      default: "default",
    },
    autoPlacement: {
      type: Boolean,
      default: true,
    },
    disabled: Boolean,
  },

  data() {
    return {
      visible: false,
      references: [],
      style: {
        top: 0,
        left: 0,
      },
    };
  },
  computed: {
    clickOutsideHandler() {
      return this.visible ? this.hide : () => {};
    },
    isClick() {
      return this.eventType === "click";
    },
    contextmenuCls() {
      return ["roy-context", `roy-context--${this.theme}`];
    },
  },

  watch: {
    visible(value) {
      if (value) {
        this.$emit("show", this);

        document.body.addEventListener("click", this.handleBodyClick);
      } else {
        this.$emit("hide", this);

        document.body.removeEventListener("click", this.handleBodyClick);
      }
    },
  },
  mounted() {
    document.body.appendChild(this.$el);

    if (window.$$VContextmenu) {
      window.$$VContextmenu[this.$contextmenuId] = this;
    } else {
      window.$$VContextmenu = { [this.$contextmenuId]: this };
    }
  },
  beforeDestroy() {
    document.body.removeChild(this.$el);

    delete window.$$VContextmenu[this.$contextmenuId];

    this.references.forEach((ref) => {
      ref.el.removeEventListener(
        this.eventType,
        this.handleReferenceContextmenu
      );
    });

    document.body.removeEventListener("click", this.handleBodyClick);
  },

  methods: {
    addRef(ref) {
      // FIXME: 如何处理 removeRef？
      this.references.push(ref);

      ref.el.addEventListener(this.eventType, this.handleReferenceContextmenu);
    },
    handleReferenceContextmenu(event) {
      event.preventDefault();

      if (this.disabled) return;

      const reference = this.references.find((ref) =>
        ref.el.contains(event.target)
      );

      this.$emit("contextmenu", reference ? reference.vnode : null);

      const eventX = event.pageX;
      const eventY = event.pageY;

      this.show();

      this.$nextTick(() => {
        const contextmenuPosition = {
          top: eventY,
          left: eventX,
        };

        if (this.autoPlacement) {
          const contextmenuWidth = this.$refs.contextmenu.clientWidth;
          const contextmenuHeight = this.$refs.contextmenu.clientHeight;

          if (contextmenuHeight + eventY >= window.innerHeight) {
            contextmenuPosition.top -= contextmenuHeight;
          }

          if (contextmenuWidth + eventX >= window.innerWidth) {
            contextmenuPosition.left -= contextmenuWidth;
          }
        }

        this.style = {
          top: `${contextmenuPosition.top}px`,
          left: `${contextmenuPosition.left}px`,
        };
      });
    },
    handleBodyClick(event) {
      const notOutside =
        this.$el.contains(event.target) ||
        (this.isClick &&
          this.references.some((ref) => ref.el.contains(event.target)));

      if (!notOutside) {
        this.visible = false;
      }
    },
    show(position) {
      Object.keys(window.$$VContextmenu).forEach((key) => {
        if (key !== this.$contextmenuId) {
          window.$$VContextmenu[key].hide();
        }
      });

      if (position) {
        this.style = {
          top: `${position.top}px`,
          left: `${position.left}px`,
        };
      }

      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    hideAll() {
      Object.keys(window.$$VContextmenu).forEach((key) => {
        window.$$VContextmenu[key].hide();
      });
    },
  },
};
</script>

<style>
.roy-context {
  position: absolute;
  padding: 5px 0;
  margin: 0;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 2px 2px 8px 0 rgba(150, 150, 150, 0.2);
  list-style: none;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  z-index: 2800;
  -webkit-tap-highlight-color: transparent;
}

.roy-context .roy-context-item {
  padding: 5px 14px;
  line-height: 1;
  color: #333;
  display: flex;
  align-items: center;
}

.roy-context .roy-context-item.roy-context-item--hover {
  color: #fff;
}

.roy-context .roy-context-item.roy-context-item--disabled {
  color: #ccc;
  cursor: not-allowed;
}

.roy-context .roy-context-divider {
  height: 0;
  margin: 5px 0;
  border-bottom: 1px solid #e8e8e8;
}

.roy-context .roy-context-group__menus {
  padding: 0 5px;
  margin: 0;
  list-style: none;
}

.roy-context .roy-context-group__menus .roy-context-item {
  display: inline-block;
  padding: 5px 9px;
}

.roy-context .roy-context-submenu {
  position: relative;
}

.roy-context .roy-context-submenu > .roy-context {
  position: absolute;
}

.roy-context .roy-context-submenu > .roy-context.left {
  left: 0;
  transform: translateX(-100%);
}

.roy-context .roy-context-submenu > .roy-context.right {
  right: 0;
  transform: translateX(100%);
}

.roy-context .roy-context-submenu > .roy-context.top {
  top: -6px;
}

.roy-context .roy-context-submenu > .roy-context.bottom {
  bottom: -6px;
}

.roy-context .roy-context-submenu .roy-context-submenu__title {
  margin-right: 10px;
}

.roy-context .roy-context-submenu .roy-context-submenu__icon {
  position: absolute;
  right: 5px;
}

.roy-context .roy-context-submenu .roy-context-submenu__icon::before {
  content: "\e622";
}

.roy-context--default .roy-context-item--hover {
  background-color: #4579e1;
}

.roy-context--bright .roy-context-item--hover {
  background-color: #ef5350;
}

.roy-context--dark .roy-context-item--hover {
  background-color: #2d3035;
}
.roy-context--dark {
  background: #222222;
  box-shadow: 2px 2px 8px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid #111111;
}
.roy-context--dark .roy-context-item {
  color: #ccc;
}
.roy-context-item i {
  padding: 0 10px 0 0;
}
</style>
