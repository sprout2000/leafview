import { memo } from "react";

export const ActualSize = memo(() => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1.5"
      y="3.5"
      width="17"
      height="13"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M6 7.5v5M14 7.5v5M10 8.5v.01M10 11.5v.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
));
