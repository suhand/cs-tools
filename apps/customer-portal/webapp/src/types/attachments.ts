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

// Inline attachment for comment images.
export type CaseCommentInlineAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  downloadUrl: string;
  createdOn: string;
  createdBy: string;
  sys_id?: string;
  url?: string;
}

// GET /attachments/:id — full payload with base64 or data URL in `content`.
export type AttachmentDownloadResponse = {
  content: string;
  id: string;
  referenceId?: string;
  name: string;
  type: string;
  sizeBytes?: number;
  createdBy?: string;
  createdOn?: string;
  downloadUrl?: string | null;
  description?: string | null;
}

// Request body for PATCHing an attachment (cases or deployments).
export type PatchAttachmentRequest = {
  name?: string;
  description?: string;
}

// Request body for posting a case attachment.
export type PostCaseAttachmentRequest = {
  name: string;
  type: string;
  content: string;
  description?: string;
  referenceType?: string;
}
