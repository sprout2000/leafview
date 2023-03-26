import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToolBar } from "../ToolBar";

test("render ToolBar component", async () => {
  const spyFn = jest.fn();
  render(
    <ToolBar
      onClickOpen={spyFn}
      onNext={spyFn}
      onPrev={spyFn}
      onRemove={spyFn}
      onToggleGrid={spyFn}
    />
  );

  await userEvent.click(screen.getByLabelText("open-button"));
  expect(spyFn).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByLabelText("grid-button"));
  expect(spyFn).toHaveBeenCalledTimes(2);
  await userEvent.click(screen.getByLabelText("prev-button"));
  expect(spyFn).toHaveBeenCalledTimes(3);
  await userEvent.click(screen.getByLabelText("next-button"));
  expect(spyFn).toHaveBeenCalledTimes(4);
  await userEvent.click(screen.getByLabelText("trash-button"));
  expect(spyFn).toHaveBeenCalledTimes(5);
});
