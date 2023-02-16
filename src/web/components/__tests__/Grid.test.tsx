import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Grid } from '../Grid';

test('render Grid component', async () => {
  const spyFn = jest.fn();
  render(
    <Grid url="" imgList={[]} onClickBlank={spyFn} onClickThumb={spyFn} />
  );

  await userEvent.click(screen.getByTestId('grid'));
  expect(spyFn).toHaveBeenCalled();
});
