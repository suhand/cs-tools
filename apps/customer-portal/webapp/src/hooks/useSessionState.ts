// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { useState, useCallback } from "react";

/**
 * Drop-in replacement for `useState` that persists the value to `sessionStorage`.
 * On mount the stored value is restored so filters survive navigation back from detail pages.
 *
 * @param key - Unique storage key (include projectId to avoid cross-project leakage).
 * @param defaultValue - Initial value when nothing is stored yet.
 */
export function useSessionState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setSessionState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof value === "function"
            ? (value as (prev: T) => T)(prev)
            : value;
        try {
          sessionStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore quota / private-browsing errors
        }
        return next;
      });
    },
    [key],
  );

  return [state, setSessionState];
}
