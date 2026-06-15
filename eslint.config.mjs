import { config } from "@remotion/eslint-config-flat";

const base = Array.isArray(config) ? config : [config];

export default [
  // Browser-runtime assets for the photo render page — not part of the TS app
  // (vendored React UMD + the React.createElement render module + fonts).
  {
    ignores: [
      "src/photo/render/vendor/**",
      "src/photo/render/templates.js",
      "src/photo/render/fonts/**",
    ],
  },
  ...base,
];
