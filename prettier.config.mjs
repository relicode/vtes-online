/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  printWidth: 120,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^[^.$]', // Third-party libraries (anything not starting with . or $)
    '', // Blank line
    '^\\$/(.*)$', // Local aliased imports starting with $/
    '^[.]', // Relative imports (starting with .)
  ],
}

export default config
