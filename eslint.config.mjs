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
      "no-nested-ternary": "error",
      complexity: ["error", { max: 13 }],
      "max-depth": ["error", 3],
      "max-lines-per-function": ["error", { max: 130, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ["src/components/ui/**", "**/*.test.ts"],
    rules: {
      complexity: "off",
      "max-lines-per-function": "off",
    },
  },
  {
    files: ["src/routes/**/$*.tsx"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
];
