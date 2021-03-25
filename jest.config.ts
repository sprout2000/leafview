import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/__tests__'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(ico|gif|jpe?g|png|svg|ttf|otf|eot|woff?2?)$':
      '<rootDir>/__mocks__/fileMock.ts',
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.ts',
  },
};

export default config;
