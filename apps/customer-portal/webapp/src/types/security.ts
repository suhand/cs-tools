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

import type { IdLabelRef, PaginationRequest, SortBy } from "./common";

// Product vulnerability item from search response.
// Note: severity/status ids come back as string or number from the backend;
// callers should normalize via String(...).
export type ProductVulnerability = {
  id: string;
  cveId: string;
  vulnerabilityId: string;
  severity: { id: string | number; label: string };
  componentName: string;
  version: string;
  type: string;
  useCase: string | null;
  justification: string | null;
  resolution: string | null;
  componentType?: string;
  updateLevel?: string;
  /** Optional status/state if returned by API. */
  status?: { id: string | number; label: string } | null;
};

// Response for product vulnerabilities metadata (GET /products/vulnerabilities/meta).
export type VulnerabilitiesMetaResponse = {
  severities: IdLabelRef[];
};

// Response for product vulnerabilities search.
export type ProductVulnerabilitiesSearchResponse = {
  productVulnerabilities: ProductVulnerability[];
  totalRecords: number;
  offset: number;
  limit: number;
};

// Request body for product vulnerabilities search.
export type ProductVulnerabilitiesSearchRequest = {
  filters?: {
    searchQuery?: string;
    severityId?: number;
    statusId?: number;
  };
  pagination?: PaginationRequest;
  sortBy?: SortBy;
};
