import { render } from "@testing-library/react";

import { View, getZoom } from "../components/View";

beforeAll(() => {
  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
    }));
});

test("test getZoom()", () => {
  expect(getZoom(10, 100, 10, 100)).toBe(1);
  expect(getZoom(100, 10, 100, 10)).toBe(0.1);
});

test("render View component", async () => {
  render(<View url="../../../../assets/icon.png" />);
});
