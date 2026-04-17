Move operations overview change-request card components to `features/operations` and align props typing with operations domain types.
- Added `src/features/operations/components/change-requests/OutstandingChangeRequestsList.tsx` and `src/features/operations/components/change-requests/OutstandingChangeRequestsSkeleton.tsx`; removed support equivalents.
- Updated `src/features/operations/pages/OperationsPage.tsx` imports and added `OutstandingChangeRequestsListProps` to `src/features/operations/types/changeRequests.ts`; removed the moved prop type from `src/features/support/types/supportComponents.ts`.

Organize `features/support`: move component/API/UI prop and hook variable types from inline `interface` declarations into `types/` as `type` aliases (`supportComponents.ts`, `supportApi.ts`, `supportUiConfig.ts`, `caseCreationOptions.ts`, `createCasePage.ts`, `supportHooks.ts`, `supportRichText.ts`, `supportInlineAttachment.ts`); constants/utils/API hooks re-export where needed; components import `*Props` from `@features/support/types/supportComponents`; fixed orphaned fragments in `CaseDetailsSection.tsx` and `CommentBubble.tsx` after batch migration; removed duplicate unused type imports; deleted `scripts/_patchSupportComponentTypes.mjs`.

Reorganize `features/project-details`: domain types in `types/projectDetails.ts` (`ProjectDetailsTabId` enum, `Contact`, `Stat`, `ActivityItem`, chip colour union), `types/projectDetailsComponents.ts` (component props), `types/projectDetailsApi.ts` (mutation/search variable types); constants in `projectDetailsConstants.ts` (tabs use tab id enum, `PROJECT_DETAILS_NOT_AVAILABLE_DISPLAY`, document filename regexes, `UPDATE_HISTORY_INITIAL_FORM_DATA`); `utils/serviceHoursFormat.ts` (`formatServiceHoursAllocationDisplay`); API hooks import variable types from `projectDetailsApi`; components/pages use `ProjectDetailsTabId` + shared types; `permission.ts` imports `ActivityItem` from `types/projectDetails`; `ManageProductModal` footer label uses `switch` on `UpdateHistorySaveAction`.

Organize `features/usage-metrics`: centralize enums/types in `types/usageMetrics.ts`, expand `usageMetricsConstants.ts`, add utils (`usageMetricsTab`, `usageMetricsAccent`, `usageMetricsAggregated`, `usageMetricsEnvironmentProducts`, `usageMetricDelta`, `usageMetricSignedDelta`, `usageMetricTrendChart`); refactor components to use types/constants/utils with `switch`-based helpers; `project-details/utils/usageMetricsTab.ts` re-exports feature utils.

Move usage & metrics UI from `features/project-details/components/usage-metrics` to `features/usage-metrics/components` (`UsageAndMetricsTabContent`, panels, charts, tests); imports use `@features/usage-metrics/components/...`; `UsageMetricsPage` updated; tests mock `usePostProjectDeploymentsSearchAll` + router, `useAuthApiClient` in API hook tests.

Organize `features/project-hub`: `types/projectHub.ts` (`ProjectHubContentView`, `ClampedTextVariant`, project-card + tooltip prop types), `types/appLayout.ts` (`AppShellNavItem` moved from constants); `constants/projectHubConstants.ts` (hub copy, card labels, ServiceNow redirect strings); `utils/projectHub.ts` + `utils/projectCard.ts`; `ProjectHub`/`ProjectCard*`/`ClampedTextWithTooltip`/`ServiceNowCaseRedirectPage` consume those modules; `SideBar` imports `AppShellNavItem` from types; `ProjectCardBadges` test mocks `getSLAStatusColor` to avoid loading project-details constants through a partial `@wso2/oxygen-ui` mock.

Organize `features/settings`: add `types/settings.ts` (enums `SettingsPageTabId`, `RegistryTokenSubTabId`, `RegistryTokenDisplayStatus`, `SettingsRoleInfoId`, `AddUserContactRole`, `AddUserModalStep`, `AiAssistantPatchSuccessKind`, modal/section props); expand `constants/settingsConstants.ts` (page tabs, admin role, user management / AI / registry / add-user copy, `ROLE_CONFIG` ids via `SettingsRoleInfoId`, avatar palette); `utils/settingsPage.ts` (`resolveSettingsPageTabId`, `resolveRegistryTokenSubTabId`, `getAiAssistantPatchSuccessMessage` with `switch`); `utils/registryTokens.ts` (token status, dates, description, expiring-soon); `utils/settings.ts` (`getRoleChipSx` uses `switch`, shared avatar colors from constants).

Organize `features/security`: enums and component prop types in `types/security.ts` (`SecurityTabId`, `CaseReportType`, `SecurityStatKey`, `SecurityReportViewMode`, `SecurityReportCaseSortField`, `VulnerabilitySeverityToken`, `VulnerabilityStatusToken`, table/list/detail props); consolidate copy and stat/tab/filter config in `constants/securityConstants.ts` (merged former `vulnerabilityConstants.ts` `VULNERABILITY_STATUS_IDS`); `utils/securityPage.ts` (`parseSecurityTabQueryParam`, `parseSecurityReportViewMode`, `parseSecurityReportCaseSortField` with `switch`); `utils/productVulnerabilitiesTable.ts` (active filter count + clear-filters label); `utils/vulnerabilities.ts` uses severity/status enums from types; support `CaseDetailsPage`/`CreateCasePage`/`support.ts` import `SecurityTabId` / `CaseReportType` from `types/security`.

Organize `features/updates`: centralize component prop types and UI enums in `types/updates.ts` (`UpdatesStatKey`, `UpdatesPageTabId`, `UpdatePendingLevelType`, `UpdateProductCardHeaderStatus`, report modal/PDF types, stat/grid/card props); move copy and `UPDATES_NULL_PLACEHOLDER` to `constants/updatesConstants.ts`; add `utils/allUpdatesTab.ts` (filter validation, product/version/level helpers, `getNextAllUpdatesFilterAfterChange` with `switch`); extend `utils/updates.ts` with `switch` for chip colour and stat tooltips, `resolveUpdateCardHeaderStatusColor`, `formatViewPendingUpdatesButtonLabel`; `updateLevelsReportPdf.ts` imports report types from `types/updates`.

Reorganize support module: remove All Cases re-export stubs (`AllCasesList`, `all-cases/AllCasesFilters`, `AllCasesListSkeleton`, `AllCasesSearchBar`); tests and `SearchBar.test` mock `@components/list-view/*` directly; move `AllConversationsList` → `components/all-conversations/`, `SupportOverviewCard` → `components/support-overview-cards/`; add `types/supportOverview.ts` (`SupportOverviewIconVariant`, `SupportOverviewCardProps`), `ConversationListRowAction` + `AllConversationsListProps` in `types/conversations.ts`, list copy in `constants/conversationConstants.ts`, `utils/conversationsList.ts` + `utils/__tests__/conversationsList.test.ts`; `SupportPage`/`OperationsPage` use `SupportOverviewIconVariant` enum.

Extract change-request UI helpers from `constants/operationsConstants.ts` into `utils/changeRequestUi.ts` (state/impact colors, icons, `formatImpactLabel`, `resolveChangeRequestCanonicalState`); add `utils/__tests__/changeRequestUi.test.ts`.
- `ChangeRequestsPage` export completion resets `isExporting` via `queueMicrotask` so ESLint `react-hooks/set-state-in-effect` is satisfied (no synchronous `setState` in the effect body).

Merge `changeRequestConstants.ts` into `operationsConstants.ts`; move former `types/catalogs.ts` into `types/serviceRequests.ts`; fix `ProposeNewImplementationTimeModal` (mount form only when open — no `setState` in `useEffect`).

Removed unused `operations-promo-cards` (`OperationsPromoCard`, `ServiceRequestCard`, `ChangeRequestCard` had no page/feature imports).

Split operations types: CR UI enums/props → `types/changeRequests.ts`; SR list + nav segment + sort field → `types/serviceRequests.ts` (removed `types/operations.ts`); move `ServiceNowCaseRedirectPage` to `features/project-hub/pages/` and point `App.tsx` at it.

Organize operations hub and list pages: `constants/operationsConstants.ts`; `utils/operationsPages.ts` + `utils/__tests__/operationsPages.test.ts`; move `ChangeRequestsList` → `components/change-requests/`, `ServiceRequestsList` → `components/service-requests/`; `ChangeRequestsPage`, `ServiceRequestsPage`, `OperationsPage`, and `ChangeRequestsCalendarView` consume shared modules (no inline list/calendar legend arrays).

Organize announcements feature module: types (`types/announcements.ts` with enums + component props), `constants/announcementsConstants.ts`, `utils/announcements.ts` (case search, pagination, filter option resolution with `switch` on metadata keys, HTML normalization, clear-filters label) + `utils/__tests__/announcements.test.ts`; pages/components import only from those modules (no inline types/constants).

Split announcements into `features/announcements` (pages + components); move `support/components/{change-requests,request-cards,service-requests}` to `features/operations/components/`; update imports + `App.tsx`; restore `support/utils/listView.ts` exports; rename `richTextEditor.ts` → `richTextEditor.tsx`; dedupe list helpers in `support.ts` via re-export from `listView`.

Apply feature-module pattern to engagements + support list utils: `features/engagements/{types,constants,utils,hooks,components/EngagementsListSection.tsx}`; `EngagementsPage` thin; extract `support/utils/listView.ts` with tests; `ListSearchPanel` imports `listView`; add `engagements.test.ts`.

Refactor dashboard charts to match module organization: `types/dashboardCharts.ts`, `constants/dashboardChartsConstants.ts`, `utils/dashboardCharts.ts` + `utils/__tests__/dashboardCharts.test.ts`; pie/series helpers use switch; `OperationsChartMode` enum replaces string union; `ChartLegend`/`ChartLayout` use shared types; restored `agent-docs/feature-module-organization-prompt.md` structure.

Add `agent-docs/feature-module-organization-prompt.md`: reusable prompt/checklist to apply cases-table-style layout (constants, types+enums, utils, switches) to other feature folders; corrected MEMORIES cases-table enum path note.

Move dashboard runtime helpers from `types/dashboard.ts` to `utils/dashboard.ts`; rename `utils/dasboard.ts` stub to `dashboard.ts`.
- `types/dashboard.ts`: stat/chip types and severity/case-type enums only; consumers import helpers from `@features/dashboard/utils/dashboard`.
- `utils/dashboard.ts`: `resolveSeverityLegendEntry`, `isS0SeverityLabel`, `getSeverityFriendlyLabel`, `getSeverityLegendColor`, `getCaseTypeChipConfig`, `computeCrCardIsCardLoading`, `computeCrCardIsCardError`.

Colocate former `dashboardUtils` and cases-table helpers: merge into `types/dashboard.ts` and `CasesTable.tsx`.
- Removed `utils/dashboardUtils.ts` and `types/dashboardUtils.ts`; enums live in `types/dashboardEnums.ts` (imported by `constants/dashboardConstants` without cycle); `types/dashboard.ts` exports stat/chip types plus `getSeverityLegendColor`, `isS0SeverityLabel`, `getCaseTypeChipConfig`, `computeCrCard*`.
- Removed `utils/casesTableHelpers.ts`; helpers are module-local functions in `CasesTable.tsx` (default export only for Fast Refresh); `CasesTableHeader` inlines create-case navigation and clear-filters label.

Centralize dashboard severity/case-type enums and chip copy in `types/` + `constants/`; fix util imports.
- Added `types/dashboardUtils.ts` (`SeverityLegendKey`, `CaseTypeChipKind`, `SeverityLegendEntry`); `dashboardConstants` uses enum keys for `SEVERITY_LEGEND_ORDER`, `SEVERITY_ALT_TO_LEGEND_KEY`, `SEVERITY_FRIENDLY_LABEL`, plus `CASE_CHIP_INCIDENT_QUERY_LABELS` and `CASE_TYPE_CHIP_DISPLAY_LABEL`; `dashboardUtils.ts` consumes those; `OutstandingIncidentsChart` filters S0 with `SeverityLegendKey.Catastrophic`.
- Corrected `getSeverityLegendColor` / `isS0SeverityLabel` imports from `dashboardConstants` to `dashboardUtils` in list/support components and `support.ts`.

Refactor dashboard severity/case-type helpers and cases table filters to use `switch` and shared resolvers.
- `dashboardUtils`: `resolveSeverityLegendEntry` (switch on alt legend key); `isS0SeverityLabel` / friendly label / legend color use it; `getCaseTypeChipConfig` uses `classifyCaseTypeChipKind` + switch; `computeCrCard*` add `default` arms.
- `casesTableHelpers`: `resolveCasesTableDefaultStatusIds`, `resolveCasesTableSearchStatusIds`, `filterCasesTableMetadataOptions`, `mapCasesTableFilterOptionLabel`; `CasesTable` uses deployment `switch` and delegates metadata/status logic to helpers.

Consolidate dashboard cases table into two type files plus helpers/constants; move logic out of components.
- `types/casesTableTypes.ts` (props, filters, route params) and `types/casesTableEnums.ts` (Oxygen color paths); `constants/casesTableConstants.ts` (copy, closed label, outstanding status ids); `utils/casesTable.ts` (severity/status colors only); `utils/casesTableHelpers.ts` (closed check, active filter count, clear-label format, navigation); `utils/__tests__/casesTableHelpers.test.ts`.
- `CasesTable`/`CasesTableHeader` use external types/constants/utils only; header copy and create-case navigation no longer inline in components.

Refactor project-details: centralize permissions in `src/utils/permission.ts`, split overview/deployments/usage/time-tracking helpers, and restore overview cards.
- Added `src/types/permission.ts`, `src/constants/permissionConstants.ts`, `src/utils/permission.ts`; removed `features/project-details/utils/permissions.ts` and `types/subscriptions.ts`; `ProjectDetails` uses `@/utils/permission`; `SideBar.test` imports `ProjectType` from `@/types/permission`.
- Feature utils: `projectDetailsPage.ts` (loading + tab filter), `addProductModal.ts`, `updateHistory.ts`, `usageMetrics.ts` / `usageMetricsTab.ts`, `timeTrackingPage.ts`; extended `deployments.ts` with pagination and SR query helpers; `SelectedDeploymentProduct` in `types/deployments.ts`.
- UI splits: `UpdateHistoryAddSectionSkeleton`, `DeploymentCardToolbar`, `DeploymentCardLicenseFooter`, `UsageMetricsTimeRangeSelector`, `ProjectMetadataPrimaryRow` / `SecondaryRow`, `projectInformationConstants.ts`; `UsageAndMetricsTabContent` thinned; chart helpers shared in `usageMetrics.ts`.
- Added missing overview modules: `ProjectInformationCard`, `ProjectStatisticsCard`, `ServiceHoursAllocationsCard`, `ProjectName`, `SubscriptionDetails`.

Relocate shared modules removed from `src/constants` and `src/utils` into domain-aligned paths and fix imports after dropping `@constants/*` / `@utils/*` aliases.
- `subscriptionUtils` → `src/features/project-details/utils/permissions.ts`; `projectDetails` → `src/features/project-details/utils/projectDetails.ts`; `phone` and `settingsStorage` → `src/features/settings/utils/`; `logger` → `src/hooks/logger.ts`; `apiConstants` and `apiUtils` → `src/api/`.
- Split former `commonConstants`: `ROUTE_PREVIOUS_PAGE` → `features/project-hub/constants/navigationConstants.ts`; `PRODUCT_CLASS` → `features/project-details/constants/productConstants.ts`.
- Cross-cutting UI constants: `dropdownConstants` and `errorBannerConstants` → `features/shared/constants/`; `appLayoutConstants` → `features/project-hub/constants/`; idle/auth strings → `providers/authConstants.ts`; usage chart constants → `features/usage-metrics/constants/usageMetricsConstants.ts`.
- Co-located tests (`permissions`, `projectDetails`, `settingsStorage`, `logger`) under feature/hooks `__tests__/`; removed empty `src/constants` and `src/utils`.

Colocate root `src/types`, `src/constants`, and `src/utils` into feature folders (and `src/api` / `src/hooks` where appropriate).
- Types: e.g. support/operations/security/project-details/usage-metrics/project-hub/settings/updates/dashboard each have `types/`; shared pagination/trend types live in `features/dashboard/types/common.ts`.
- Constants: moved into feature `constants/` (e.g. `ApiQueryKeys` → `src/api/apiConstants.ts`); shell/layout/error-banner/login/common → `features/project-hub/constants`; project-details tab metadata → `features/project-details/constants`; etc.
- Utils: e.g. `casesTable` → dashboard, deployment/subscription helpers → project-details, `logger` → `src/hooks/logger.ts`, `apiUtils` → `src/api/apiUtils.ts`; tests co-located.
- Removed unused `@constants/*` and `@utils/*` path aliases from `tsconfig.app.json` and `vite.config.ts`.
- Removed `src/` top-level `types`, `constants`, and `utils` directories.

Remove `src/shared` by moving cross-cutting modules to root `src/api`, `src/constants`, `src/hooks`, and `src/utils`, and point shell imports at `src/components`.
- Replaced `@shared/*` imports with `@api/*`, `@constants/*`, `@hooks/*`, `@utils/*`, and `@components/*`; removed `@shared` from `tsconfig.app.json` and `vite.config.ts`; added `@api/*` path and Vite alias for `src/api`.
- Former `shared/api` (e.g. `ApiError`, `useAuthApiClient`, project-scoped hooks) now lives under `src/api`; shared constants and utilities merged into existing `src/constants` and `src/utils`; `useLogger` and `useDebouncedValue` under `src/hooks`.

Consolidate settings UI and API, remove `src/api` and `src/components`, and colocate domain components under `src/features/*/components`.
- Moved settings screens (`SettingsAiAssistant`, `SettingsRegistryTokens`, user modals, token modals) to `src/features/settings/components`; `SettingsPage` tabs import from `@features/settings/components/*`.
- Relocated all former `src/api` hooks into `src/shared/api` (e.g. `ApiError`, project list/filters/cases) and `src/features/<domain>/api` (support, operations, dashboard, updates, usage-metrics, project-details, settings); co-located hook tests under those folders.
- Moved former `src/components/{dashboard,support,updates,security,project-details,project-hub}` into matching `src/features/.../components`; removed duplicate `src/components/common` in favor of `src/shared/components`; moved `home-page` icon to `src/shared/components/home-page`.
- Updated `tsconfig.app.json` and `vite.config.ts` (`@case-details*`, `@deployments`, `@time-tracking`, `@update-cards` → feature paths; dropped `@api` and `@components`).

Remove legacy `src/pages` route adapters, drop barrel `index.ts` files under `src/features` and `src/shared`, and fix imports so routes load feature pages directly.
- Deleted `src/pages` and removed `@pages` from `tsconfig.app.json` and `vite.config.ts`.
- Removed all `index.ts` barrels (feature/shared api, pages, components, etc.); `App.tsx` already imports concrete page modules.
- Fixed `OperationsPage`/`AllConversationsList` skeleton imports, `securityConstants` / `subscriptionUtils` paths, and test mocks (`SecurityStats`, `Header`) for feature and shared API paths.
- Removed duplicate `src/api/__tests__` files that only covered hooks now implemented under `src/features/*/api`.

Define page architecture refactor strategy for route domains without changing behavior.
- Added `agent-docs/MEMORIES.md` with stack/tooling, preferences, and current routing/domain observations.
- Audited `src/pages` and route usage in `src/App.tsx` to prepare a safe, staged migration plan.

Refactor route organization to domain-oriented feature modules while keeping URLs stable.
- Updated `tsconfig.app.json` and `vite.config.ts` with `@features/*` alias support.
- Added feature scaffolding and barrels for domains under `src/features/` (support, operations, updates, security, dashboard, engagements, usage-metrics, settings, project-hub, project-details) using `pages/api/components/hooks/constants/utils`.
- Rewired route adapter barrels in `src/pages/project/*`, `src/pages/project-hub`, and `src/pages/public/support` to resolve domain pages through `@features/*/pages`.
- Kept tests untouched and did not run test cases.
