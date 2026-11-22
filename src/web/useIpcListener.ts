import { useEffect } from "react";

/**
 * Subscribes `listener` to an IPC message exposed by preload.ts (such as
 * window.myAPI.menuNext) and unsubscribes when the component unmounts or the
 * listener changes.
 */
export const useIpcListener = <Listener>(
  subscribe: (listener: Listener) => () => unknown,
  listener: Listener,
) => {
  useEffect(() => {
    const unsubscribe = subscribe(listener);
    return () => {
      unsubscribe();
    };
  }, [subscribe, listener]);
};
