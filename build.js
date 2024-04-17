const { yamlPlugin } = require("esbuild-plugin-yaml");
require("esbuild")
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    globalName: "template",
    outfile: "template.js",
    external: ["xmlhttprequest"],
    plugins: [yamlPlugin()],
    sourcemap: true,
  })
  .catch(() => process.exit(1));
