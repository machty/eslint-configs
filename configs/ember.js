'use strict';

const { tsBase, jsBase, moduleBase, moduleImports, baseRulesAppliedLast } = require('./base');

const emberLintRules = {
  // this is a silly convention from back in the rails days
  // it has no place in JS where things are camelCase
  'ember/routes-segments-snake-case': 'off',
  // co-located test files are filtered out of production bundle
  'ember/no-test-support-import': 'off',
};

const appTS = {
  ...tsBase,
  files: ['./app/**/*.ts'],
  plugins: [tsBase.plugins, moduleImports.plugins, 'ember', '@typescript-eslint'].flat(),
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:decorator-position/ember',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    ...tsBase.rules,
    ...emberLintRules,
    ...moduleImports.rules,

    // not applicable due to how the runtime is
    '@typescript-eslint/no-use-before-define': 'off',
    // much concise
    '@typescript-eslint/prefer-optional-chain': 'error',

    ...baseRulesAppliedLast,
  },
};

const appJS = {
  ...jsBase,
  files: ['./app/**/*.js'],
  plugins: [moduleBase.plugins, moduleImports.plugins, 'ember', 'decorator-position'].flat(),
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:decorator-position/ember',
    'prettier',
  ],
  rules: {
    ...jsBase.rules,
    ...emberLintRules,
    ...moduleImports.rules,
    ...baseRulesAppliedLast,
  },
};
const addonTS = {
  ...appTS,
  files: ['./addon/**/*.ts', './addon-test-support/**/*.ts'],
};
const addonJS = {
  ...appJS,
  files: ['./addon/**/*.js', './addon-test-support/**/*.js'],
};
const addonV2JS = {
  ...appJS,
  files: ['./src/**/*.js'],
};
const addonV2TS = {
  ...appTS,
  files: ['./src/**/*.ts'],
};

const testsTS = {
  ...appTS,
  files: ['./tests/**/*.ts'],
  excludedFiles: ['tests/dummy/declarations/**'],
  plugins: [...appTS.plugins, 'qunit'],
  extends: [...appTS.extends, 'plugin:qunit/recommended'],
  env: {
    ...appTS.env,
    embertest: true,
  },
  rules: {
    ...appTS.rules,

    // doesn't support deep nesting
    'qunit/no-identical-names': 'warn',
    // this rule is incomplete
    'ember/no-test-import-export': 'off',

    // handy to do this sort of thing in tests
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
  },
};
const testsJS = {
  ...appJS,
  files: ['./tests/**/*.js'],
  plugins: [...appJS.plugins, 'qunit'],
  extends: [...appJS.extends, 'plugin:qunit/recommended'],
  env: {
    ...appJS.env,
    embertest: true,
  },
  rules: {
    ...appJS.rules,

    // doesn't support deep nesting
    'qunit/no-identical-names': 'warn',
    // this rule is incomplete
    'ember/no-test-import-export': 'off',
  },
};
const typeDeclarations = {
  ...tsBase,
  files: ['./types/**', '*.d.ts'],
  rules: {
    ...tsBase.rules,
    // custom type declarations get wonky
    '@typescript-eslint/no-explicit-any': 'off',
  },
};

const { baseConfig, baseModulesConfig } = require('./node');

const packagePath = require.resolve(process.cwd() + '/package.json');
const packageJson = require(packagePath);
const isModules = packageJson.type === 'module' || packageJson['ember-addon']?.version === 2;
const nodeFiles = [
  './*.js',
  './blueprints/*/index.js',
  './config/**/*.js',
  './lib/**/*.js',
  './tests/dummy/config/**/*.js',
  './scripts/**/*.js',
];

const nodeConfigs = isModules
  ? [
      {
        ...baseConfig,
        files: nodeFiles.map((filePath) => filePath.replace('.js', '.cjs')),
      },
      {
        ...baseModulesConfig,
        files: [...nodeFiles, ...nodeFiles.map((filePath) => filePath.replace('.js', '.mjs'))],
      },
    ]
  : [
      {
        ...baseConfig,
        files: [...nodeFiles, ...nodeFiles.map((filePath) => filePath.replace('.js', '.cjs'))],
      },
      {
        ...baseModulesConfig,
        files: nodeFiles.map((filePath) => filePath.replace('.js', '.mjs')),
      },
    ];

const deprecationWorkflow = {
  ...jsBase,
  parserOptions: {
    ...jsBase.parserOptions,
    sourceType: 'script',
  },
  files: ['tests/dummy/config/deprecation-workflow.js', 'config/deprecation-workflow.js'],
  plugins: [moduleBase.plugins].flat(),
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    ...jsBase.rules,
    ...baseRulesAppliedLast,
  },
};

module.exports = {
  parts: {
    appTS,
    appJS,
    addonTS,
    addonJS,
    addonV2JS,
    addonV2TS,
    testsTS,
    testsJS,
    typeDeclarations,
    nodeConfigs,
    deprecationWorkflow,
  },
  ember: [
    appTS,
    appJS,
    addonTS,
    addonJS,
    addonV2JS,
    addonV2TS,
    testsTS,
    testsJS,
    typeDeclarations,
    ...nodeConfigs,
    deprecationWorkflow,
  ],
};
