import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SCALE_POPUP_DURATION, View } from "../View";

const leaflet = vi.hoisted(() => {
  const map = {
    fitBounds: vi.fn(),
    setView: vi.fn(),
    setZoom: vi.fn(),
    getZoom: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
  };
  map.fitBounds.mockReturnValue(map);

  const overlay = { addTo: vi.fn() };

  class LatLngBounds {
    constructor(public corners: [number, number][]) {}
    getCenter() {
      return { lat: this.corners[0][0] / 2, lng: this.corners[1][1] / 2 };
    }
  }

  return {
    map,
    overlay,
    module: {
      map: vi.fn(() => map),
      imageOverlay: vi.fn(() => overlay),
      LatLngBounds,
      CRS: { Simple: { name: "Simple" } },
    },
  };
});

vi.mock("leaflet", () => ({ default: leaflet.module }));

/** Image stub whose size can be set per test; fires onload on src change. */
class FakeImage {
  static size = { width: 0, height: 0 };

  width = FakeImage.size.width;
  height = FakeImage.size.height;
  onload: (() => void) | null = null;
  private _src = "";

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    queueMicrotask(() => this.onload?.());
  }
}

/** ResizeObserver stub that lets tests trigger a resize. */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  observe = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  resize(width: number, height: number) {
    this.callback(
      [{ contentRect: { width, height } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
}

const latest = () => FakeResizeObserver.instances.at(-1) as FakeResizeObserver;

const resize = async (width: number, height: number) => {
  await act(async () => {
    latest().resize(width, height);
    // wait for FakeImage.onload
    await Promise.resolve();
  });
};

beforeEach(() => {
  FakeResizeObserver.instances = [];
  leaflet.map.fitBounds.mockReturnValue(leaflet.map);
  leaflet.map.getZoom.mockReturnValue(0);
  leaflet.module.map.mockReturnValue(leaflet.map);
  leaflet.module.imageOverlay.mockReturnValue(leaflet.overlay);
  vi.stubGlobal("Image", FakeImage);
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("<View />", () => {
  it("shows the initial screen when no image is opened", () => {
    const { container } = render(<View url="" />);

    expect(container.firstChild).toHaveClass("view", "init");
  });

  it("does not load anything before an image is opened", async () => {
    const created = vi.fn();
    vi.stubGlobal(
      "Image",
      class extends FakeImage {
        constructor() {
          super();
          created();
        }
      },
    );
    render(<View url="" />);

    await resize(800, 600);

    expect(created).not.toHaveBeenCalled();
    expect(leaflet.module.map).not.toHaveBeenCalled();
  });

  it("drops the init class once an image is opened", () => {
    const { container } = render(<View url="/pics/a.png" />);

    expect(container.firstChild).toHaveClass("view");
    expect(container.firstChild).not.toHaveClass("init");
  });

  it("observes the size of the view", () => {
    const { container } = render(<View url="/pics/a.png" />);

    expect(latest().observe).toHaveBeenCalledWith(container.firstChild);
  });

  it("fits a large image into the view", async () => {
    FakeImage.size = { width: 1600, height: 1200 };
    const { container } = render(<View url="/pics/large.png" />);

    await resize(800, 600);

    expect(leaflet.module.map).toHaveBeenCalledWith(
      container.firstChild,
      expect.objectContaining({
        crs: leaflet.module.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
      }),
    );

    // zoom = 0.5 -> 800 x 600
    const bounds = leaflet.map.fitBounds.mock.calls[0][0] as unknown as {
      corners: [number, number][];
    };
    expect(bounds.corners).toEqual([
      [600, 0],
      [0, 800],
    ]);

    // large images are not centered at zoom 0
    expect(leaflet.map.setView).not.toHaveBeenCalled();

    expect(leaflet.module.imageOverlay).toHaveBeenCalledWith(
      "file:///pics/large.png",
      bounds,
    );
    expect(leaflet.overlay.addTo).toHaveBeenCalledWith(leaflet.map);
  });

  it.each([
    ["/pics/#1/a.png", "file:///pics/%231/a.png"],
    ["C:\\Users\\me\\#1\\a.png", "file:///C:/Users/me/%231/a.png"],
  ])("loads %s even if a folder name contains #", async (url, expected) => {
    FakeImage.size = { width: 200, height: 100 };
    render(<View url={url} />);

    await resize(800, 600);

    expect(leaflet.module.imageOverlay).toHaveBeenCalledWith(
      expected,
      expect.anything(),
    );
  });

  it("shows a small image at its actual size, centered", async () => {
    FakeImage.size = { width: 200, height: 100 };
    render(<View url="/pics/small.png" />);

    await resize(800, 600);

    const bounds = leaflet.map.fitBounds.mock.calls[0][0] as unknown as {
      corners: [number, number][];
    };
    expect(bounds.corners).toEqual([
      [100, 0],
      [0, 200],
    ]);
    expect(leaflet.map.setView).toHaveBeenCalledWith({ lat: 50, lng: 100 }, 0, {
      animate: false,
    });
  });

  it("removes the previous map before redrawing", async () => {
    FakeImage.size = { width: 200, height: 100 };
    render(<View url="/pics/a.png" />);

    await resize(800, 600);
    expect(leaflet.map.remove).not.toHaveBeenCalled();

    await resize(1024, 768);
    expect(leaflet.map.off).toHaveBeenCalled();
    expect(leaflet.map.remove).toHaveBeenCalledTimes(1);
    expect(leaflet.module.map).toHaveBeenCalledTimes(2);
  });

  it("registers double-click and keyboard handlers", async () => {
    FakeImage.size = { width: 200, height: 100 };
    render(<View url="/pics/a.png" />);

    await resize(800, 600);

    const handlers = Object.fromEntries(
      leaflet.map.on.mock.calls as unknown as [string, (e?: unknown) => void][],
    );

    leaflet.map.setView.mockClear();
    handlers.dblclick();
    expect(leaflet.map.setView).toHaveBeenCalledWith({ lat: 50, lng: 100 }, 0);

    handlers.keydown({ originalEvent: { key: "0" } });
    expect(leaflet.map.setZoom).toHaveBeenCalledWith(0);

    leaflet.map.setZoom.mockClear();
    handlers.keydown({ originalEvent: { key: "1" } });
    expect(leaflet.map.setZoom).not.toHaveBeenCalled();
  });

  it("does not draw when resized after unmount", async () => {
    FakeImage.size = { width: 200, height: 100 };
    const { unmount } = render(<View url="/pics/a.png" />);
    const observer = latest();

    unmount();
    // React has cleared the ref, so draw() finds no node.
    observer.resize(800, 600);
    await Promise.resolve();

    expect(leaflet.module.map).not.toHaveBeenCalled();
    expect(leaflet.module.imageOverlay).not.toHaveBeenCalled();
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(<View url="/pics/a.png" />);
    const observer = latest();

    unmount();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  describe("scale popup", () => {
    /** Returns the listeners registered with map.on(). */
    const handlers = () =>
      Object.fromEntries(
        leaflet.map.on.mock.calls as unknown as [string, () => void][],
      );

    const zoomTo = (level: number) => {
      leaflet.map.getZoom.mockReturnValue(level);
      act(() => {
        handlers().zoomend();
      });
    };

    const hide = () => {
      act(() => {
        vi.advanceTimersByTime(SCALE_POPUP_DURATION);
      });
    };

    const popup = () => screen.queryByRole("status");

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("is not shown before an image is drawn", () => {
      render(<View url="/pics/a.png" />);

      expect(popup()).toBeNull();
    });

    it("is shown when an image is opened", async () => {
      // fitted at 50% (1600 x 1200 -> 800 x 600)
      FakeImage.size = { width: 1600, height: 1200 };
      render(<View url="/pics/large.png" />);

      await resize(800, 600);

      expect(popup()).toHaveTextContent("50%");
      expect(popup()).toHaveClass("scale-popup", "show");
    });

    it("is shown when the image is switched", async () => {
      FakeImage.size = { width: 200, height: 100 };
      const { rerender } = render(<View url="/pics/a.png" />);
      await resize(800, 600);
      expect(popup()).toHaveTextContent("100%");
      hide();

      FakeImage.size = { width: 1600, height: 1200 };
      rerender(<View url="/pics/b.png" />);
      await resize(800, 600);

      expect(popup()).toHaveClass("show");
      expect(popup()).toHaveTextContent("50%");
    });

    it("is not shown again when the window is resized", async () => {
      FakeImage.size = { width: 200, height: 100 };
      render(<View url="/pics/a.png" />);
      await resize(800, 600);
      hide();

      await resize(1024, 768);

      expect(popup()).not.toHaveClass("show");
    });

    it("shows the scale relative to the original size when zooming", async () => {
      FakeImage.size = { width: 1600, height: 1200 };
      render(<View url="/pics/large.png" />);
      await resize(800, 600);
      hide();

      zoomTo(1);
      expect(popup()).toHaveClass("show");
      expect(popup()).toHaveTextContent("100%");

      zoomTo(0.3);
      expect(popup()).toHaveTextContent("62%");

      zoomTo(-1);
      expect(popup()).toHaveTextContent("25%");
    });

    it("hides after a while", async () => {
      FakeImage.size = { width: 200, height: 100 };
      render(<View url="/pics/a.png" />);
      await resize(800, 600);
      hide();

      zoomTo(0);
      expect(popup()).toHaveClass("show");

      hide();

      expect(popup()).not.toHaveClass("show");
    });

    it("stays visible while zooming continuously", async () => {
      FakeImage.size = { width: 200, height: 100 };
      render(<View url="/pics/a.png" />);
      await resize(800, 600);
      hide();

      zoomTo(0);
      act(() => {
        vi.advanceTimersByTime(SCALE_POPUP_DURATION - 100);
      });
      zoomTo(1);
      act(() => {
        vi.advanceTimersByTime(SCALE_POPUP_DURATION - 100);
      });

      expect(popup()).toHaveClass("show");
      expect(popup()).toHaveTextContent("200%");

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(popup()).not.toHaveClass("show");
    });

    it("clears the timer on unmount", async () => {
      FakeImage.size = { width: 200, height: 100 };
      const { unmount } = render(<View url="/pics/a.png" />);
      await resize(800, 600);
      zoomTo(0);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
