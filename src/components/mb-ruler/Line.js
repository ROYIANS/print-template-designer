export default {
  name: "RulerLine",
  data() {
    return {
      state: {
        value: this.value,
      },
    };
  },
  props: {
    index: Number,
    start: Number,
    vertical: Boolean,
    scale: Number,
    value: Number,
    doRemove: Function,
    doMouseDown: Function,
    doRelease: Function,
  },
  methods: {
    handleDown(e) {
      const { value: startValue } = this.state;
      const startD = this.vertical ? e.clientY : e.clientX;
      this.doMouseDown();
      const onMove = (e) => {
        const currentD = this.vertical ? e.clientY : e.clientX;
        const newValue = Math.round(
          startValue + (currentD - startD) / this.scale
        );
        this.setState({ value: newValue });
      };
      const onEnd = () => {
        this.doRelease(this.state.value, this.index);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
    },
    handleRemove() {
      this.doRemove(this.index);
    },
    setState(obj = {}) {
      for (let key of Object.keys(obj)) {
        this.$set(this.state, key, obj[key]);
      }
    },
  },
  created() {},
  render() {
    const { value } = this.state;
    const offset = (value - this.start) * this.scale;
    if (offset < 0) return null;
    const lineStyle = this.vertical ? { top: offset } : { left: offset };

    return (
      <div class="line" style={lineStyle} doMouseDown={this.handleDown}>
        <div class="action">
          <span class="del" onClick={this.handleRemove}>
            &times;
          </span>
          <span class="value">{value}</span>
        </div>
      </div>
    );
  },
};
