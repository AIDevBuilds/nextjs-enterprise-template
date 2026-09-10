import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * ESLint flat config (ESLint 9+ no longer reads `.eslintrc.json`).
 *
 * These rules are the mechanical half of CLAUDE.md — see ARCHITECTURE.md §5
 * "What is enforced automatically".
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,

  {
    rules: {
      // Env access goes through src/env.ts only. `no-process-env` still exists
      // in ESLint 10 but is deprecated; this stable rule does the same job and
      // carries a better message.
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            'Import { env } from "@/env" instead of reading process.env directly (see CLAUDE.md §4).',
        },
      ],
      // Structured logging only (CLAUDE.md §9). The logger's own transport
      // opts out with an inline disable — it is the one place console is the
      // actual output device.
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Every user-facing string must come from messages/*.json (CLAUDE.md §7).
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: [':', '·', '—', '|', '/', '+', '-', '(', ')', '%', '*'],
        },
      ],
    },
  },

  {
    // The only modules permitted to read process.env: the env schema itself,
    // and two that must stay dependency-free for the Edge runtime.
    files: [
      'src/env.ts',
      'src/shared/lib/auth/cookie-config.ts',
      'src/shared/lib/observability/logger.ts',
      'src/i18n/request.ts',
    ],
    rules: { 'no-restricted-properties': 'off', 'no-console': 'off' },
  },

  {
    files: ['tests/**/*', '*.config.ts', '*.config.js', '*.config.mjs'],
    rules: {
      'no-restricted-properties': 'off',
      'no-console': 'off',
      'react/display-name': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react/jsx-no-literals': 'off',
    },
  },

  {
    // Last-resort boundary: renders without providers, so it cannot use i18n.
    files: ['src/app/global-error.tsx'],
    rules: { 'react/jsx-no-literals': 'off' },
  },
];

export default config;
