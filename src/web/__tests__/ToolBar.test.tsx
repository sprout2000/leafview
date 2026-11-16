import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToolBar } from "../ToolBar";

const setup = () => {
  const props = {
    onClickOpen: vi.fn(),
    onPrev: vi.fn(async () => {}),
    onNext: vi.fn(async () => {}),
    onRemove: vi.fn(async () => {}),
    onToggleGrid: vi.fn(async () => {}),
  };

  render(<ToolBar {...props} />);

  return props;
};

describe("<ToolBar />", () => {
  it("renders every button with a translated title", () => {
    setup();

    for (const title of [
      "Open...",
      "Toggle Grid View",
      "Prev Image",
      "Next Image",
      "Move to Trash",
    ]) {
      expect(screen.getByTitle(title)).toBeInTheDocument();
    }
  });

  it.each([
    ["Open...", "onClickOpen"],
    ["Toggle Grid View", "onToggleGrid"],
    ["Prev Image", "onPrev"],
    ["Next Image", "onNext"],
    ["Move to Trash", "onRemove"],
  ] as const)("calls the handler when %s is clicked", (title, handler) => {
    const props = setup();

    fireEvent.click(screen.getByTitle(title));

    expect(props[handler]).toHaveBeenCalledTimes(1);

    for (const [name, fn] of Object.entries(props)) {
      if (name !== handler) expect(fn).not.toHaveBeenCalled();
    }
  });

  it("renders real buttons that can be focused with the keyboard", () => {
    setup();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);

    for (const button of buttons) {
      expect(button).toHaveAttribute("type", "button");
      button.focus();
      expect(button).toHaveFocus();
    }

    expect(screen.getByRole("button", { name: "Open..." })).toBeInTheDocument();
  });

  it("hides the decorative icons from assistive technologies", () => {
    const { container } = render(
      <ToolBar
        onClickOpen={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onRemove={vi.fn()}
        onToggleGrid={vi.fn()}
      />,
    );

    for (const svg of container.querySelectorAll("svg")) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("renders an icon in each button", () => {
    const { container } = render(
      <ToolBar
        onClickOpen={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onRemove={vi.fn()}
        onToggleGrid={vi.fn()}
      />,
    );

    const icons = container.querySelectorAll(".icon");
    expect(icons).toHaveLength(5);
    for (const icon of icons) {
      expect(icon.querySelector("svg")).not.toBeNull();
    }
  });
});
