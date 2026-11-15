/** Reloads the renderer. Wrapped in a function so that tests can mock it. */
export const reload = () => {
  window.location.reload();
};
