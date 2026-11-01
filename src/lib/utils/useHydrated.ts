import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false on the server and during hydration, true afterwards.
 * Anything that reads sessionStorage-backed stores (cart, session, auth) must wait for this,
 * otherwise the server HTML and the first client render disagree.
 */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
