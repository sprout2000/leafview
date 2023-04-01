import { render, screen, fireEvent } from "@testing-library/react";
import { Grid } from "../Grid";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe("Grid", () => {
  const url = "https://example.com/image1.jpg";
  const imgList = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
  ];
  const onClickBlank = jest.fn();
  const onClickThumb = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all images in the list", () => {
    render(
      <Grid
        url={url}
        imgList={imgList}
        onClickBlank={onClickBlank}
        onClickThumb={onClickThumb}
      />
    );

    const images = screen.getAllByRole("img");

    expect(images.length).toBe(imgList.length);
  });

  it("should call onClickBlank when clicking on the grid content", () => {
    render(
      <Grid
        url={url}
        imgList={imgList}
        onClickBlank={onClickBlank}
        onClickThumb={onClickThumb}
      />
    );

    const gridContent = screen.getByTestId("grid");

    fireEvent.click(gridContent);

    expect(onClickBlank).toHaveBeenCalledTimes(1);
  });

  it("should call onClickThumb with the clicked item when clicking on a thumbnail", () => {
    render(
      <Grid
        url={url}
        imgList={imgList}
        onClickBlank={onClickBlank}
        onClickThumb={onClickThumb}
      />
    );

    const images = screen.getAllByRole("img");

    fireEvent.click(images[1]);

    expect(onClickThumb).toHaveBeenCalledTimes(1);
    expect(onClickThumb).toHaveBeenCalledWith(expect.any(Object), imgList[1]);
  });
});
