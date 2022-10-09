import styled, { keyframes } from "vue-styled-components";

const openMenu = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;
const closeMenu = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
`;

export const StyleMenu = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 10px 0 rgba(39, 54, 78, 0.08),
    0 12px 40px 0 rgba(39, 54, 78, 0.1);
  background: ${(props) => props.menuConfigs.bgColor};
  border-radius: 2px;
  padding: 6px 0;
  transition: opacity 0.2s ease-in-out;
  transform-origin: 0 0;
  animation: ${openMenu} 0.2s;
  animation-fill-mode: forwards;
  z-index: 999;
  &.hide-menu {
    animation: ${closeMenu} 0.1s;
    animation-fill-mode: forwards;
    z-index: -9999;
  }
  .divider {
    margin: 4px 12px;
    border-top: 1px solid ${(props) => props.menuConfigs.dividerColor};
    min-width: ${(props) => (props.lang === "ch" ? "82%" : "87%")};
  }
  .menu-content {
    font-size: 12px;
    font-family: PingFangSC, sans-serif;
    color: ${(props) => props.menuConfigs.listItem.textColor};
    background: ${(props) => props.menuConfigs.listItem.bgColor};
    width: 100%;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    cursor: pointer;
    svg > path {
      fill: ${(props) => props.menuConfigs.listItem.textColor};
    }
    &.disabled {
      color: ${(props) => props.menuConfigs.listItem.disabledTextColor};
      &:hover {
        cursor: not-allowed;
        background: none;
        color: ${(props) => props.menuConfigs.listItem.disabledTextColor};
      }
    }
  }
  .menu-content:hover {
    background: ${(props) => props.menuConfigs.listItem.hoverBgColor};
    cursor: pointer;
    color: ${(props) => props.menuConfigs.listItem.hoverTextColor};

    svg > path {
      fill: ${(props) => props.menuConfigs.listItem.hoverTextColor};
    }
  }
`;

export const StyledRuler = styled.div`
  position: absolute;
  width: 100%; /* scrollbar width */
  height: 100%;
  z-index: 3; /* 需要比resizer高 */
  pointer-events: none;
  font-size: 12px;
  overflow: hidden;
  span {
    line-height: 1;
  }

  .corner {
    position: absolute;
    left: 0;
    top: 0;
    width: ${(props) => props.thick + "px"};
    height: ${(props) => props.thick + "px"};
    border-right: 1px solid ${(props) => props.borderColor};
    border-bottom: 1px solid ${(props) => props.borderColor};
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    box-sizing: content-box;
    &.active {
      background-color: ${(props) => props.cornerActiveColor} !important;
    }
  }

  .indicator {
    position: absolute;
    pointer-events: none;
    .value {
      position: absolute;
      background: white;
    }
  }

  .ruler {
    width: 100%;
    height: 100%;
    pointer-events: auto;
  }

  .line {
    position: absolute;
    .action {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .value {
      pointer-events: none;
      transform: scale(0.83);
    }
    .del {
      cursor: pointer;
      padding: 3px 5px;
      visibility: hidden;
    }
    &:hover .del {
      visibility: visible;
    }
  }

  .h-container,
  .v-container {
    position: absolute;
    .lines {
      pointer-events: none;
    }
    &:hover .lines {
      pointer-events: auto;
    }
  }

  .h-container {
    left: ${(props) => props.thick + "px"};
    top: 0;
    width: calc(100% - ${(props) => props.thick + "px"});
    height: ${(props) => `${props.thick + 1}px`};

    .line {
      height: 100vh;
      top: 0;
      padding-left: 5px;
      border-left: 1px solid ${(props) => props.lineColor};
      cursor: ${(props) => (props.isShowReferLine ? "ew-resize" : "none")};
      .action {
        top: ${(props) => props.thick + "px"};
        transform: translateX(-24px);
        .value {
          margin-left: 4px;
        }
      }
    }

    .indicator {
      top: 0;
      border-left: 1px solid ${(props) => props.lineColor};
      height: 100vw;
      .value {
        margin-left: 2px;
        margin-top: 4px;
      }
    }
  }

  .v-container {
    top: ${(props) => props.thick + "px"};
    left: 0;
    width: ${(props) => `${props.thick + 1}px`};
    height: calc(100% - ${(props) => props.thick + "px"});

    .line {
      width: 100vw;
      left: 0;
      padding-top: 5px;
      border-top: 1px solid ${(props) => props.lineColor};
      cursor: ${(props) => (props.isShowReferLine ? "ns-resize" : "none")};
      .action {
        left: ${(props) => props.thick + "px"};
        transform: translateY(-24px);
        flex-direction: column;
        .value {
          margin-top: 4px;
        }
      }
    }

    .indicator {
      border-bottom: 1px solid ${(props) => props.lineColor};
      width: 100vw;
      .value {
        margin-left: 2px;
        margin-top: -5px;
        transform-origin: 0 0;
        transform: rotate(-90deg);
      }
    }
  }
`;
