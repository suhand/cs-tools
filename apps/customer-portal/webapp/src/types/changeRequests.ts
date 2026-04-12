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

import type { AtLeastOne, IdLabelRef, PaginationRequest } from "./common";

// Change Request Item.
// Backend: modules/types/types.bal `ChangeRequest` — reference fields are all
// nullable (`ReferenceItem?`). `IdLabelRef` already carries the optional
// `number` the backend returns on project/case/deployment/product refs.
export type ChangeRequestItem = {
  id: string;
  number: string;
  title: string;
  project: IdLabelRef | null;
  case: IdLabelRef | null;
  deployment: IdLabelRef | null;
  deployedProduct: IdLabelRef | null;
  product: IdLabelRef | null;
  assignedEngineer: IdLabelRef | null;
  assignedTeam: IdLabelRef | null;
  startDate: string;
  endDate: string;
  duration: string | null;
  hasServiceOutage: boolean;
  impact: IdLabelRef | null;
  state: IdLabelRef | null;
  type: IdLabelRef | null;
  createdOn: string;
  updatedOn: string;
};

// Change Request Details.
// Backend: modules/types/types.bal `ChangeRequestResponse`.
export type ChangeRequestDetails = ChangeRequestItem & {
  description: string | null;
  createdBy: string;
  justification: string | null;
  impactDescription: string | null;
  serviceOutage: string | null;
  communicationPlan: string | null;
  rollbackPlan: string | null;
  testPlan: string | null;
  hasCustomerApproved: boolean;
  hasCustomerReviewed: boolean;
  approvedBy: IdLabelRef | null;
  approvedOn: string | null;
};

// Change Request Search Response
export type ChangeRequestSearchResponse = {
  changeRequests: ChangeRequestItem[];
  totalRecords: number;
  offset: number;
  limit: number;
};

// Change Request Stats
export type ChangeRequestStats = {
  totalRequests: number;
  awaitingYourAction: number;
  ongoing: number;
  completed: number;
};

// Change Request Stats API Response.
// Backend: `ProjectChangeRequestStatsResponse` — stateCount is ReferenceItem[]
// and the backend always populates `count` on those refs for this endpoint,
// so model it as required here.
export type ChangeRequestStatsResponse = {
  totalCount: number;
  activeCount?: number;
  outstandingCount?: number;
  stateCount: Array<IdLabelRef & { count: number }>;
};

// Response from PATCH /change-requests/:id (update planned start).
export type PatchChangeRequestResponse = {
  id: string;
  updatedBy: string;
  updatedOn: string;
}

// Interface for change requests filters state
export type ChangeRequestFilterValues = {
  stateId?: string;
  impactId?: string;
}

// Request body for searching change requests (POST /projects/:projectId/change-requests/search).
export type ChangeRequestSearchRequest = {
  filters?: {
    impactKey?: number;
    searchQuery?: string;
    stateKeys?: number[];
  };
  pagination: PaginationRequest;
}

// Request body for PATCH /change-requests/:id (update planned start).
export type PatchChangeRequestRequest = AtLeastOne<{
  plannedStartOn?: string;
  isCustomerApproved?: boolean;
  isCustomerReviewed?: boolean;
}>;

export type ChangeRequestDecisionMode =
  | "customerApproval"
  | "customerReview"
  | "none";

export type ChangeRequestWorkflowStage = {
  name: string;
  description: string;
  completed: boolean;
  current: boolean;
  disabled: boolean;
}
