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

import { Box, Button, Typography } from "@wso2/oxygen-ui";
import { ArrowLeft } from "@wso2/oxygen-ui-icons-react";
import type { JSX, ReactNode } from "react";

export interface ListPageHeaderProps {
  title: string;
  description: string;
  backLabel?: string;
  onBack: () => void;
  actions?: ReactNode;
}

/**
 * ListPageHeader renders the back button, page title, description, and optional
 * right-side action controls shared across all list pages.
 *
 * @param {ListPageHeaderProps} props - Header configuration.
 * @returns {JSX.Element} The rendered page header.
 */
export default function ListPageHeader({
  title,
  description,
  backLabel = "Back",
  onBack,
  actions,
}: ListPageHeaderProps): JSX.Element {
  return (
    <Box>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={onBack}
        sx={{ mb: 2 }}
        variant="text"
      >
        {backLabel}
      </Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: actions ? "space-between" : "flex-start",
          alignItems: { xs: "flex-start", sm: actions ? "flex-start" : "flex-start" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Box>
    </Box>
  );
}
