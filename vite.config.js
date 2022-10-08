import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue2 from "@vitejs/plugin-vue2";

const lib = defineConfig({
  plugins: [vue2()],
  build: {
    outDir: "lib",
    lib: {
      entry: fileURLToPath(
        new URL("./src/components/index.js", import.meta.url)
      ), //指定组件编译入口文件
      name: "PrintTemplateDesigner",
      fileName: (format) => `print-template-designer.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue", "element-ui"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
          "element-ui": "elementUI",
        },
      },
    }, // rollup打包配置
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

// https://vitejs.dev/config/
const build = defineConfig({
  base: "/print-template-designer/",
  plugins: [
    vue2(),
    // legacy({
    //   targets: ["ie >= 11"],
    //   additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    // }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

// 用  loadEnv 读取模式，然后返回对应的 defineConfig
export default ({ mode = "build" }) => {
  console.log("================");
  console.log("当前模式", mode);
  console.log("================");
  if (mode === "lib") {
    // 打包库文件
    console.log("库模式");
    return lib;
  } else {
    console.log("一般模式");
    return build;
  }
};
