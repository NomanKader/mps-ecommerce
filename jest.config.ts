import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/tests/**', '!src/server.ts']
};

export default config;
