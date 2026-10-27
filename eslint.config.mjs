import next from "eslint-config-next";
import importX from "eslint-plugin-import-x";

const config = [
  { ignores: [".next/**", "node_modules/**", "drizzle/**", "next-env.d.ts", ".playwright-mcp/**"] },
  ...next,
  {
    // eslint-plugin-import 2.32 (bundled by Next) crashes in import/order on ESLint 10; import-x is its maintained fork.
    plugins: { "import-x": importX },
    rules: {
      "import-x/order": [
        "error",
        {
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/dev", "@/dev/*"],
              message: "dev/ holds fixtures and the design states page; app code never imports it.",
            },
          ],
        },
      ],
    },
  },
  {
    // The dev-only states route, dev itself and tests may use fixtures.
    files: ["src/app/design-states/**", "src/dev/**", "**/*.test.{ts,tsx}"],
    rules: { "no-restricted-imports": "off" },
  },
];

export default config;
