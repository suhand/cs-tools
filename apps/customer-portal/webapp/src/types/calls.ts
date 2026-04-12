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

import type { IdLabelRef } from "./common";

// Call request structure (from POST /cases/:caseId/call-requests/search).
// Backend: modules/types/types.bal `CallRequest` — `reason`, `scheduleTime`,
// and `meetingLink` are nullable; `durationMin` is a required int.
export type CallRequest = {
  id: string;
  number: string;
  case: IdLabelRef;
  reason: string | null;
  preferredTimes: string[];
  durationMin: number;
  scheduleTime: string | null;
  meetingLink: string | null;
  createdOn: string;
  updatedOn: string;
  state: IdLabelRef;
}

export type CallRequestsResponse = {
  callRequests: CallRequest[];
  totalRecords?: number;
  offset?: number;
  limit?: number;
}

// Response for creating or updating a call request (POST/PATCH).
export type CreateCallResponse = {
  id: string;
}

/** Alias for create/update call request response (shared shape). */
export type CallRequestResponse = CreateCallResponse;

// Request body for creating a call request.
export type CreateCallRequest = {
  durationInMinutes: number;
  reason: string;
  utcTimes: string[];
}

// Request body for updating a call request (PATCH /cases/:caseId/call-requests/:id).
export type PatchCallRequest = {
  reason?: string;
  cancellationReason?: string;
  stateKey: number;
  utcTimes?: string[];
  durationInMinutes?: number;
}
