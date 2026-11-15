import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

import { setLocales } from "../../setLocales";

beforeAll(async () => {
  await setLocales("en");
});

afterEach(() => {
  cleanup();
});

// jsdom does not implement scrollIntoView (used by <Grid />).
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
