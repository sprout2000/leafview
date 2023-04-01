import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { App } from "../App";

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
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

    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
    }));
  });

  const pressKey = async (key: string) => {
    await userEvent.keyboard(key);
  };

  const rightClickOnContainer = () => {
    fireEvent.contextMenu(screen.getByTestId("container"));
  };

  it("should call menuNext when 'j' is pressed", async () => {
    render(<App />);
    await pressKey("j");
    expect(window.myAPI.menuNext).toHaveBeenCalled();
  });

  it("should call menuPrev when 'k' is pressed", async () => {
    render(<App />);
    await pressKey("k");
    expect(window.myAPI.menuPrev).toHaveBeenCalled();
  });

  it("should call toggleGrid when 'h' is pressed", async () => {
    render(<App />);
    await pressKey("h");
    expect(window.myAPI.toggleGrid).toHaveBeenCalled();
  });

  it("should call menuRemove when 'Del' is pressed", async () => {
    render(<App />);
    await pressKey("Del");
    expect(window.myAPI.menuRemove).toHaveBeenCalled();
  });

  it("should call contextMenu when container is right-clicked", async () => {
    render(<App />);
    rightClickOnContainer();
    expect(window.myAPI.contextMenu).toHaveBeenCalled();
  });
});
