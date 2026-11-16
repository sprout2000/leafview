import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Grid } from "../Grid";

const imgList = ["/pics/a.png", "/pics/b.png", "/pics/c.png"];

const setup = (url = "/pics/b.png") => {
  const onClickBlank = vi.fn(async () => {});
  // <App /> stops propagation in its handler so that onClickBlank is not
  // emitted; mimic that here.
  const onClickThumb = vi.fn(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, _item: string) => {
      e.stopPropagation();
    },
  );

  const utils = render(
    <Grid
      url={url}
      imgList={imgList}
      onClickBlank={onClickBlank}
      onClickThumb={onClickThumb}
    />,
  );

  const thumbs = Array.from(
    utils.container.querySelectorAll<HTMLImageElement>("img.thumb"),
  );

  return { ...utils, thumbs, onClickBlank, onClickThumb };
};

describe("<Grid />", () => {
  it("renders a thumbnail for every image", () => {
    const { thumbs } = setup();

    expect(thumbs.map((img) => img.getAttribute("src"))).toEqual(imgList);
  });

  it("highlights the current image", () => {
    const { thumbs } = setup("/pics/b.png");

    expect(thumbs[1]).toHaveClass("current");
    expect(thumbs[0]).not.toHaveClass("current");
    expect(thumbs[2]).not.toHaveClass("current");
  });

  it("scrolls the current image into view on mount", () => {
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");

    const { thumbs } = setup("/pics/c.png");

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(thumbs[2].parentElement);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("calls onClickThumb with the clicked image", () => {
    const { thumbs, onClickThumb, onClickBlank } = setup();

    fireEvent.click(thumbs[0]);

    expect(onClickThumb).toHaveBeenCalledTimes(1);
    expect(onClickThumb.mock.calls[0][1]).toBe("/pics/a.png");
    expect(onClickBlank).not.toHaveBeenCalled();
  });

  it("calls onClickBlank when the background is clicked", () => {
    const { container, onClickBlank, onClickThumb } = setup();

    const background = container.querySelector(".grid-content");
    expect(background).not.toBeNull();
    fireEvent.click(background as Element);

    expect(onClickBlank).toHaveBeenCalledTimes(1);
    expect(onClickThumb).not.toHaveBeenCalled();
  });

  it("prevents dragging a thumbnail", () => {
    const { thumbs } = setup();

    // fireEvent returns false when preventDefault() was called.
    expect(fireEvent.dragStart(thumbs[0])).toBe(false);
  });

  it("renders each thumbnail as a button named after the file", () => {
    render(
      <Grid
        url=""
        imgList={["/pics/a.png", "C:\\pics\\b.png"]}
        onClickBlank={vi.fn()}
        onClickThumb={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "a.png" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "b.png" })).toBeInTheDocument();
  });

  it("lets the keyboard focus the thumbnails", () => {
    setup();

    const button = screen.getByRole("button", { name: "a.png" });
    button.focus();

    expect(button).toHaveFocus();
  });

  it("renders nothing but the container for an empty list", () => {
    const { container } = render(
      <Grid
        url=""
        imgList={[]}
        onClickBlank={vi.fn()}
        onClickThumb={vi.fn()}
      />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelector(".thumb-container")).toBeInTheDocument();
  });
});
