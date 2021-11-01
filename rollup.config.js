import nodeResolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";

export default {
  input: "src/index.js",
  output: {
    format: "iife",
    name: "template",
    file: "template.js",
    sourcemap: true,
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: { "process.env.NODE_ENV": JSON.stringify("production") },
    }),
    nodeResolve(),
    commonjs({ exclude: ["node_modules/@financial-times/**", "src/**"] }),
    babel({
      presets: ["@babel/preset-react", "@emotion/babel-preset-css-prop"],
      plugins: ["@emotion"],
      babelHelpers: "bundled",
      exclude: /node_modules\/(?!(@financial-times)\/).*/,
    }),
    terser(),
  ],
  /* Cyclic dependencies are allowed in ES6, and such imports occur
     in many d3 components, so suppress those rollup warnings. */
  onwarn: function (warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};
