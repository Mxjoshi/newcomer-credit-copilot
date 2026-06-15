// The signed-in user, shared via context so any screen can read their time zone (dates are
// shown in the user's zone) without prop drilling.

"use client";

import { createContext, useContext } from "react";
import type { User } from "./auth";

export const UserContext = createContext<User | null>(null);
export const useCurrentUser = () => useContext(UserContext);

// A date formatter bound to the current user's time zone.
export function useDateFormat(): (iso: string) => string {
  const user = useContext(UserContext);
  const tz = user?.timezone;
  return (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-GB", tz ? { timeZone: tz } : undefined);
    } catch {
      return new Date(iso).toLocaleString("en-GB");
    }
  };
}
