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

import { useParams, useNavigate, useSearchParams, useLocation } from "react-router";
import {
  useState,
  useMemo,
  useEffect,
  type JSX,
  type ChangeEvent,
} from "react";
import { useLoader } from "@context/linear-loader/LoaderContext";
import { Box, Button, Stack } from "@wso2/oxygen-ui";
import { ArrowLeft, Plus } from "@wso2/oxygen-ui-icons-react";
import { useGetProjectCasesStats } from "@api/useGetProjectCasesStats";
import useGetProjectDetails from "@api/useGetProjectDetails";
import useGetProjectFilters from "@api/useGetProjectFilters";
import useGetProjectCases from "@api/useGetProjectCases";
import { usePostProjectDeploymentsSearchInfinite } from "@api/usePostProjectDeploymentsSearch";
import { hasListSearchOrFilters, isS0Case } from "@utils/support";
import {
  CaseType,
  ALL_CASES_STAT_CONFIGS,
  getAllCasesFlattenedStats,
} from "@constants/supportConstants";
import {
  getProjectPermissions,
  shouldExcludeS0,
} from "@utils/subscriptionUtils";
import { SortOrder } from "@/types/common";
import type { AllCasesFilterValues } from "@/types/cases";
import ListStatGrid from "@components/common/list-view/ListStatGrid";
import ListPageHeader from "@components/common/list-view/ListPageHeader";
import ListResultsBar from "@components/common/list-view/ListResultsBar";
import ListPagination from "@components/common/list-view/ListPagination";
import ListSearchPanel from "@components/common/list-view/ListSearchPanel";
import ListItems from "@components/common/list-view/ListItems";
import ErrorIndicator from "@components/common/error-indicator/ErrorIndicator";

/**
 * ServiceRequestsPage lists service requests using the same filters, sort,
 * and pagination pattern as All Cases; only the case type filter differs.
 *
 * @returns {JSX.Element} The rendered Service Requests page.
 */
export default function ServiceRequestsPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const createdByMe = searchParams.get("createdByMe") === "true";
  const basePath = location.pathname.includes("/operations/")
    ? "operations"
    : "support";
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;

  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<AllCasesFilterValues>({});
  const [sortField, setSortField] = useState<
    "createdOn" | "updatedOn" | "severity" | "state"
  >("createdOn");
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: project, isLoading: isProjectLoading } = useGetProjectDetails(
    projectId || "",
  );
  const projectDetailsReady = !isProjectLoading && project !== undefined;

  const permissions = useMemo(() => {
    if (!projectDetailsReady || !project) {
      return getProjectPermissions(undefined);
    }
    return getProjectPermissions(project.type?.label);
  }, [projectDetailsReady, project]);

  const excludeS0 = useMemo(() => {
    if (!projectDetailsReady || !project) {
      return false;
    }
    return shouldExcludeS0(project.type?.label);
  }, [projectDetailsReady, project]);

  const { data: filterMetadata } = useGetProjectFilters(projectId || "");
  const deploymentsQuery = usePostProjectDeploymentsSearchInfinite(projectId || "", {
    pageSize: 10,
    enabled: !!projectId,
  });
  const deploymentsList =
    deploymentsQuery.data?.pages.flatMap((p) => p.deployments ?? []) ?? [];

  const {
    data: stats,
    isLoading: isStatsQueryLoading,
    isError: isStatsError,
  } = useGetProjectCasesStats(projectId || "", {
    caseTypes: [CaseType.SERVICE_REQUEST],
    createdByMe: createdByMe || undefined,
    enabled: !!projectId,
  });

  const caseSearchRequest = useMemo(
    () => ({
      filters: {
        caseTypes: [CaseType.SERVICE_REQUEST],
        statusIds: filters.statusId ? [Number(filters.statusId)] : undefined,
        severityId: filters.severityId ? Number(filters.severityId) : undefined,
        issueId: filters.issueTypes ? Number(filters.issueTypes) : undefined,
        deploymentId: filters.deploymentId || undefined,
        searchQuery: searchTerm.trim() || undefined,
        createdByMe: createdByMe || undefined,
      },
      sortBy: {
        field: sortField,
        order: sortOrder,
      },
    }),
    [filters, searchTerm, sortField, sortOrder, createdByMe],
  );

  const {
    data,
    isLoading: isCasesQueryLoading,
    isError: isCasesError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetProjectCases(projectId || "", caseSearchRequest, {
    enabled: !!projectId,
  });

  const { showLoader, hideLoader } = useLoader();

  const hasStatsResponse = stats !== undefined;
  const hasCasesResponse = data !== undefined;
  const isProjectContextLoading = isProjectLoading;
  const isStatsLoading =
    isProjectContextLoading ||
    isStatsQueryLoading ||
    (!!projectId && !hasStatsResponse && !isStatsError);

  const isCasesAreaLoading =
    isCasesQueryLoading ||
    (!!projectId && !hasCasesResponse) ||
    isFetchingNextPage;

  const isInitialPageLoading = isStatsLoading || isCasesAreaLoading;

  useEffect(() => {
    if (isInitialPageLoading) {
      showLoader();
      return () => hideLoader();
    }
    hideLoader();
  }, [isInitialPageLoading, showLoader, hideLoader]);

  useEffect(() => {
    if (!data) return;
    const loadedPages = data.pages.length;
    if (page > loadedPages && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [page, data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const currentPageCases = useMemo(() => {
    if (!data || data.pages.length === 0) return [];
    const requestedPageIndex = page - 1;
    if (requestedPageIndex < 0 || requestedPageIndex >= data.pages.length) {
      return [];
    }
    return data.pages[requestedPageIndex]?.cases ?? [];
  }, [data, page]);

  const apiTotalRecords = data?.pages?.[0]?.totalRecords ?? 0;

  const filteredAndSearchedCases = useMemo(
    () =>
      excludeS0
        ? currentPageCases.filter((c) => !isS0Case(c))
        : currentPageCases,
    [currentPageCases, excludeS0],
  );

  const totalItems = apiTotalRecords || filteredAndSearchedCases.length;
  const paginatedCases = filteredAndSearchedCases;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setPage(1);
  };

  const handleSortChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleSortFieldChange = (
    value: "createdOn" | "updatedOn" | "severity" | "state",
  ) => {
    setSortField(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  useEffect(() => {
    if (!projectDetailsReady) {
      return;
    }
    if (
      projectDetailsReady &&
      !permissions.hasDeployments &&
      filters.deploymentId
    ) {
      setFilters((prev) => ({ ...prev, deploymentId: undefined }));
    }
  }, [projectDetailsReady, permissions.hasDeployments, filters.deploymentId]);

  const listHasRefinement = hasListSearchOrFilters(searchTerm, filters);

  const handleNewServiceRequest = () => {
    navigate(`/projects/${projectId}/${basePath}/service-requests/create`);
  };

  if (isCasesError) {
    return (
      <Stack spacing={3}>
        <Box>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => (returnTo ? navigate(returnTo) : navigate(".."))}
            sx={{ mb: 2 }}
            variant="text"
          >
            Back
          </Button>
          <ErrorIndicator entityName="service requests" size="medium" />
        </Box>
      </Stack>
    );
  }

  const newRequestButton = (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Plus size={16} />}
      onClick={handleNewServiceRequest}
      sx={{ mt: { xs: 0, sm: 4 } }}
    >
      New Service Request
    </Button>
  );

  return (
    <Stack spacing={3}>
      <ListPageHeader
        title={createdByMe ? "My Service Requests" : "All Service Requests"}
        description={
          createdByMe
            ? "Manage and track your service requests"
            : "Manage deployments, operations, infrastructure change, and service configurations"
        }
        backLabel="Back"
        onBack={() => (returnTo ? navigate(returnTo) : navigate(".."))}
        actions={newRequestButton}
      />

      <Box sx={{ mb: 3 }}>
        <ListStatGrid
          isLoading={isStatsLoading}
          isError={isStatsError}
          entityName="service request"
          configs={ALL_CASES_STAT_CONFIGS}
          stats={getAllCasesFlattenedStats(stats)}
        />
      </Box>

      <ListSearchPanel
        searchTerm={searchTerm}
        searchPlaceholder="Search service requests by ID, title, or description..."
        onSearchChange={handleSearchChange}
        isFiltersOpen={isFiltersOpen}
        onFiltersToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        filters={filters}
        filterMetadata={filterMetadata}
        deployments={
          projectDetailsReady && permissions.hasDeployments
            ? deploymentsList
            : []
        }
        onLoadMoreDeployments={() => {
          if (
            deploymentsQuery.hasNextPage &&
            !deploymentsQuery.isFetchingNextPage
          ) {
            void deploymentsQuery.fetchNextPage();
          }
        }}
        hasMoreDeployments={!!deploymentsQuery.hasNextPage}
        isFetchingMoreDeployments={deploymentsQuery.isFetchingNextPage}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        excludeS0={excludeS0}
        isProjectContextLoading={isProjectContextLoading}
      />

      <ListResultsBar
        shownCount={paginatedCases.length}
        totalCount={totalItems}
        entityLabel="service requests"
        sortFieldOptions={[
          { value: "createdOn", label: "Created on" },
          { value: "updatedOn", label: "Updated on" },
          { value: "severity", label: "Severity" },
          { value: "state", label: "State" },
        ]}
        sortField={sortField}
        onSortFieldChange={(v) =>
          handleSortFieldChange(
            v as "createdOn" | "updatedOn" | "severity" | "state",
          )
        }
        sortOrder={sortOrder}
        onSortOrderChange={handleSortChange}
      />

      <ListItems
        cases={paginatedCases}
        isLoading={isCasesAreaLoading && !isCasesError}
        isError={isCasesError}
        hasListRefinement={listHasRefinement}
        entityName="service requests"
        onCaseClick={(c) =>
          navigate(
            `/projects/${projectId}/${basePath}/service-requests/${c.id}`,
          )
        }
      />

      <ListPagination
        totalPages={totalPages}
        page={page}
        onChange={handlePageChange}
      />
    </Stack>
  );
}
