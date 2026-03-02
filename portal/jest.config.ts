import createJestConfig from 'next/jest.js'

const createJestConfigWithOverrides = createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
})

export default createJestConfigWithOverrides()
