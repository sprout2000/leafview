import { memo } from "react";

export const FitWindow = memo(() => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 7V2.5H7M13 2.5h4.5V7M17.5 13v4.5H13M7 17.5H2.5V13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));
