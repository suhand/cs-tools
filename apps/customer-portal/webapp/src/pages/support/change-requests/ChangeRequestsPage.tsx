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

import { useParams, useNavigate, useLocation } from "react-router";
import {
  useState,
  useMemo,
  useEffect,
  type JSX,
  type ChangeEvent,
} from "react";
import { Box, Button, CircularProgress, Stack } from "@wso2/oxygen-ui";
import {
  FileText,
  Calendar as CalendarIcon,
  Download,
} from "@wso2/oxygen-ui-icons-react";
import type { ChangeRequestFilterValues, ChangeRequestItem } from "@/types/changeRequests";
import type { ChangeRequestSearchRequest } from "@/types/changeRequests";
import useGetProjectFilters from "@api/useGetProjectFilters";
import useGetChangeRequests, {
  useGetChangeRequestsInfinite,
} from "@api/useGetChangeRequests";
import { useGetProjectChangeRequestStats } from "@api/useGetProjectChangeRequestStats";
import {
  CHANGE_REQUEST_STAT_CONFIGS,
  formatImpactLabel,
} from "@constants/changeRequestConstants";
import { CHANGE_REQUEST_FILTER_DEFINITIONS } from "@constants/changeRequestConstants";
import type { CaseMetadataResponse } from "@/types/cases";
import ListStatGrid from "@components/common/list-view/ListStatGrid";
import ListPageHeader from "@components/common/list-view/ListPageHeader";
import ListSearchBar from "@components/common/list-view/ListSearchBar";
import ListFiltersPanel from "@components/common/list-view/ListFiltersPanel";
import ListResultsBar from "@components/common/list-view/ListResultsBar";
import ListPagination from "@components/common/list-view/ListPagination";
import ChangeRequestsList from "@components/support/change-requests/ChangeRequestsList";
import ChangeRequestsCalendarView from "@components/support/change-requests/ChangeRequestsCalendarView";
import TabBar from "@components/common/tab-bar/TabBar";
import { generateChangeRequestsSchedulePdf } from "@utils/changeRequestsSchedulePdf";
import { hasListSearchOrFilters, countListSearchAndFilters } from "@utils/support";

/**
 * ChangeRequestsPage component to display all change requests with stats, filters, and search.
 *
 * @returns {JSX.Element} The rendered Change Requests page.
 */
export default function ChangeRequestsPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const { projectId } = useParams<{ projectId: string }>();
  const basePath = location.pathname.includes("/operations/")
    ? "operations"
    : "support";

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ChangeRequestFilterValues>({});
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 10;

  // Fetch filter metadata (deployments etc.)
  const { data: filterMetadata } = useGetProjectFilters(projectId || "");

  // Fetch change request stats from API
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetProjectChangeRequestStats(projectId || "", {
    enabled: !!projectId,
  });

  // Build API request (following cases listing pattern)
  const changeRequestSearchRequest = useMemo<
    Omit<ChangeRequestSearchRequest, "pagination">
  >(
    () => ({
      filters: {
        searchQuery: searchTerm.trim() || undefined,
        stateKeys: filters.stateId ? [Number(filters.stateId)] : undefined,
        impactKey: filters.impactId ? Number(filters.impactId) : undefined,
      },
    }),
    [searchTerm, filters],
  );

  // Fetch change requests from API - different approaches for list vs calendar
  const offset = (page - 1) * pageSize;

  // List view: use regular query with pagination
  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
  } = useGetChangeRequests(
    projectId || "",
    changeRequestSearchRequest,
    offset,
    pageSize,
    {
      enabled: !!projectId && viewMode === "list",
    },
  );

  // Infinite query to fetch all data in batches (enabled for calendar view or export)
  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetChangeRequestsInfinite(
    projectId || "",
    changeRequestSearchRequest,
    {
      enabled: !!projectId && (viewMode === "calendar" || isExporting),
    },
  );

  // Auto-fetch all pages for calendar view and export
  useEffect(() => {
    if (
      (viewMode === "calendar" || isExporting) &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [viewMode, isExporting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Combine data based on view mode
  const changeRequests = useMemo(() => {
    if (viewMode === "list") {
      return listData?.changeRequests || [];
    } else {
      // Flatten all pages for calendar view
      return (
        infiniteData?.pages.flatMap(
          (page: { changeRequests: ChangeRequestItem[] }) =>
            page.changeRequests,
        ) || []
      );
    }
  }, [viewMode, listData, infiniteData]);

  const isLoading =
    viewMode === "list"
      ? isListLoading
      : isInfiniteLoading || isFetchingNextPage;
  const isError = viewMode === "list" ? isListError : isInfiniteError;
  const totalRecords =
    viewMode === "list"
      ? listData?.totalRecords || 0
      : infiniteData?.pages[0]?.totalRecords || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Handle export completion when all data is fetched
  useEffect(() => {
    if (isExporting) {
      if (isInfiniteError) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsExporting(false);
      } else if (
        !isInfiniteLoading &&
        !isStatsLoading &&
        !hasNextPage &&
        !isFetchingNextPage &&
        infiniteData &&
        stats
      ) {
        // Success case - all data fetched
        const allChangeRequests =
          infiniteData.pages.flatMap(
            (page: { changeRequests: ChangeRequestItem[] }) =>
              page.changeRequests,
          ) || [];
        generateChangeRequestsSchedulePdf(allChangeRequests, stats);
        setTimeout(() => setIsExporting(false), 0);
      }
    }
  }, [
    isExporting,
    isInfiniteLoading,
    isInfiniteError,
    isStatsLoading,
    isStatsError,
    hasNextPage,
    isFetchingNextPage,
    infiniteData,
    stats,
  ]);

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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleChangeRequestClick = (item: ChangeRequestItem): void => {
    navigate(`/projects/${projectId}/${basePath}/change-requests/${item.id}`);
  };

  const handleExportSchedule = () => {
    setIsExporting(true);
  };

  const viewTabs = useMemo(
    () => [
      { id: "list", label: "List View", icon: FileText },
      { id: "calendar", label: "Calendar View", icon: CalendarIcon },
    ],
    [],
  );

  const listHasRefinement = hasListSearchOrFilters(searchTerm, filters);

  const exportButton = (
    <Button
      variant="contained"
      color="warning"
      size="small"
      onClick={handleExportSchedule}
      startIcon={
        isExporting ? (
          <CircularProgress size={16} sx={{ color: "white" }} />
        ) : (
          <Download />
        )
      }
      disabled={isExporting}
      sx={{ mt: { xs: 0, sm: 4 } }}
    >
      {isExporting ? "Exporting..." : "Export Schedule"}
    </Button>
  );

  return (
    <Stack spacing={3}>
      <ListPageHeader
        title="All Change Requests"
        description="Track and manage deployment changes and updates"
        backLabel="Back"
        onBack={() => (returnTo ? navigate(returnTo) : navigate(".."))}
        actions={exportButton}
      />

      <Box sx={{ mb: 3 }}>
        <ListStatGrid
          isLoading={isStatsLoading || (!stats && !isStatsError)}
          isError={isStatsError}
          entityName="change request"
          configs={CHANGE_REQUEST_STAT_CONFIGS}
          stats={stats}
        />
      </Box>

      <ListSearchBar
        searchPlaceholder="Search change requests by number, title, or description..."
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        isFiltersOpen={isFiltersOpen}
        onFiltersToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        activeFiltersCount={countListSearchAndFilters(searchTerm, filters)}
        onClearFilters={handleClearFilters}
        filtersContent={
          <ListFiltersPanel
            filterDefinitions={CHANGE_REQUEST_FILTER_DEFINITIONS}
            filters={filters}
            resolveOptions={(def) => {
              const raw = (filterMetadata as CaseMetadataResponse | undefined)?.[
                def.metadataKey as keyof CaseMetadataResponse
              ];
              if (!Array.isArray(raw)) return [];
              return raw.map((item: { label: string; id: string }) => ({
                label:
                  def.id === "impact" ? formatImpactLabel(item.label) : item.label,
                value: item.id,
              }));
            }}
            onFilterChange={handleFilterChange}
            gridSize={{ xs: 12, sm: 6, md: 4 }}
          />
        }
      />

      <ListResultsBar
        shownCount={changeRequests.length}
        totalCount={totalRecords}
        entityLabel="change requests"
        rightContent={
          <TabBar
            tabs={viewTabs}
            activeTab={viewMode}
            onTabChange={(tabId) => {
              setViewMode(tabId as "list" | "calendar");
              setPage(1);
            }}
            sx={{ mb: 0, height: 32 }}
          />
        }
      />

      {viewMode === "list" ? (
        <>
          <ChangeRequestsList
            changeRequests={changeRequests}
            isLoading={isLoading}
            isError={isError}
            hasListRefinement={listHasRefinement}
            onChangeRequestClick={handleChangeRequestClick}
          />
          <ListPagination
            totalPages={totalPages}
            page={page}
            onChange={handlePageChange}
          />
        </>
      ) : (
        <ChangeRequestsCalendarView
          changeRequests={changeRequests}
          isLoading={isLoading}
          isError={isError}
          onChangeRequestClick={handleChangeRequestClick}
        />
      )}
    </Stack>
  );
}
