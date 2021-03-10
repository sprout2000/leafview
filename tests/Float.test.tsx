import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Float } from '../src/components/Float';

describe('Float component', () => {
  test('render Float component', () => {
    const onClickOpen = jest.fn();
    const prev = jest.fn();
    const next = jest.fn();
    const remove = jest.fn();

    render(
      <Float
        onClickOpen={onClickOpen}
        prev={prev}
        next={next}
        remove={remove}
      />
    );

    userEvent.click(screen.getByTestId('open'));
    expect(onClickOpen).toBeCalledTimes(1);

    userEvent.click(screen.getByTestId('prev'));
    expect(prev).toBeCalledTimes(1);

    userEvent.click(screen.getByTestId('next'));
    expect(next).toBeCalledTimes(1);

    userEvent.click(screen.getByTestId('trash'));
    expect(remove).toBeCalledTimes(1);
  });
});
