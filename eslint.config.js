import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import-x';
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';

const FEATURES = ['customers', 'felts', 'labels', 'offers', 'products', 'rolls', 'scanning', 'shopping', 'statistics', 'stocktakes', 'storage'];

// A feature may import another feature only via its index.ts (public API) or types.ts.
const featureBoundaryZones = FEATURES.map((feature) => ({
    target: `./src/features/${feature}`,
    from: './src/features',
    except: [`./${feature}`, ...FEATURES.filter((other) => other !== feature).flatMap((other) => [`./${other}/index.ts`, `./${other}/types.ts`])],
    message: 'Import other features via their index.ts (or types.ts), never deep paths.',
}));

export default [
    {
        ignores: ['src/types/theme.d.ts', 'src/index.js', 'dist/'],
    },
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.jsx'],
        languageOptions: {
            parser: tseslintParser,
            sourceType: 'module',
            ecmaVersion: 'latest',
            globals: globals.browser,
            parserOptions: {
                project: ['./tsconfig.json'],
            },
        },
        plugins: {
            import: importPlugin,
            '@typescript-eslint': tseslint,
            react,
            'react-hooks': reactHooks,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'import/named': 'off',
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-boolean-value': 'error',
            'react/no-danger': 'error',
            'react/self-closing-comp': 'error',
            'comma-dangle': ['warn', 'always-multiline'],
            indent: 'off',
            'max-len': ['warn', {code: 166}],
            'no-console': ['error', {allow: ['warn', 'error']}],
            'no-underscore-dangle': ['error', {allowAfterThis: true, allowAfterSuper: true}],
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [['^']],
                },
            ],
            'simple-import-sort/exports': 'error',
            'import/no-restricted-paths': [
                'error',
                {
                    zones: [
                        {
                            target: './src/shared',
                            from: './src/features',
                            message: 'shared/ must stay domain-agnostic and cannot import from features/.',
                        },
                        {
                            target: './src/shared',
                            from: './src/app',
                            message: 'shared/ must stay domain-agnostic and cannot import from app/.',
                        },
                        {
                            target: './src/features',
                            from: './src/app',
                            message: 'Features cannot depend on the app composition root.',
                        },
                        ...featureBoundaryZones,
                    ],
                },
            ],
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import-x/resolver-next': [createTypeScriptImportResolver({alwaysTryTypes: true})],
        },
    },
    {
        files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/shared/testing/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                beforeEach: 'readonly',
                afterAll: 'readonly',
                afterEach: 'readonly',
                vi: 'readonly',
            },
        },
    },
    {
        files: ['src/features/products/components/SearchField.tsx', 'src/features/products/components/ExpandableDataGrid.tsx'],
        rules: {
            'no-unused-vars': 'off',
        },
    },
];
