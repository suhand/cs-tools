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

import { Box, Skeleton, Typography } from "@wso2/oxygen-ui";
import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import useGetMetadata from "@api/useGetMetadata";
import UsageAndMetricsTabContent from "@components/project-details/usage-metrics/UsageAndMetricsTabContent";

/**
 * Standalone Usage & Metrics page (sidebar navigation).
 * Rendered only when portal metadata enables usage metrics.
 *
 * @returns {JSX.Element | null} Usage & Metrics view, or null while redirecting when disabled.
 */
export default function UsageMetricsPage(): JSX.Element | null {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: portalMetadata, isLoading } = useGetMetadata();
  const usageMetricsEnabled =
    portalMetadata?.featureFlags?.usageMetricsEnabled === true;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!usageMetricsEnabled) {
      const fallback =
        projectId != null && projectId !== ""
          ? `/projects/${projectId}/dashboard`
          : "/";
      navigate(fallback, { replace: true });
    }
  }, [isLoading, usageMetricsEnabled, navigate, projectId]);

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width={280} height={40} />
        <Skeleton variant="rounded" height={240} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!usageMetricsEnabled) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
        Usage & Metrics
      </Typography>
      <UsageAndMetricsTabContent />
    </Box>
  );
}
