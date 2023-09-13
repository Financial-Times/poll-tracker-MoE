const { yamlPlugin } = require("esbuild-plugin-yaml");
require("esbuild")
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "node",
    globalName: "template",
    outfile: "template.js",
    plugins: [yamlPlugin()],
  })
  .catch(() => process.exit(1));
