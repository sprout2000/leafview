import React, { ReactNode } from 'react';
import './Card.scss';

interface Props {
  title?: string;
  children?: ReactNode;
  classes?: string;
  bodyClasses?: string;
}

export const Card = (props: Props) => {
  const { title, children, classes = '', bodyClasses = '' } = props;

  const parentClasses = `card ${classes}`;
  const childClasses = `card-body border-gray pb-0 h-100 ${bodyClasses}`;

  return (
    <div className={parentClasses}>
      <fieldset className={childClasses}>
        {title && <legend className="card-title m-0 float-none w-auto p-1">{title}</legend>}

        {children}
      </fieldset>
    </div>
  );
};
