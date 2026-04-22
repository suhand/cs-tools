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

import type { DeploymentCardProps } from "@features/project-details/types/projectDetailsComponents";
import {
  displayValue,
  formatProjectDateTime,
} from "@features/project-details/utils/projectDetails";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Typography,
} from "@wso2/oxygen-ui";
import { ChevronDown } from "@wso2/oxygen-ui-icons-react";
import DeploymentCardLicenseFooter from "@features/project-details/components/deployments/deployment-card/DeploymentCardLicenseFooter";
import DeploymentCardToolbar from "@features/project-details/components/deployments/deployment-card/DeploymentCardToolbar";
import { useState, type JSX } from "react";
import DeploymentDocumentList from "@deployments/DeploymentDocumentList";
import DeploymentProductList from "@deployments/DeploymentProductList";
import EditDeploymentModal from "@deployments/EditDeploymentModal";
import DeleteDeploymentModal from "@deployments/DeleteDeploymentModal";
import { usePatchDeployment } from "@features/project-details/api/usePatchDeployment";
import { useDownloadDeploymentLicense } from "@features/project-details/api/useDownloadDeploymentLicense";

/**
 * Renders a single deployment environment as an accordion with name, type, and description in the header.
 *
 * @param {DeploymentCardProps} props - Props containing the deployment data.
 * @returns {JSX.Element} The deployment accordion card.
 */
export default function DeploymentCard({
  deployment,
  selectedProduct,
  onToggleProductSelect,
}: DeploymentCardProps): JSX.Element {
  const { name, description, createdOn, updatedOn } = deployment;
  const projectId = deployment.project?.id ?? "";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const patchDeployment = usePatchDeployment();
  const downloadLicense = useDownloadDeploymentLicense();

  const createdAtStr = formatProjectDateTime(createdOn ?? "");
  const updatedAtStr = formatProjectDateTime(updatedOn ?? "");

  const handleDownloadLicense = () => {
    downloadLicense.mutate({
      projectId,
      deploymentId: deployment.id,
      deploymentName: name,
    });
  };

  const typeLabel = deployment.type?.label;

  return (
    <>
      <Accordion defaultExpanded disableGutters elevation={1} sx={{ borderRadius: 1 }}>
        <AccordionSummary
          expandIcon={<ChevronDown size={20} />}
          sx={{
            px: 3,
            py: 1.5,
            "& .MuiAccordionSummary-content": { m: 0, overflow: "hidden" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              gap: 2,
              minWidth: 0,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {displayValue(name, "Not Available")}
                </Typography>
                <Chip
                  label={displayValue(deployment.number, "Not Available")}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.75rem", fontFamily: "monospace" }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {typeLabel && (
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                    {typeLabel}
                  </Typography>
                )}
                {typeLabel && description && (
                  <Typography variant="caption" color="text.secondary">•</Typography>
                )}
                {description && (
                  <Typography variant="caption" color="text.secondary">
                    {description}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}
            >
              <DeploymentCardToolbar
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={() => setIsDeleteModalOpen(true)}
                isDeleteDisabled={patchDeployment.isPending}
              />
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Divider />

          <DeploymentProductList
            deploymentId={deployment.id}
            projectId={deployment.project?.id ?? ""}
            selectedProduct={selectedProduct}
            onToggleProductSelect={onToggleProductSelect}
          />

          <Divider />

          <DeploymentDocumentList deploymentId={deployment.id} />

          <Divider />
          <DeploymentCardLicenseFooter
            createdAtLabel={createdAtStr}
            updatedAtLabel={updatedAtStr}
            onDownloadLicense={handleDownloadLicense}
            isDownloading={downloadLicense.isPending}
          />
        </AccordionDetails>
      </Accordion>

      <EditDeploymentModal
        open={isEditModalOpen}
        deployment={deployment}
        projectId={projectId}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => setIsEditModalOpen(false)}
      />

      <DeleteDeploymentModal
        open={isDeleteModalOpen}
        deployment={deployment}
        onClose={() => setIsDeleteModalOpen(false)}
        isDeleting={patchDeployment.isPending}
        onConfirm={() => {
          patchDeployment.mutate(
            {
              projectId,
              deploymentId: deployment.id,
              body: { active: false },
            },
            {
              onSuccess: () => setIsDeleteModalOpen(false),
            },
          );
        }}
      />
    </>
  );
}
