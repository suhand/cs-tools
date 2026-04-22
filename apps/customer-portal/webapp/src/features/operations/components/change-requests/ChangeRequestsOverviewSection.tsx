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

import { Box, Button } from "@wso2/oxygen-ui";
import { ArrowRight } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import type { ChangeRequestItem } from "@features/operations/types/changeRequests";
import OutstandingChangeRequestsList from "./OutstandingChangeRequestsList";

type ChangeRequestsOverviewSectionProps = {
  changeRequests: ChangeRequestItem[];
  isLoading?: boolean;
  isError?: boolean;
  onItemClick?: (item: ChangeRequestItem) => void;
  onViewAll?: () => void;
};

/**
 * Wraps the outstanding change requests list with a divider and "View all" button
 * immediately below the last item, with no extra whitespace in between.
 *
 * @param {ChangeRequestsOverviewSectionProps} props
 * @returns {JSX.Element}
 */
export default function ChangeRequestsOverviewSection({
  changeRequests,
  isLoading,
  isError,
  onItemClick,
  onViewAll,
}: ChangeRequestsOverviewSectionProps): JSX.Element {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <OutstandingChangeRequestsList
        changeRequests={changeRequests}
        isLoading={isLoading}
        isError={isError}
        onItemClick={onItemClick}
      />
      {onViewAll && !isLoading && !isError && (
        <>
          <Box sx={{ borderTop: 1, borderColor: "divider", mt: 1.5 }} />
          <Button
            fullWidth
            variant="text"
            color="primary"
            onClick={onViewAll}
            endIcon={<ArrowRight size={16} />}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            View all change requests
          </Button>
        </>
      )}
    </Box>
  );
}
