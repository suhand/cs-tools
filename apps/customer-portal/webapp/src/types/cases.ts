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

import type { CaseCommentInlineAttachment } from "./attachments";
import type {
  IdLabelRef,
  MetadataItem,
  PaginationRequest,
  SharedEnvContext,
  SortBy,
  TrendData,
} from "./common";

// Case creation form metadata (projects, products, severity levels, conversation summary, etc.).
export type CaseCreationMetadata = {
  projects: string[];
  products: string[];
  deploymentTypes: string[];
  issueTypes: string[];
  severityLevels: {
    id: string;
    label: string;
    description: string;
  }[];
  conversationSummary: {
    messagesExchanged: number;
    troubleshootingAttempts: number;
    kbArticlesReviewed: number;
  };
};

export type CaseSeverity = {
  id: number;
  label: string;
  count: number;
};

export type CaseState = {
  id: string;
  label: string;
  count: number;
};

export type CaseType = {
  id: string;
  label: string;
  count: number;
};

export type EngagementTypeCount = {
  id: string;
  label: string;
  count: number;
};

export type CasesTrendPeriod = {
  period: string;
  severities: CaseSeverity[];
};

export type ProjectCasesStats = {
  totalCases: number;
  totalCount?: number;
  activeCount?: number;
  outstandingCount?: number;
  averageResponseTime: number;
  resolvedCases: {
    total: number;
    currentMonth: number;
    pastThirtyDays?: number;
  };
  /** Percentage change vs last period for trend display. */
  changeRate?: {
    resolvedEngagements?: number;
    averageResponseTime?: number;
  };
  stateCount: CaseState[];
  severityCount: CaseSeverity[];
  outstandingSeverityCount: CaseSeverity[];
  caseTypeCount: CaseType[];
  casesTrend: CasesTrendPeriod[];
  engagementTypeCount?: EngagementTypeCount[];
  outstandingEngagementTypeCount?: EngagementTypeCount[];
};

export type DashboardMockStats = {
  totalCases: {
    value: number;
    trend: TrendData;
  };
  openCases: {
    value: number;
    trend: TrendData;
  };
  resolvedCases: {
    value: number;
    trend: TrendData;
  };
  avgResponseTime: {
    value: string;
    trend?: TrendData;
  };
  casesTrend: Array<{
    name: string;
    TypeA: number;
    TypeB: number;
    TypeC: number;
    TypeD: number;
  }>;
};

// Case List Item
export type CaseListItem = {
  id: string;
  internalId: string;
  number: string;
  createdOn: string;
  createdBy?: string;
  title: string;
  description: string;
  assignedEngineer:
    | string
    | { id: string; label?: string; name?: string }
    | null;
  project: IdLabelRef;
  issueType: IdLabelRef | null;
  deployedProduct: IdLabelRef | null;
  deployment: IdLabelRef | null;
  severity: IdLabelRef | null;
  status: IdLabelRef | null;
  type?: IdLabelRef | null;
  caseTypes?: IdLabelRef | null;
};

// Case Search Response
export type CaseSearchResponse = {
  cases: CaseListItem[];
  totalRecords: number;
  offset: number;
  limit: number;
  projects?: IdLabelRef[];
};

// Case details
export type CaseDetailsAccount = {
  type: string | null;
  id: string;
  label: string;
};

export type CaseDetailsProject = IdLabelRef;

export type CaseDetailsDeployedProduct = IdLabelRef & {
  version?: string | null;
};

export type CaseDetailsClosedBy = {
  id: string;
  label?: string | null;
  name?: string | null;
};

export type CaseDetails = {
  id: string;
  internalId: string;
  number: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  title: string | null;
  description: string | null;
  slaResponseTime: string | null;
  product: IdLabelRef | null;
  account: CaseDetailsAccount | null;
  csManager: IdLabelRef | string | null;
  assignedEngineer:
    | string
    | { id: string; label?: string; name?: string }
    | null;
  project: CaseDetailsProject | null;
  type: IdLabelRef | null;
  deployedProduct: CaseDetailsDeployedProduct | null;
  parentCase: IdLabelRef | null;
  conversation: unknown;
  issueType: IdLabelRef | null;
  catalog?: IdLabelRef | null;
  catalogItem?: IdLabelRef | null;
  /** Filled variables for service requests (from backend). */
  variables?: { name: string; value: string }[];
  changeRequests?: IdLabelRef[];
  createdBy?: string | null;
  duration?: string | null;
  assignedTeam?: IdLabelRef | null;
  engagementStartDate?: string | null;
  engagementEndDate?: string | null;
  deployment: IdLabelRef | null;
  severity: IdLabelRef | null;
  status: IdLabelRef | null;
  closedOn: string | null;
  closedBy: CaseDetailsClosedBy | null;
  closeNotes: string | null;
  hasAutoClosed: boolean | null;
  engineerEmail: string | null;
  findingsResolved: number | null;
  findingsTotal: number | null;
};

// Case comment
export type CaseComment = {
  id: string;
  content: string;
  type: string;
  createdOn: string;
  createdBy: string;
  createdByFirstName?: string | null;
  createdByLastName?: string | null;
  isEscalated: boolean;
  /** Whether this comment has inline images. */
  hasInlineAttachments?: boolean;
  /** Inline attachments for images in content (img src replacement). */
  inlineAttachments?: CaseCommentInlineAttachment[];
};

// Response for case comments list
export type CaseCommentsResponse = {
  comments: CaseComment[];
  totalRecords: number;
  offset: number;
  limit: number;
};

// Response for case metadata (fetching possible statuses, severities, types)
export type CaseMetadataResponse = {
  statuses?: MetadataItem[];
  caseStates?: MetadataItem[];
  severities?: MetadataItem[];
  issueTypes?: MetadataItem[];
  deploymentTypes?: MetadataItem[];
  callRequestStates?: MetadataItem[];
  changeRequestStates?: MetadataItem[];
  changeRequestImpacts?: MetadataItem[];
  caseTypes?: MetadataItem[];
  conversationStates?: MetadataItem[];
  timeCardStates?: MetadataItem[];
  severityBasedAllocationTime?: Record<string, number>;
};

// Interface for all cases filters state
export type AllCasesFilterValues = {
  statusId?: string;
  severityId?: string;
  issueTypes?: string;
  deploymentId?: string;
};

// Case attachment item (GET /cases/:id/attachments).
export type CaseAttachment = {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  size?: number;
  sizeBytes?: string;
  content?: string | null;
  downloadUrl?: string | null;
  createdOn: string;
  createdBy: string;
};

// Response for case attachments list.
export type CaseAttachmentsResponse = {
  limit: number;
  offset: number;
  totalRecords: number;
  attachments: CaseAttachment[];
};

// Case classification response.
export type CaseClassificationResponse = {
  issueType: string;
  severityLevel: string;
  caseInfo: {
    description: string;
    shortDescription: string;
    productName: string;
    productVersion: string;
    environment: string;
    tier: string;
    region: string;
  };
};

// Response for creating a support case.
export type CreateCaseResponse = {
  id: string;
  internalId?: string;
  number?: string;
  createdBy?: string;
  createdOn?: string;
  state?: IdLabelRef;
  type?: IdLabelRef;
};

// Request body for searching cases.
export type CaseSearchRequest = {
  filters?: {
    issueId?: number;
    deploymentId?: string;
    severityId?: number;
    statusId?: number;
    statusIds?: number[];
    searchQuery?: string;
    caseTypes?: string[];
    createdByMe?: boolean;
  };
  pagination: PaginationRequest;
  sortBy?: SortBy;
};

// Request body for case classification.
export type CaseClassificationRequest = SharedEnvContext & {
  chatHistory: string;
};

// Request body for PATCH /cases/:caseId (update case state).
export type PatchCaseRequest = {
  stateKey: number;
};

// Request body for creating a support case (POST /cases).
export type CreateCaseRequest = {
  attachments?: Array<{ file: string; name: string }>;
  type?: string;
  deploymentId: string;
  description: string;
  issueTypeKey?: number;
  deployedProductId: string;
  projectId: string;
  severityKey?: number;
  title: string;
  parentCaseId?: string;
  conversationId?: string;
};
