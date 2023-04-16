import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import L from "leaflet";

import { View, getZoom } from "../View";

describe("View", () => {
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

  test("should render without init class when url is not empty", async () => {
    render(<View url="../../../../assets/icon.png" />);
    const view = screen.getByTestId("view");
    expect(view).toHaveClass("view");
  });

  test("should render with init class when url is empty", () => {
    render(<View url="" />);

    const view = screen.getByTestId("view");
    expect(view).toHaveClass("view init");
  });

  test("should load image and initialize leaflet map", async () => {
    render(<View url="" />);

    const img = new Image();
    const mapMock = {
      fitBounds: jest.fn(),
      off: jest.fn(),
      on: jest.fn(),
      remove: jest.fn(),
      setView: jest.fn(),
      zoomControl: {
        remove: jest.fn(),
      },
    };

    jest.spyOn(L, "map").mockImplementation(() => mapMock as unknown as L.Map);
    jest.spyOn(window, "Image").mockImplementation(() => img);

    expect(L.map).not.toHaveBeenCalled();
    expect(mapMock.off).not.toHaveBeenCalled();
    expect(mapMock.remove).not.toHaveBeenCalled();
    expect(mapMock.on).not.toHaveBeenCalled();
    expect(mapMock.setView).not.toHaveBeenCalled();
    expect(mapMock.zoomControl.remove).not.toHaveBeenCalled();
    expect(img.onload).toBe(null);
  });
});
