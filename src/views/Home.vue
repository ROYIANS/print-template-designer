<!--
* @description 主页
* @filename Home.vue
* @author ROYIANS
* @date 2022/9/29 9:23
!-->
<template>
  <el-container class="roy-designer-container">
    <el-header class="roy-designer-header" height="40px">
      <div class="roy-designer-header__text">
        <i class="ri-pen-nib-line"></i>
        <span>打印模板设计器</span>
      </div>
      <div class="toggleWrapper">
        <input type="checkbox" class="dn" id="dn" @change="dayNightChange" />
        <label for="dn" class="toggle">
          <span class="toggle__handler">
            <span class="crater crater--1"></span>
            <span class="crater crater--2"></span>
            <span class="crater crater--3"></span>
          </span>
          <span class="star star--1"></span>
          <span class="star star--2"></span>
          <span class="star star--3"></span>
          <span class="star star--4"></span>
          <span class="star star--5"></span>
          <span class="star star--6"></span>
        </label>
      </div>
    </el-header>
    <el-container style="height: calc(100% - 40px)">
      <el-aside class="roy-designer-aside" width="300px">
        <DesignerAside />
      </el-aside>
      <el-main class="roy-designer-main">
        <DesignerMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { nightModeStore } from "@/stores/night-mode.js";
import DesignerAside from "@/views/DesignerAside.vue";
import DesignerMain from "@/views/DesignerMain.vue";

/**
 * 主页
 */
export default {
  name: "HomePage",
  components: {
    DesignerAside,
    DesignerMain,
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    initMounted() {
      this.initConfig();
    },
    initConfig() {
      const nightMode = nightModeStore();
      nightMode.initNightMode();
      document.getElementById("dn").checked = nightMode.isNightMode;
    },
    dayNightChange(e) {
      const nightMode = nightModeStore();
      const isNightMode = e.target.checked;
      nightMode.toggleNightMode(isNightMode);
    },
  },
  created() {},
  mounted() {
    this.initMounted();
  },
  watch: {},
};
</script>

<style lang="scss">
.roy-designer-container {
  background: var(--prism-background);
  width: 100%;
  height: 100%;

  .roy-designer-header {
    background: var(--roy-menu-bar-background);
    width: 100%;

    .roy-designer-header__text {
      color: #fff;
      display: flex;
      height: 100%;
      align-items: center;
    }

    .toggleWrapper {
      position: absolute;
      top: 8px;
      right: 5px;
      overflow: hidden;
      padding: 0 50px;

      input {
        position: absolute;
        left: -99em;
      }
    }

    .toggle {
      cursor: pointer;
      display: inline-block;
      position: relative;
      width: 45px;
      height: 25px;
      background-color: #83d8ff;
      border-radius: 45px - 3;
      transition: background-color 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95);

      &:before {
        content: "日间";
        position: absolute;
        left: -35px;
        top: 6px;
        font-size: 12px;
        color: #fff;
      }

      &:after {
        content: "夜间";
        position: absolute;
        right: -35px;
        top: 5px;
        font-size: 12px;
        color: #749ed7;
      }
    }

    .toggle__handler {
      display: inline-block;
      position: relative;
      z-index: 1;
      top: 1px;
      left: 0;
      width: 25px - 3;
      height: 25px - 3;
      background-color: #ffcf96;
      border-radius: 25px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      transition: all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
      transform: rotate(-45deg);

      .crater {
        position: absolute;
        background-color: #e8cda5;
        opacity: 0;
        transition: opacity 200ms ease-in-out;
        border-radius: 100%;
      }

      .crater--1 {
        top: 10px;
        left: 5px;
        width: 2px;
        height: 2px;
      }

      .crater--2 {
        top: 15px;
        left: 11px;
        width: 3px;
        height: 3px;
      }

      .crater--3 {
        top: 5px;
        left: 12px;
        width: 4px;
        height: 4px;
      }
    }

    .star {
      position: absolute;
      background-color: #ffffff;
      transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
      border-radius: 50%;
    }

    .star--1 {
      top: 5px;
      left: 18px;
      z-index: 0;
      width: 15px;
      height: 2px;
    }

    .star--2 {
      top: 9px;
      left: 16px;
      z-index: 1;
      width: 15px;
      height: 2px;
    }

    .star--3 {
      top: 14px;
      left: 24px;
      z-index: 0;
      width: 15px;
      height: 2px;
    }

    .star--4,
    .star--5,
    .star--6 {
      opacity: 0;
      transition: all 300ms 0ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
    }

    .star--4 {
      top: 6px;
      left: 6px;
      z-index: 0;
      width: 2px;
      height: 2px;
      transform: translate3d(3px, 0, 0);
    }

    .star--5 {
      top: 16px;
      left: 8px;
      z-index: 0;
      width: 3px;
      height: 3px;
      transform: translate3d(3px, 0, 0);
    }

    .star--6 {
      top: 19px;
      left: 13px;
      z-index: 0;
      width: 2px;
      height: 2px;
      transform: translate3d(3px, 0, 0);
    }

    input:checked {
      + .toggle {
        background-color: #749dd6;

        &:before {
          color: #749ed7;
        }

        &:after {
          color: #ffffff;
        }

        .toggle__handler {
          background-color: #ffe5b5;
          transform: translate3d(22px, 0, 0) rotate(0);

          .crater {
            opacity: 1;
          }
        }

        .star--1 {
          width: 2px;
          height: 2px;
        }

        .star--2 {
          width: 4px;
          height: 4px;
          transform: translate3d(-5px, 0, 0);
        }

        .star--3 {
          width: 2px;
          height: 2px;
          transform: translate3d(-7px, 0, 0);
        }

        .star--4,
        .star--5,
        .star--6 {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }

        .star--4 {
          transition: all 300ms 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
        }

        .star--5 {
          transition: all 300ms 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
        }

        .star--6 {
          transition: all 300ms 400ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
        }
      }
    }
  }

  .roy-designer-aside {
    margin: 10px 5px 10px 10px;
  }

  .roy-designer-main {
    width: 60%;
    margin: 5px;
    border-radius: 2px;
    overflow: auto;
    padding: 0;
  }
}
</style>
