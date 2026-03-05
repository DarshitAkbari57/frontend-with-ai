import createJestConfig from 'next/jest.js'

const createJestConfigWithOverrides = createJestConfig({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfigWithOverrides(config);
