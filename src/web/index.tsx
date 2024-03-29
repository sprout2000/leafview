import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./index.scss";

import { setLocales } from "../setLocales";

const initLocale = async () => {
  const locale = await window.myAPI.getLocale();
  setLocales(locale);
};

initLocale();

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
