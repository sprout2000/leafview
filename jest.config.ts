import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^.+\\.s?css$": "<rootDir>/src/web/components/__mocks__/styleMock.ts",
  },
};

export default config;
