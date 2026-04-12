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

// Catalog item within a catalog (from POST /deployments/products/:id/catalogs/search).
export type CatalogItem = {
  id: string;
  label: string;
}

// Catalog with its items (from POST /deployments/products/:id/catalogs/search).
export type Catalog = {
  id: string;
  name: string;
  catalogItems: CatalogItem[];
}

// Response for POST /deployments/products/:id/catalogs/search.
export type CatalogSearchResponse = {
  catalogs: Catalog[];
  totalRecords: number;
  limit?: number;
  offset?: number;
}

// Variable definition for a catalog item (from GET /catalogs/:catalogId/items/:itemId).
export type CatalogItemVariable = {
  id: string;
  questionText: string;
  order: number;
  type: string;
}

// Response for GET /catalogs/:catalogId/items/:itemId.
export type CatalogItemVariablesResponse = {
  variables: CatalogItemVariable[];
}

// Request body for creating a service request (POST /cases with type: "service_request").
export type CreateServiceRequestPayload = {
  type: "service_request";
  projectId: string;
  deploymentId: string;
  deployedProductId: string;
  catalogId: string;
  catalogItemId: string;
  variables: { id: string; value: string }[];
  attachments?: Array<{ name: string; file: string }>;
}
