# Shared List Components Refactor Plan

## Overview

The five list pages (All Cases, All Conversations, Change Requests, Service Requests, Security Report Analysis) share the same top-to-bottom page anatomy:

```
┌────────────────────────────────────────────────┐
│  ← Back button  +  Page title  +  description  │  ListPageHeader
├────────────────────────────────────────────────┤
│  Stat card 1  │  Stat card 2  │  …             │  XxxStatCards → SupportStatGrid (already shared)
├────────────────────────────────────────────────┤
│  🔍 Search…        [⚙ Filters ▾]              │  ListSearchBar
│  ───────────────────────────────               │
│  [Status ▾]  [Severity ▾]  [Type ▾]  …        │  ListFiltersPanel (collapsible)
├────────────────────────────────────────────────┤
│  Showing X of Y items          [Sort ▾][Ord ▾] │  ListResultsBar
├────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │  #CASE-001  [Severity]  [Status]         │  │  CaseCard (extracted from AllCasesList)
│  │  Title                                   │  │
│  │  Description…                            │  │
│  │  📅 Created  👤 By  👤 Assigned  📄 Dep │  │
│  └──────────────────────────────────────────┘  │
│  … more cards …                                │
├────────────────────────────────────────────────┤
│                          ← 1  2  3  4 →        │  ListPagination
└────────────────────────────────────────────────┘
```

Every layer is currently duplicated across the five pages. The plan below extracts each layer into a shared component under `components/common/`.

---

## 1. Layer-by-layer duplication analysis

### 1a. Page header (back button + title + description)

Identical structure in `AllCasesPage`, `AllConversationsPage`, and `ChangeRequestsPage`:

```tsx
<Box>
  <Button startIcon={<ArrowLeft size={16} />}
    onClick={() => returnTo ? navigate(returnTo) : navigate("..")}
    sx={{ mb: 2 }} variant="text">
    Back to Support Center
  </Button>
  <Box>
    <Typography variant="h4" color="text.primary" sx={{ mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Box>
</Box>
```

`ChangeRequestsPage` adds a right-side action area (Export Schedule button) using `justifyContent: "space-between"`.  
`SecurityReportAnalysis` embeds a title+description block inline (no back button — it is a sub-component, not a page).

---

### 1b. Stat card rows

All five `XxxStatCards` files are trivial wrappers around the already-shared `SupportStatGrid`:

```tsx
// AllCasesStatCards / AllConversationsStatCards / ChangeRequestsStatCards / ServiceRequestsStatCards
export default function XxxStatCards({ isLoading, isError, stats }) {
  return (
    <Box sx={{ mb: 3 }}>
      <SupportStatGrid isLoading={isLoading} isError={isError}
        entityName="..." configs={XXX_STAT_CONFIGS} stats={stats} />
    </Box>
  );
}
```

`EngagementsStatCards` is slightly different — it derives `flattened` stats from `stateCount` before passing to `SupportStatGrid`, so it keeps its own data transformation but the render layer is the same.

---

### 1c. Search bar + collapsible filter panel

All three SearchBar components (`AllCasesSearchBar`, `AllConversationsSearchBar`, `ChangeRequestsSearchBar`) and the inline search block in `SecurityReportAnalysis` are structurally identical:

```tsx
<Paper sx={{ p: 3, mb: 3 }}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <TextField fullWidth size="small" placeholder="..." value={searchTerm}
      slotProps={{ input: { startAdornment: <Search size={16} /> } }} />
    <Button variant="outlined" size="small"
      onClick={hasActiveFilters ? onClearFilters : onFiltersToggle}
      startIcon={hasActiveFilters ? <X size={16} /> : <ListFilter size={16} />}
      endIcon={!hasActiveFilters && (isFiltersOpen ? <ChevronUp/> : <ChevronDown/>)}>
      {hasActiveFilters ? `Clear Filters (${count})` : "Filters"}
    </Button>
  </Box>
  {isFiltersOpen && (<><Divider sx={{ my: 2 }} />{filtersContent}</>)}
</Paper>
```

Only differences: `placeholder` string, and which `<XxxFilters>` is rendered inside the collapsible.

---

### 1d. Filter dropdown panels

All three filter panels (`AllCasesFilters`, `AllConversationsFilters`, `ChangeRequestsFilters`) and the inline filter block in `SecurityReportAnalysis` map over a `FILTER_DEFINITIONS` array to render `<Select>` dropdowns in a `<Grid>`:

```tsx
<Grid container spacing={2} sx={{ mt: 1 }}>
  {FILTER_DEFINITIONS.map((def) => {
    const { label, allLabel } = deriveFilterLabels(def.id);
    const options = /* map metadata to { label, value }[] */;
    return (
      <Grid key={def.id} size={{ xs: 12, sm: 6, md: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>{label}</InputLabel>
          <Select value={filters[def.filterKey] || ""} onChange={...}>
            <MenuItem value="">{allLabel}</MenuItem>
            {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
    );
  })}
</Grid>
```

Special cases in `AllCasesFilters`: deployment dropdown has infinite scroll `MenuProps` and a `<SelectMenuLoadMoreRow>`, severity filters apply `mapSeverityToDisplay` and S0 exclusion. `ChangeRequestsFilters` applies `formatImpactLabel` to impact options.

---

### 1e. Results count + sort controls bar

Identical layout in `AllCasesPage` and `AllConversationsPage`:

```tsx
<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <Typography variant="body2" color="text.secondary">
    Showing {count} of {total} {entityLabel}
  </Typography>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel>Sort by</InputLabel>
      <Select value={sortField} onChange={...}>
        {sortOptions.map(o => <MenuItem value={o.value}>{o.label}</MenuItem>)}
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel>Order by</InputLabel>
      <Select value={sortOrder} onChange={...}>
        <MenuItem value={SortOrder.DESC}>Newest first</MenuItem>
        <MenuItem value={SortOrder.ASC}>Oldest first</MenuItem>
      </Select>
    </FormControl>
  </Box>
</Box>
```

`ChangeRequestsPage` uses the same outer layout but replaces the sort dropdowns with a `<TabBar>` (List View / Calendar View). The left `Showing X of Y` text is the same.

---

### 1f. Pagination footer

100% identical across `AllCasesPage`, `AllConversationsPage`, `ChangeRequestsPage`, and `SecurityReportAnalysis`:

```tsx
{totalPages > 1 && (
  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
    <Pagination count={totalPages} page={page} onChange={handlePageChange}
      color="primary" variant="outlined" shape="rounded" />
  </Box>
)}
```

---

### 1g. Case card (inside `AllCasesList`)

`AllCasesList` renders a `Form.CardButton` per case with:
- Header row: case number + severity chip + status chip + issue type chip
- Content: title + 2-line clamped description
- Footer: created date / created by / assigned to / deployment label (each as icon + caption)

This card block is a self-contained unit that currently lives inline in `AllCasesList`. Extracting it into `CaseCard` makes `AllCasesList` a thin mapper (`cases.map(c => <CaseCard .../>)`) and makes the card independently testable and reusable.

---

## 2. Proposed shared components

### 2a. `ListPageHeader`

**File:** `components/common/list-page-header/ListPageHeader.tsx`

```typescript
export interface ListPageHeaderProps {
  title: string;
  description: string;
  backLabel?: string;            // default: "Back"
  onBack: () => void;
  /** Optional right-side slot — e.g. Export button, TabBar */
  actions?: React.ReactNode;
}
```

Renders the `<Button startIcon={<ArrowLeft>}>` + `<Typography h4>` + `<Typography body2>` structure.  
When `actions` is provided, the title block and actions are laid out `justifyContent: "space-between"`.

**Replaces** the repeated header `<Box>` in:
- `AllCasesPage.tsx` (lines 252–279)
- `AllConversationsPage.tsx` (lines 192–212)
- `ChangeRequestsPage.tsx` (lines 253–303)

---

### 2b. Stat card wrappers → inline `SupportStatGrid` calls

`AllCasesStatCards`, `AllConversationsStatCards`, `ChangeRequestsStatCards`, and `ServiceRequestsStatCards` are all:

```tsx
<Box sx={{ mb: 3 }}>
  <SupportStatGrid isLoading={...} isError={...} entityName="..." configs={...} stats={...} />
</Box>
```

**Action:** Delete all four wrapper files. Each page calls `SupportStatGrid` directly, wrapped in `<Box sx={{ mb: 3 }}>`. The `configs` constants (`ALL_CASES_STAT_CONFIGS`, etc.) stay where they are.

`EngagementsStatCards` keeps its file because it has data-transformation logic (derives `total/active/completed/onHold` from `stateCount` array).

---

### 2c. `ListSearchBar`

**File:** `components/common/list-search-bar/ListSearchBar.tsx`

```typescript
export interface ListSearchBarProps {
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isFiltersOpen: boolean;
  onFiltersToggle: () => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  /** JSX rendered inside the collapsible filter section */
  filtersContent: React.ReactNode;
  /** Show skeleton instead of real content while loading */
  isLoading?: boolean;
}
```

Renders the `<Paper>` + `<TextField>` + filter toggle `<Button>` + collapsible `{filtersContent}` structure.

**Replaces:**
- `AllConversationsSearchBar.tsx` → delete
- `ChangeRequestsSearchBar.tsx` → delete
- `AllCasesSearchBar.tsx` → simplified to pass props to `<ListSearchBar filtersContent={<AllCasesFilters .../>} />`
- `SecurityReportAnalysis.tsx` → inline search block (~40 lines) replaced

---

### 2d. `ListFiltersPanel`

**File:** `components/common/list-filters-panel/ListFiltersPanel.tsx`

```typescript
export interface FilterDefinition {
  id: string;
  filterKey: string;
  metadataKey: string;
  useLabelAsValue?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface ListFiltersPanelProps<T extends Record<string, string | undefined>> {
  filterDefinitions: FilterDefinition[];
  filters: T;
  /** Returns the option list for a given definition — handles any label transforms */
  resolveOptions: (def: FilterDefinition) => FilterOption[];
  onFilterChange: (field: string, value: string) => void;
  /** Defaults to { xs: 12, sm: 6, md: 3 } */
  gridSize?: { xs?: number; sm?: number; md?: number };
}
```

Example usage replacing `ChangeRequestsFilters`:

```tsx
<ListFiltersPanel
  filterDefinitions={CHANGE_REQUEST_FILTER_DEFINITIONS}
  filters={filters}
  resolveOptions={(def) => {
    const raw = filterMetadata?.[def.metadataKey] ?? [];
    return raw.map((item) => ({
      label: def.id === "impact" ? formatImpactLabel(item.label) : item.label,
      value: item.id,
    }));
  }}
  onFilterChange={onFilterChange}
  gridSize={{ xs: 12, sm: 6, md: 4 }}
/>
```

**Replaces:**
- `AllConversationsFilters.tsx` → delete
- `ChangeRequestsFilters.tsx` → delete
- Inline filter grid in `SecurityReportAnalysis.tsx` → replaced
- `AllCasesFilters.tsx` → kept (deployment infinite scroll + S0 exclusion is too bespoke)

---

### 2e. `ListResultsBar`

**File:** `components/common/list-results-bar/ListResultsBar.tsx`

```typescript
export interface SortOption<T extends string> {
  value: T;
  label: string;
}

export interface ListResultsBarProps<F extends string> {
  /** e.g. "Showing 10 of 47 cases" */
  shownCount: number;
  totalCount: number;
  entityLabel: string;
  /** Sort field options — omit to hide sort dropdowns */
  sortFieldOptions?: SortOption<F>[];
  sortField?: F;
  onSortFieldChange?: (value: F) => void;
  sortOrder?: SortOrder;
  onSortOrderChange?: (value: SortOrder) => void;
  /** Right-side slot for custom controls (e.g. TabBar in ChangeRequestsPage) */
  rightContent?: React.ReactNode;
}
```

Renders the `Showing X of Y {entityLabel}` text on the left and either sort dropdowns or `rightContent` on the right.

**Replaces** the repeated `<Box justifyContent="space-between">` blocks in:
- `AllCasesPage.tsx` (lines 317–379)
- `AllConversationsPage.tsx` (lines 231–260)
- `ChangeRequestsPage.tsx` (lines 325–348, passes `<TabBar>` as `rightContent`)

---

### 2f. `ListPagination`

**File:** `components/common/list-pagination/ListPagination.tsx`

```typescript
export interface ListPaginationProps {
  totalPages: number;
  page: number;
  onChange: (event: ChangeEvent<unknown>, value: number) => void;
}
```

Renders the `{totalPages > 1 && <Box justifyContent="flex-end"><Pagination .../></Box>}` block with the fixed `color="primary" variant="outlined" shape="rounded"` props.

**Replaces** the identical pagination footer in every page.

---

### 2g. `CaseCard`

**File:** `components/common/case-card/CaseCard.tsx`

```typescript
export interface CaseCardProps {
  caseItem: CaseListItem;
  onClick?: (caseItem: CaseListItem) => void;
}
```

Extracted from `AllCasesList` — the full `<Form.CardButton>` block for a single case. Renders:
- Header chips row: case number + severity chip + status chip + issue type chip
- `<Typography h6>` title
- 2-line clamped description
- Footer metadata: created date, created by, assigned engineer, deployment label

`AllCasesList` becomes a thin mapper:

```tsx
return (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {cases.map((caseItem) => (
      <CaseCard key={caseItem.id} caseItem={caseItem} onClick={onCaseClick} />
    ))}
  </Box>
);
```

This also makes the card directly reusable if a dashboard or detail page ever needs to embed a single case card.

---

## 3. Full file disposition table

| File | Action |
|---|---|
| `support/all-cases/AllCasesStatCards.tsx` | **Delete** — page calls `SupportStatGrid` directly |
| `support/all-conversations/AllConversationsStatCards.tsx` | **Delete** — page calls `SupportStatGrid` directly |
| `support/change-requests/ChangeRequestsStatCards.tsx` | **Delete** — page calls `SupportStatGrid` directly |
| `support/service-requests/ServiceRequestsStatCards.tsx` | **Delete** — page calls `SupportStatGrid` directly |
| `support/engagements/EngagementsStatCards.tsx` | **Keep** — has data-transformation logic |
| `support/all-conversations/AllConversationsSearchBar.tsx` | **Delete** — replaced by `ListSearchBar` |
| `support/change-requests/ChangeRequestsSearchBar.tsx` | **Delete** — replaced by `ListSearchBar` |
| `support/all-cases/AllCasesSearchBar.tsx` | **Simplify** — delegates to `ListSearchBar` |
| `support/all-conversations/AllConversationsFilters.tsx` | **Delete** — replaced by `ListFiltersPanel` |
| `support/change-requests/ChangeRequestsFilters.tsx` | **Delete** — replaced by `ListFiltersPanel` |
| `support/all-cases/AllCasesFilters.tsx` | **Keep** — deployment scroll + S0 exclusion bespoke logic |
| `support/service-requests/ServiceRequestsSearchBar.tsx` | **Keep** — tab-button paradigm, not the same pattern |
| `support/all-cases/AllCasesList.tsx` | **Simplify** — delegates rendering to `<CaseCard>` |
| `security/SecurityReportAnalysis.tsx` | **Simplify** — inline search/filter/pagination replaced with shared components |
| `pages/AllCasesPage.tsx` | **Simplify** — uses `ListPageHeader`, `ListResultsBar`, `ListPagination` |
| `pages/AllConversationsPage.tsx` | **Simplify** — uses `ListPageHeader`, `ListResultsBar`, `ListPagination` |
| `pages/support/change-requests/ChangeRequestsPage.tsx` | **Simplify** — uses `ListPageHeader`, `ListResultsBar`, `ListPagination` |

---

## 4. File structure after refactor

```
components/common/
  list-page-header/
    ListPageHeader.tsx           ← NEW (§2a)
  list-search-bar/
    ListSearchBar.tsx            ← NEW (§2c)
  list-filters-panel/
    ListFiltersPanel.tsx         ← NEW (§2d)
  list-results-bar/
    ListResultsBar.tsx           ← NEW (§2e)
  list-pagination/
    ListPagination.tsx           ← NEW (§2f)
  case-card/
    CaseCard.tsx                 ← NEW (§2g)
  stat-grid/
    SupportStatGrid.tsx          ← EXISTING (already shared — no change)
  filter-panel/                  ← EXISTING (ActiveFilters, FilterPopover — unrelated)
  ...

components/support/
  all-cases/
    AllCasesList.tsx             ← simplified (renders <CaseCard>)
    AllCasesFilters.tsx          ← kept (bespoke logic)
    AllCasesSearchBar.tsx        ← simplified (delegates to ListSearchBar)
    AllCasesStatCards.tsx        ← DELETED
  all-conversations/
    AllConversationsList.tsx     ← unchanged
    AllConversationsFilters.tsx  ← DELETED
    AllConversationsSearchBar.tsx← DELETED
    AllConversationsStatCards.tsx← DELETED
  change-requests/
    ChangeRequestsList.tsx       ← unchanged
    ChangeRequestsFilters.tsx    ← DELETED
    ChangeRequestsSearchBar.tsx  ← DELETED
    ChangeRequestsStatCards.tsx  ← DELETED
  service-requests/
    ServiceRequestsList.tsx      ← unchanged
    ServiceRequestsSearchBar.tsx ← unchanged (tab-button pattern)
    ServiceRequestsStatCards.tsx ← DELETED
  engagements/
    EngagementsStatCards.tsx     ← kept (data transformation logic)

components/security/
  SecurityReportAnalysis.tsx     ← simplified (uses shared components)
```

---

## 5. Props flow after refactor

```
AllCasesPage
  └─ <ListPageHeader title="All Cases" description="..." onBack={...} />
  └─ <Box sx={{ mb: 3 }}>
       <SupportStatGrid configs={ALL_CASES_STAT_CONFIGS} stats={flattenedStats} ... />
     </Box>
  └─ <ListSearchBar placeholder="Search cases..." filtersContent={<AllCasesFilters .../>} ... />
  └─ <ListResultsBar shownCount={10} totalCount={47} entityLabel="cases"
       sortFieldOptions={[...]} sortField={sortField} onSortFieldChange={...}
       sortOrder={sortOrder} onSortOrderChange={...} />
  └─ <AllCasesList cases={paginatedCases} ... />
       └─ <CaseCard key={id} caseItem={...} onClick={...} />
  └─ <ListPagination totalPages={5} page={2} onChange={...} />
```

---

## 6. What is intentionally NOT changed

- All `*Page.tsx` state management (hooks, API calls, business logic) — no changes, only the render layer simplifies.
- `AllCasesFilters.tsx` — bespoke deployment infinite scroll + S0 severity exclusion.
- `ServiceRequestsSearchBar.tsx` — tab-button paradigm is fundamentally different from the dropdown filter pattern.
- `EngagementsStatCards.tsx` — has data flattening logic that is specific to the engagement stats shape.
- `AllConversationsList.tsx`, `ChangeRequestsList.tsx`, `ServiceRequestsList.tsx` — each list renders a different card shape; only `AllCasesList`'s card is uniform enough to extract.
- Filter definition constants (`ALL_CASES_FILTER_DEFINITIONS`, `CHANGE_REQUEST_FILTER_DEFINITIONS`, etc.) — stay in their feature constants files.
- All `deriveFilterLabels`, `countListSearchAndFilters`, and other utils — no changes.
- All test files — no changes.
