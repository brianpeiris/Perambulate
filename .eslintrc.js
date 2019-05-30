module.exports = {
  parserOptions: { ecmaVersion: 6, sourceType: "module" },
  env: { browser: true },
  plugins: ["prettier"],
  extends: ["prettier", "eslint:recommended"],
  rules: { "prettier/prettier": "error" }
};
