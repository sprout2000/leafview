import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { App } from "../components/App";

beforeAll(() => {
  window.myAPI = {
    contextMenu: jest.fn(),
    dirname: jest.fn(),
    getLocale: jest.fn(),
    history: jest.fn(),
    menuNext: jest.fn().mockReturnValue(() => jest.fn()),
    menuOpen: jest.fn().mockReturnValue(() => jest.fn()),
    menuPrev: jest.fn().mockReturnValue(() => jest.fn()),
    menuRemove: jest.fn().mockReturnValue(() => jest.fn()),
    mimecheck: jest.fn(),
    moveToTrash: jest.fn(),
    openDialog: jest.fn(),
    readdir: jest.fn(),
    toggleGrid: jest.fn().mockReturnValue(() => jest.fn()),
    updateTitle: jest.fn(),
  };

  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
    }));
});

test("render App component", async () => {
  render(<App />);

  const menuNextSpy = jest.spyOn(window.myAPI, "menuNext");
  await userEvent.keyboard("j");
  expect(menuNextSpy).toHaveBeenCalled();

  const menuPrevSpy = jest.spyOn(window.myAPI, "menuPrev");
  await userEvent.keyboard("k");
  expect(menuPrevSpy).toHaveBeenCalled();

  const menuGridSpy = jest.spyOn(window.myAPI, "toggleGrid");
  await userEvent.keyboard("h");
  expect(menuGridSpy).toHaveBeenCalled();

  const menuRemoveSpy = jest.spyOn(window.myAPI, "menuRemove");
  await userEvent.keyboard("Del");
  expect(menuRemoveSpy).toHaveBeenCalled();

  const contextMenuSpy = jest.spyOn(window.myAPI, "contextMenu");
  fireEvent.contextMenu(screen.getByTestId("container"));
  expect(contextMenuSpy).toHaveBeenCalled();

  await userEvent.click(screen.getByTestId("open-button"));
  await userEvent.click(screen.getByTestId("grid-button"));
  await userEvent.click(screen.getByTestId("prev-button"));
  await userEvent.click(screen.getByTestId("next-button"));
  await userEvent.click(screen.getByTestId("trash-button"));
});
