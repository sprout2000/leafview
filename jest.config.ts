import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/tests'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(ico|gif|jpe?g|png|svg|ttf|otf|eot|woff?2?)$':
      '<rootDir>/mocks/fileMock.ts',
    '\\.(css|scss)$': '<rootDir>/mocks/styleMock.ts',
  },
};

export default config;
