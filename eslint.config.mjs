import js from "@eslint/js"
import vue from "eslint-plugin-vue"

const browserGlobals = {
  document: "readonly",
  URL: "readonly",
  window: "readonly",
}

const nodeGlobals = {
  __dirname: "readonly",
  process: "readonly",
  require: "readonly",
}

export default [
  // 忽略文件
  {
    ignores: [
      "dist/**",
      "legacy/**",
      "node_modules/**",
    ],
  },

  // JS 推荐规则
  js.configs.recommended,

  // Vue 推荐规则（flat 模式）
  ...vue.configs["flat/recommended"],

  // 自定义规则
  {
    rules: {
      // 基础 JS 风格
      "comma-spacing": ["error", { before: false, after: true }],
      "eol-last": ["error", "always"],
      "indent": ["error", 2, { SwitchCase: 1 }],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "keyword-spacing": "error",
      "object-curly-spacing": ["error", "always"],
      "quotes": ["error", "double", { avoidEscape: true }],
      "semi": ["error", "never"],
      "space-before-blocks": "error",
      "space-infix-ops": "error",
      // Vue 模板与组件增强规则
      "vue/max-attributes-per-line": ["error", {
        singleline: 5,
        multiline: 5
      }],
      "vue/singleline-html-element-content-newline": "off",
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/no-unused-components": "warn",
      "vue/require-prop-types": "error",
      "vue/require-default-prop": "warn",
      "vue/html-indent": ["error", 2],
      "vue/html-self-closing": ["error", {
        html: { void: "always", normal: "never", component: "always" },
        svg: "always",
        math: "always"
      }],
      "vue/no-mutating-props": "error",
      "vue/attributes-order": "warn",

      // 可选：Composition API / Vue 3 常用
      "vue/no-unused-vars": "warn",
      // "vue/no-v-for-template-key": "warn",
    },
  },

  // 前端源码文件配置
  {
    files: [
      "desktop/src/**/*.{js,vue}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
    },
  },

  // Vite 配置文件
  {
    files: [
      "vite.config.mjs",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...nodeGlobals,
        URL: "readonly",
      },
    },
  },

  // Electron CommonJS 文件
  {
    files: [
      "electron/**/*.cjs",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
  },
]
