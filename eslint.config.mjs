// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "server/**",
      "out/**",
      ".vscode-test"
    ],
  },
  {
    files: [ "src/**/*" ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
    }
  }, {
    files: [
      "gulpfile.js",
      "webpack.config.js"
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  }
);
