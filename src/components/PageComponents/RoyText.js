/*
 * @Author: ROYIANS
 * @Date: 2022/10/18 9:12
 * @Description: 文本
 * @sign: 迷路，并无小路大路短路长路之区别。不能说在大路长路上迷路就不是迷路了。走在达不到目的的路上，就是迷路。
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
import { StyledText } from "@/components/PageComponents/style";

export default {
  name: "RoyText",
  props: {
    element: {
      type: Object,
      default: () => {},
    },
    propValue: {
      type: String,
      default: "",
    },
  },
  render() {
    const style = this.element.style || {};
    return (
      <StyledText props={style}>
        <div domPropsInnerHTML={this.propValue}></div>
      </StyledText>
    );
  },
};
