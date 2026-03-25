import js from "@eslint/js";
import codecontext from "@recallnet/codecontext-eslint-plugin";
import prettier from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import noSecrets from "eslint-plugin-no-secrets";
import promise from "eslint-plugin-promise";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/coverage/**",
      "**/.git/**",
      "**/.husky/_/**",
      "**/.changeset/**",
    ],
  },
  js.configs.recommended,
  codecontext.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      unicorn,
      sonarjs,
      security,
      promise,
      "no-secrets": noSecrets,
      "import-x": importX,
    },
    rules: {
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "unicorn/prefer-node-protocol": "error",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-array-reduce": "off",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-identical-functions": "error",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "error",
      "security/detect-eval-with-expression": "error",
      "promise/always-return": "off",
      "promise/catch-or-return": "off",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "no-secrets/no-secrets": ["error", { tolerance: 4.5 }],
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/no-duplicates": "error",
      "import-x/no-self-import": "error",
      "codecontext/require-context-for-complex": "off",
    },
  },
  {
    files: ["**/*.test.js"],
    rules: {
      "no-console": "off",
      "sonarjs/no-identical-functions": "off",
      "no-secrets/no-secrets": "off",
    },
  },
  prettier
);
