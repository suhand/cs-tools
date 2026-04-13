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

import { useParams, useNavigate } from "react-router";
import { useState, useMemo, type JSX, type ChangeEvent } from "react";
import { Stack } from "@wso2/oxygen-ui";
import useGetProjectFilters from "@api/useGetProjectFilters";
import { useGetProjectCasesPage } from "@api/useGetProjectCasesPage";
import { CaseType } from "@constants/supportConstants";
import type { AnnouncementFilterValues } from "@constants/supportConstants";
import {
  ANNOUNCEMENT_FILTER_DEFINITIONS,
} from "@constants/supportConstants";
import type { CaseMetadataResponse } from "@/types/cases";
import AnnouncementList from "@components/support/announcements/AnnouncementList";
import { hasListSearchOrFilters, countListSearchAndFilters } from "@utils/support";
import { SortOrder } from "@/types/common";
import ListPageHeader from "@components/common/list-view/ListPageHeader";
import ListSearchBar from "@components/common/list-view/ListSearchBar";
import ListFiltersPanel from "@components/common/list-view/ListFiltersPanel";
import ListResultsBar from "@components/common/list-view/ListResultsBar";
import ListPagination from "@components/common/list-view/ListPagination";

/**
 * AnnouncementsPage component to display announcements with search, filters, and pagination.
 *
 * @returns {JSX.Element} The rendered Announcements page.
 */
export default function AnnouncementsPage(): JSX.Element {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<AnnouncementFilterValues>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: filterMetadata } = useGetProjectFilters(projectId || "");

  const caseSearchRequest = useMemo(
    () => ({
      filters: {
        caseTypes: [CaseType.ANNOUNCEMENT],
        statusIds: filters.statusId ? [Number(filters.statusId)] : undefined,
        searchQuery: searchTerm.trim() || undefined,
      },
      sortBy: {
        field: "createdOn",
        order: sortOrder,
      },
    }),
    [filters, searchTerm, sortOrder],
  );

  const offset = (page - 1) * pageSize;

  const { data, isLoading: isCasesQueryLoading } = useGetProjectCasesPage(
    projectId || "",
    caseSearchRequest,
    offset,
    pageSize,
  );

  const cases = data?.cases ?? [];
  const totalRecords = data?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSortChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setPage(1);
  };

  const listHasRefinement = hasListSearchOrFilters(searchTerm, filters);

  return (
    <Stack spacing={3}>
      <ListPageHeader
        title="Announcements"
        description="View and manage announcements for your project"
        backLabel="Back"
        onBack={() => navigate("..")}
      />

      <ListSearchBar
        searchPlaceholder="Search announcements..."
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        isFiltersOpen={isFiltersOpen}
        onFiltersToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        activeFiltersCount={countListSearchAndFilters(searchTerm, filters)}
        onClearFilters={handleClearFilters}
        filtersContent={
          <ListFiltersPanel
            filterDefinitions={ANNOUNCEMENT_FILTER_DEFINITIONS}
            filters={filters}
            resolveOptions={(def) => {
              const raw = (filterMetadata as CaseMetadataResponse | undefined)?.[
                def.metadataKey as keyof CaseMetadataResponse
              ];
              if (!Array.isArray(raw)) return [];
              const options = raw.map((item: { label: string; id: string }) => ({
                label: item.label,
                value: def.useLabelAsValue ? item.label : item.id,
              }));
              if (def.metadataKey === "caseStates") {
                return options.filter((o) => o.value === "1" || o.value === "3");
              }
              return options;
            }}
            onFilterChange={handleFilterChange}
          />
        }
      />

      <ListResultsBar
        shownCount={cases.length}
        totalCount={totalRecords}
        entityLabel="announcements"
        sortFieldOptions={[
          { value: "createdOn", label: "Created date" },
        ]}
        sortField="createdOn"
        onSortFieldChange={() => undefined}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortChange}
      />

      <AnnouncementList
        cases={cases}
        isLoading={isCasesQueryLoading}
        hasListRefinement={listHasRefinement}
        onCaseClick={(c) => navigate(`/projects/${projectId}/announcements/${c.id}`)}
      />

      <ListPagination
        totalPages={totalPages}
        page={page}
        onChange={handlePageChange}
      />
    </Stack>
  );
}
