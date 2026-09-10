import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** Packages published as ESM-only that Jest must transform (MSW v2 + its deps). */
const ESM_PACKAGES = [
  'msw',
  '@mswjs',
  'next-intl',
  'use-intl',
  '@formatjs',
  'intl-messageformat',
  '@open-draft',
  '@bundled-es-modules',
  'rettime',
  'until-async',
  'strict-event-emitter',
  'headers-polyfill',
  'outvariant',
  'is-node-process',
  'tough-cookie',
  'path-to-regexp',
  'graphql',
];

const config: Config = {
  // jsdom strips the Node Fetch API globals (Request/Response/TextEncoder) that
  // MSW v2 needs. `jest-fixed-jsdom` is jsdom with those left intact.
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/tests/unit/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/env.ts',
    '!src/proxy.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/global-error.tsx',
    '!src/app/providers.tsx',
    '!src/app/api/**',
    '!src/shared/lib/auth/session.ts',
    '!src/shared/lib/auth/set-session.ts',
    '!src/shared/lib/auth/upstream.ts',
    '!src/shared/lib/auth/refresh.ts',
    '!src/shared/lib/auth/require-permission.ts',
    // Browser/server infrastructure exercised by E2E rather than unit tests.
    '!src/shared/lib/theme/**',
    '!src/shared/lib/observability/WebVitalsReporter.tsx',
    '!src/i18n/request.ts',
  ],
  coverageDirectory: 'coverage',
  // A regression floor set just under the template's current numbers — NOT a
  // target. Raising coverage is the first job in a project built from this.
  coverageThreshold: {
    global: {
      branches: 42,
      functions: 33,
      lines: 40,
      statements: 40,
    },
  },
};

/**
 * `next/jest` prepends its own `transformIgnorePatterns`, and Jest ignores a file
 * if ANY pattern matches — so the ESM allowlist has to replace the final array
 * after next/jest has built the config.
 */
export default async function jestConfig(): Promise<Config> {
  const resolved = await createJestConfig(config)();

  return {
    ...resolved,
    transformIgnorePatterns: [
      `/node_modules/(?!(${ESM_PACKAGES.join('|')})/)`,
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    transform: {
      // Order matters: Jest uses the FIRST matching pattern. Some packages above
      // (use-intl) are published ESM-only with `"type": "module"`, which
      // next/jest's SWC transform preserves — force those `.js`/`.mjs` files to
      // CommonJS so Jest can require them. `.ts`/`.tsx` still fall through to
      // next/jest's transformer below.
      '^.+\\.m?js$': [
        '@swc/jest',
        {
          module: { type: 'commonjs' },
          jsc: { target: 'es2022', parser: { syntax: 'ecmascript', jsx: true } },
        },
      ],
      ...resolved.transform,
    },
  };
}
