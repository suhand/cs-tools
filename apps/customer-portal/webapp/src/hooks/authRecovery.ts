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

import type { useAsgardeo } from "@asgardeo/react";
import type { useLogger } from "@hooks/useLogger";

type SignInSilently = ReturnType<typeof useAsgardeo>["signInSilently"];
type Logger = ReturnType<typeof useLogger>;
let pendingSilentRecovery: Promise<boolean> | null = null;

export function recoverViaSilentSignIn(
  signInSilently: SignInSilently,
  logger: Logger,
): Promise<boolean> {
  if (!pendingSilentRecovery) {
    pendingSilentRecovery = Promise.resolve()
      .then(() => signInSilently())
      .then((result) => result !== false)
      .catch((error) => {
        logger.warn("[authRecovery] silent-signin-failed", { error });
        return false;
      })
      .finally(() => {
        pendingSilentRecovery = null;
      });
  }
  return pendingSilentRecovery;
}
