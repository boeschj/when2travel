import config from "@boeschj/eslint-config-react";

export default [
  ...config,
  {
    ignores: [
      "dist/**",
      ".wrangler/**",
      "worker-configuration.d.ts",
      "src/routeTree.gen.ts",
      "drizzle.config.ts",
    ],
  },
  {
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/routes/**/$*.tsx"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
];
