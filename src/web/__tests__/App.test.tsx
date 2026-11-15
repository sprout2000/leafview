import { act, fireEvent, render, screen } from "@testing-library/react";
import type { IpcRendererEvent } from "electron";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IElectronAPI } from "../../@types/Context";
import { App } from "../App";
import { reload } from "../reload";

// <View /> depends on Leaflet and ResizeObserver; replace it with a stub
// that just shows the current url.
vi.mock("../View", () => ({
  View: ({ url }: { url: string }) => <div data-testid="view">{url}</div>,
}));

// jsdom cannot reload the page; record the calls instead.
vi.mock("../reload", () => ({ reload: vi.fn() }));

type Listener = (...args: unknown[]) => Promise<void>;

const A = "/pics/a.png";
const B = "/pics/b.png";
const C = "/pics/c.png";

const isImage = (filepath: string) =>
  /\.(bmp|gif|ico|jpe?g|png|svg|webp)$/i.test(filepath);

/** In-memory replacement of the API exposed by preload.ts */
const createMockAPI = (initialFiles: string[]) => {
  let files = [...initialFiles];
  const listeners = new Map<string, Listener>();

  const subscribe = (channel: string) =>
    vi.fn((listener: Listener) => {
      listeners.set(channel, listener);
      return () => listeners.delete(channel);
    });

  const api = {
    showFilePath: vi.fn((file: File) => `/pics/${file.name}`),
    getLocale: vi.fn(async () => "en"),
    contextMenu: vi.fn(async () => {}),
    history: vi.fn(async (_filepath: string) => {}),
    mimecheck: vi.fn(async (filepath: string) => isImage(filepath)),
    dirname: vi.fn(async (filepath: string) =>
      filepath.slice(0, filepath.lastIndexOf("/")),
    ),
    readdir: vi.fn(async (_dir: string): Promise<void | string[]> => [
      ...files,
    ]),
    moveToTrash: vi.fn(async (filepath: string) => {
      files = files.filter((file) => file !== filepath);
    }),
    openDialog: vi.fn(async (): Promise<string | void | undefined> => {}),
    updateTitle: vi.fn(async (_filepath: string) => {}),
    menuNext: subscribe("menu-next"),
    menuPrev: subscribe("menu-prev"),
    menuRemove: subscribe("menu-remove"),
    menuOpen: subscribe("menu-open"),
    toggleGrid: subscribe("toggle-grid"),
  };

  /** Emulates an IPC message sent from the main process. */
  const emit = async (channel: string, ...args: unknown[]) => {
    const listener = listeners.get(channel);
    expect(listener, `listener for ${channel}`).toBeDefined();
    await act(async () => {
      await listener?.(...args);
    });
  };

  return { api, emit, listeners };
};

let mock: ReturnType<typeof createMockAPI>;

const view = () => screen.queryByTestId("view");

const clickButton = async (title: string) => {
  await act(async () => {
    fireEvent.click(screen.getByTitle(title));
  });
};

/** Renders <App /> and opens `url` through the "menu-open" IPC message. */
const renderWith = async (url?: string) => {
  const utils = render(<App />);
  if (url) await mock.emit("menu-open", {} as IpcRendererEvent, url);
  return utils;
};

const thumbs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLImageElement>("img.thumb"));

beforeEach(() => {
  mock = createMockAPI([A, B, C]);
  window.myAPI = mock.api as unknown as IElectronAPI;
});

describe("<App />", () => {
  describe("initial state", () => {
    it("shows the toolbar and an empty view", async () => {
      await renderWith();

      expect(screen.getByTitle("Open...")).toBeInTheDocument();
      expect(view()).toBeEmptyDOMElement();
    });

    it("sets the default window title", async () => {
      await renderWith();

      expect(mock.api.updateTitle).toHaveBeenCalledWith("LeafView");
      expect(mock.api.history).not.toHaveBeenCalled();
    });

    it("subscribes to every menu message", async () => {
      await renderWith();

      expect([...mock.listeners.keys()].sort()).toEqual([
        "menu-next",
        "menu-open",
        "menu-prev",
        "menu-remove",
        "toggle-grid",
      ]);
    });

    it("unsubscribes on unmount", async () => {
      const { unmount } = await renderWith();

      unmount();

      expect(mock.listeners.size).toBe(0);
    });

    it.each([
      "Next Image",
      "Prev Image",
      "Move to Trash",
      "Toggle Grid View",
    ])("ignores %s when no image is opened", async (title) => {
      await renderWith();

      await clickButton(title);

      expect(mock.api.dirname).not.toHaveBeenCalled();
      expect(mock.api.moveToTrash).not.toHaveBeenCalled();
      expect(view()).toBeEmptyDOMElement();
    });
  });

  describe("opening images", () => {
    it("opens the file chosen in the dialog", async () => {
      mock.api.openDialog.mockResolvedValue(B);
      await renderWith();

      await clickButton("Open...");

      expect(view()).toHaveTextContent(B);
      expect(mock.api.updateTitle).toHaveBeenLastCalledWith(B);
      expect(mock.api.history).toHaveBeenCalledWith(B);
    });

    it("does nothing when the dialog is canceled", async () => {
      mock.api.openDialog.mockResolvedValue(undefined);
      await renderWith();

      await clickButton("Open...");

      expect(mock.api.mimecheck).not.toHaveBeenCalled();
      expect(view()).toBeEmptyDOMElement();
    });

    it("ignores files that are not images", async () => {
      mock.api.openDialog.mockResolvedValue("/pics/readme.txt");
      await renderWith();

      await clickButton("Open...");

      expect(view()).toBeEmptyDOMElement();
    });

    it("opens the file sent by the menu-open message", async () => {
      await renderWith(C);

      expect(view()).toHaveTextContent(C);
    });

    it("ignores an empty menu-open message", async () => {
      await renderWith();

      await mock.emit("menu-open", {} as IpcRendererEvent, "");

      expect(mock.api.mimecheck).not.toHaveBeenCalled();
    });

    it("opens a dropped image", async () => {
      const { container } = await renderWith();

      await act(async () => {
        fireEvent.drop(container.firstChild as Element, {
          dataTransfer: { files: [new File([""], "b.png")] },
        });
      });

      expect(mock.api.showFilePath).toHaveBeenCalled();
      expect(view()).toHaveTextContent(B);
    });

    it("ignores dropped dotfiles", async () => {
      const { container } = await renderWith();

      await act(async () => {
        fireEvent.drop(container.firstChild as Element, {
          dataTransfer: { files: [new File([""], ".hidden.png")] },
        });
      });

      expect(mock.api.showFilePath).not.toHaveBeenCalled();
      expect(view()).toBeEmptyDOMElement();
    });

    it("ignores dropped files that are not images", async () => {
      const { container } = await renderWith();

      await act(async () => {
        fireEvent.drop(container.firstChild as Element, {
          dataTransfer: { files: [new File([""], "memo.txt")] },
        });
      });

      expect(view()).toBeEmptyDOMElement();
    });
  });

  describe("navigation", () => {
    it("moves to the next image and wraps around", async () => {
      await renderWith(B);

      await clickButton("Next Image");
      expect(view()).toHaveTextContent(C);

      await clickButton("Next Image");
      expect(view()).toHaveTextContent(A);
    });

    it("moves to the previous image and wraps around", async () => {
      await renderWith(B);

      await clickButton("Prev Image");
      expect(view()).toHaveTextContent(A);

      await clickButton("Prev Image");
      expect(view()).toHaveTextContent(C);
    });

    it("reads the directory of the current image", async () => {
      await renderWith(B);

      await clickButton("Next Image");

      expect(mock.api.dirname).toHaveBeenCalledWith(B);
      expect(mock.api.readdir).toHaveBeenCalledWith("/pics");
    });

    it("stays on the image when it is the only one", async () => {
      mock = createMockAPI([A]);
      window.myAPI = mock.api as unknown as IElectronAPI;
      await renderWith(A);

      await clickButton("Next Image");
      await clickButton("Prev Image");

      expect(view()).toHaveTextContent(A);
    });

    it("responds to the menu-next / menu-prev messages", async () => {
      await renderWith(A);

      await mock.emit("menu-next");
      expect(view()).toHaveTextContent(B);

      await mock.emit("menu-prev");
      expect(view()).toHaveTextContent(A);
    });

    it("updates the window title and history", async () => {
      await renderWith(A);

      await clickButton("Next Image");

      expect(mock.api.updateTitle).toHaveBeenLastCalledWith(B);
      expect(mock.api.history).toHaveBeenLastCalledWith(B);
    });
  });

  describe("move to trash", () => {
    it("removes the image and shows the next one", async () => {
      await renderWith(B);

      await clickButton("Move to Trash");

      expect(mock.api.moveToTrash).toHaveBeenCalledWith(B);
      expect(view()).toHaveTextContent(C);
    });

    it("shows the first image after removing the last one", async () => {
      await renderWith(C);

      await clickButton("Move to Trash");

      expect(mock.api.moveToTrash).toHaveBeenCalledWith(C);
      expect(view()).toHaveTextContent(A);
    });

    it("responds to the menu-remove message", async () => {
      await renderWith(A);

      await mock.emit("menu-remove");

      expect(mock.api.moveToTrash).toHaveBeenCalledWith(A);
      expect(view()).toHaveTextContent(B);
    });

    it("reloads instead of trashing an image that no longer exists", async () => {
      await renderWith(B);
      mock.api.readdir.mockResolvedValue([A, C]);

      await clickButton("Move to Trash");

      expect(mock.api.moveToTrash).not.toHaveBeenCalled();
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it("reloads when the directory becomes empty after trashing", async () => {
      mock = createMockAPI([B]);
      window.myAPI = mock.api as unknown as IElectronAPI;
      await renderWith(B);

      await clickButton("Move to Trash");

      expect(mock.api.moveToTrash).toHaveBeenCalledWith(B);
      expect(reload).toHaveBeenCalledTimes(1);
      expect(view()).toHaveTextContent(B);
    });
  });

  describe("grid view", () => {
    it("shows the thumbnails of the directory", async () => {
      const { container } = await renderWith(B);

      await clickButton("Toggle Grid View");

      expect(container.firstChild).toHaveClass("container", "grid");
      expect(view()).toBeNull();
      expect(screen.queryByTitle("Open...")).toBeNull();
      expect(thumbs(container).map((img) => img.getAttribute("src"))).toEqual(
        [A, B, C],
      );
      expect(thumbs(container)[1]).toHaveClass("current");
    });

    it("opens the clicked thumbnail and closes the grid", async () => {
      const { container } = await renderWith(B);
      await clickButton("Toggle Grid View");

      await act(async () => {
        fireEvent.click(thumbs(container)[2]);
      });

      expect(container.firstChild).not.toHaveClass("grid");
      expect(view()).toHaveTextContent(C);
    });

    it("closes the grid when the background is clicked", async () => {
      const { container } = await renderWith(B);
      await clickButton("Toggle Grid View");

      await act(async () => {
        fireEvent.click(container.querySelector(".grid-content") as Element);
      });

      expect(container.firstChild).not.toHaveClass("grid");
      expect(view()).toHaveTextContent(B);
    });

    it("toggles with the toggle-grid message", async () => {
      const { container } = await renderWith(B);

      await mock.emit("toggle-grid");
      expect(container.firstChild).toHaveClass("grid");

      await mock.emit("toggle-grid");
      expect(container.firstChild).not.toHaveClass("grid");
    });

    it("closes the grid and moves on menu-next", async () => {
      const { container } = await renderWith(B);
      await mock.emit("toggle-grid");

      await mock.emit("menu-next");

      expect(container.firstChild).not.toHaveClass("grid");
      expect(view()).toHaveTextContent(C);
    });

    it("ignores dropped files while the grid is shown", async () => {
      const { container } = await renderWith(B);
      await mock.emit("toggle-grid");

      await act(async () => {
        fireEvent.drop(container.firstChild as Element, {
          dataTransfer: { files: [new File([""], "c.png")] },
        });
      });

      expect(mock.api.showFilePath).not.toHaveBeenCalled();
    });
  });

  describe("reload when the directory is not available", () => {
    const toolbarActions = [
      "Next Image",
      "Prev Image",
      "Move to Trash",
      "Toggle Grid View",
    ];

    it.each(toolbarActions)(
      "%s reloads when the directory cannot be resolved",
      async (title) => {
        await renderWith(B);
        mock.api.dirname.mockResolvedValueOnce("");

        await clickButton(title);

        expect(reload).toHaveBeenCalledTimes(1);
        expect(mock.api.readdir).not.toHaveBeenCalled();
        expect(view()).toHaveTextContent(B);
      },
    );

    it.each(toolbarActions)(
      "%s reloads when the directory cannot be read",
      async (title) => {
        await renderWith(B);
        mock.api.readdir.mockResolvedValueOnce(undefined);

        await clickButton(title);

        expect(reload).toHaveBeenCalledTimes(1);
        expect(view()).toHaveTextContent(B);
      },
    );

    it.each(toolbarActions)(
      "%s reloads when the directory is empty",
      async (title) => {
        await renderWith(B);
        mock.api.readdir.mockResolvedValueOnce([]);

        await clickButton(title);

        expect(reload).toHaveBeenCalledTimes(1);
        expect(view()).toHaveTextContent(B);
      },
    );

    it("Toggle Grid View reloads when the current image no longer exists", async () => {
      const { container } = await renderWith(B);
      mock.api.readdir.mockResolvedValueOnce([A, C]);

      await clickButton("Toggle Grid View");

      expect(reload).toHaveBeenCalledTimes(1);
      expect(container.firstChild).not.toHaveClass("grid");
    });

    it("does not reload in the normal case", async () => {
      await renderWith(B);

      await clickButton("Next Image");

      expect(reload).not.toHaveBeenCalled();
    });

    describe("in the grid view", () => {
      const openGrid = async () => {
        const utils = await renderWith(B);
        await clickButton("Toggle Grid View");
        return utils;
      };

      const clickThumb = async (container: HTMLElement) => {
        await act(async () => {
          fireEvent.click(thumbs(container)[2]);
        });
      };

      const clickBlank = async (container: HTMLElement) => {
        await act(async () => {
          fireEvent.click(container.querySelector(".grid-content") as Element);
        });
      };

      it.each([
        ["thumbnail", clickThumb],
        ["background", clickBlank],
      ])(
        "clicking the %s reloads when the directory cannot be resolved",
        async (_name, click) => {
          const { container } = await openGrid();
          mock.api.dirname.mockResolvedValueOnce("");

          await click(container);

          expect(reload).toHaveBeenCalledTimes(1);
          expect(container.firstChild).toHaveClass("grid");
        },
      );

      it.each([
        ["thumbnail", clickThumb, undefined],
        ["thumbnail", clickThumb, []],
        ["thumbnail", clickThumb, [A, B]],
        ["background", clickBlank, undefined],
        ["background", clickBlank, []],
        ["background", clickBlank, [A, C]],
      ])(
        "clicking the %s reloads when readdir returns %j",
        async (_name, click, list) => {
          const { container } = await openGrid();
          mock.api.readdir.mockResolvedValueOnce(list);

          await click(container);

          expect(reload).toHaveBeenCalledTimes(1);
          expect(container.firstChild).toHaveClass("grid");
        },
      );
    });
  });

  describe("menu messages in the grid view", () => {
    it("menu-open closes the grid and opens the file", async () => {
      const { container } = await renderWith(B);
      await mock.emit("toggle-grid");

      await mock.emit("menu-open", {} as IpcRendererEvent, C);

      expect(container.firstChild).not.toHaveClass("grid");
      expect(view()).toHaveTextContent(C);
    });

    it("menu-prev closes the grid and moves back", async () => {
      const { container } = await renderWith(B);
      await mock.emit("toggle-grid");

      await mock.emit("menu-prev");

      expect(container.firstChild).not.toHaveClass("grid");
      expect(view()).toHaveTextContent(A);
    });
  });

  describe("drag and drop", () => {
    it.each(["dragOver", "dragEnter"] as const)(
      "cancels the default %s behavior",
      async (type) => {
        const { container } = await renderWith();

        const notCancelled = fireEvent[type](container.firstChild as Element);

        expect(notCancelled).toBe(false);
      },
    );

    it("stops dragLeave from bubbling", async () => {
      const { container } = await renderWith();
      const onDragLeave = vi.fn();
      // React listens on the render container, so listen on its parent.
      document.body.addEventListener("dragleave", onDragLeave);

      fireEvent.dragLeave(container.firstChild as Element);

      document.body.removeEventListener("dragleave", onDragLeave);
      expect(onDragLeave).not.toHaveBeenCalled();
    });

    it("cancels the default drop behavior", async () => {
      const { container } = await renderWith();
      let notCancelled = true;

      await act(async () => {
        notCancelled = fireEvent.drop(container.firstChild as Element, {
          dataTransfer: { files: [new File([""], "b.png")] },
        });
      });

      expect(notCancelled).toBe(false);
    });

    it("ignores a drop without dataTransfer", async () => {
      const { container } = await renderWith();

      await act(async () => {
        fireEvent.drop(container.firstChild as Element);
      });

      expect(mock.api.showFilePath).not.toHaveBeenCalled();
      expect(view()).toBeEmptyDOMElement();
    });
  });

  describe("context menu", () => {
    it("shows the native context menu", async () => {
      const { container } = await renderWith(A);

      fireEvent.contextMenu(container.firstChild as Element);

      expect(mock.api.contextMenu).toHaveBeenCalledTimes(1);
    });

    it("does not show it in the grid view", async () => {
      const { container } = await renderWith(A);
      await mock.emit("toggle-grid");

      fireEvent.contextMenu(container.firstChild as Element);

      expect(mock.api.contextMenu).not.toHaveBeenCalled();
    });
  });
});
