module.exports = {
  "extends": [
    "standard",
    "plugin:flowtype/recommended"
  ],
  "plugins": [
      "standard",
      "promise",
      "flowtype",
      "import",
      "react"
  ],
  "parserOptions": {
    "jsx": true
  },
  "rules": {
    "semi": [2, "never"],
    "space-before-function-paren": [2, {
      "named": "never",
      "anonymous": "always"
    }],
    "padded-blocks": 0,
    "eol-last": [2, "never"],
    "no-duplicate-imports": 0,
    "import/no-duplicates": 1,
    "spaced-comment": 0,
    "key-spacing": [2, {align: 'value', mode: 'minimum'}],
    "flowtype/space-after-type-colon": [0, 'always'],
    "comma-dangle": 0,
    "no-multi-spaces": 0,
    "no-use-before-define": 0,
    "generator-star-spacing": [2, {before: false, after: true}],
    "quotes": 0,
    "no-tabs": 0,
    "indent": [2, 'tab'],
    "no-unused-vars": 1,
    "react/jsx-uses-vars": 2,
    "no-undef": 0, // raised with flow declare statemets
    "no-console": 1,
    "standard/no-callback-literal": 0
  }
}