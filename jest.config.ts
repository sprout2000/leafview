import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^.+\\.s?css$": "<rootDir>/src/web/__mocks__/styleMock.ts",
  },
};

export default config;
