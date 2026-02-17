const STORAGE_KEY = "releaseflow_hq_v1";
const BULK_DEMO_SEED_KEY = "releaseflow_hq_bulk_seed_v1";
const TODO_REBALANCE_KEY = "releaseflow_hq_todo_rebalanced_v1";
const PLATFORM_ICONS = {
  ios: "\u{1F34E}",
  apple_arcade: "\u{1F579}\uFE0F",
  android: "\u{1F916}",
  samsung_store: "\u{1F4F1}",
  windows_store: "\u{1FA9F}",
  playstation: "\u{1F3AE}",
  xbox: "\u{1F7E2}",
  nintendo: "\u{1F534}",
  netflix: "\u{1F3AC}",
  epic: "\u{1F6CD}\uFE0F",
  steam: "\u{2668}\uFE0F",
  generic: "\u{1F3AE}"
};
const PLATFORM_BRAND_ICON_URLS = {
  ios: [
    "https://cdn.simpleicons.org/apple/111111",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/apple.svg"
  ],
  apple_arcade: [
    "https://cdn.simpleicons.org/applearcade/111111",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/applearcade.svg",
    "https://cdn.simpleicons.org/apple/111111",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/apple.svg"
  ],
  android: [
    "https://cdn.simpleicons.org/android/3ddc84",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/android.svg"
  ],
  samsung_store: [
    "https://cdn.simpleicons.org/samsung/1428a0",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/samsung.svg"
  ],
  windows_store: [
    "https://cdn.simpleicons.org/windows/2563eb",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/windows.svg"
  ],
  playstation: [
    "https://cdn.simpleicons.org/playstation/1d4ed8",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/playstation.svg"
  ],
  xbox: [
    "https://cdn.simpleicons.org/xbox/16a34a",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/xbox.svg"
  ],
  nintendo: [
    "https://cdn.simpleicons.org/nintendoswitch/dc2626",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/nintendoswitch.svg"
  ],
  netflix: [
    "https://cdn.simpleicons.org/netflix/e50914",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/netflix.svg"
  ],
  epic: [
    "https://cdn.simpleicons.org/epicgames/111111",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/epicgames.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/epicgamesstore.svg"
  ],
  steam: [
    "https://cdn.simpleicons.org/steam/111111",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/steam.svg"
  ]
};

const DEFAULT_PLATFORMS = [
  { name: "iOS", icon: PLATFORM_ICONS.ios, color: "#64748b" },
  { name: "Apple Arcade", icon: PLATFORM_ICONS.apple_arcade, color: "#111827" },
  { name: "Android", icon: PLATFORM_ICONS.android, color: "#22c55e" },
  { name: "Samsung Store", icon: PLATFORM_ICONS.samsung_store, color: "#1428a0" },
  { name: "Windows Store", icon: PLATFORM_ICONS.windows_store, color: "#2563eb" },
  { name: "PlayStation", icon: PLATFORM_ICONS.playstation, color: "#1d4ed8" },
  { name: "Xbox", icon: PLATFORM_ICONS.xbox, color: "#16a34a" },
  { name: "Nintendo Switch", icon: PLATFORM_ICONS.nintendo, color: "#dc2626" },
  { name: "Epic Store", icon: PLATFORM_ICONS.epic, color: "#111827" },
  { name: "Netflix", icon: PLATFORM_ICONS.netflix, color: "#e50914" },
  { name: "Steam", icon: PLATFORM_ICONS.steam, color: "#111827" }
];

const STATUS_TEXT = {
  new: "New",
  to_do: "To Do",
  in_progress: "In Progress",
  done: "Done",
  failed: "Failed"
};
const CORE_STATUS_IDS = new Set(Object.keys(STATUS_TEXT));
const TIMELINE_SCALES = {
  day: { label: "Day", stepDays: 1, windowUnits: 21, navDays: 7 },
  week: { label: "Week", stepDays: 7, windowUnits: 10, navDays: 14 },
  month: { label: "Month", stepDays: 30, windowUnits: 8, navDays: 60 }
};
const PROJECT_STAGE_META = {
  creation: { label: "Creation", defaultWorkType: "creation" },
  production: { label: "Production", defaultWorkType: "creation" },
  qa_validation: { label: "QA Validation", defaultWorkType: "creation" },
  submission_ready: { label: "Submission Ready", defaultWorkType: "creation" },
  live_ops: { label: "LiveOps / Updates", defaultWorkType: "update" },
  maintenance: { label: "Maintenance", defaultWorkType: "update" }
};
const FORM_PANEL_CONFIG = {
  project: {
    cardKey: "projectFormCard",
    buttonKey: "toggleProjectFormBtn",
    closedLabel: "+ Add New Project",
    openLabel: "Hide Project Form"
  },
  submission: {
    cardKey: "submissionFormCard",
    buttonKey: "toggleSubmissionFormBtn",
    closedLabel: "+ Add New Submission",
    openLabel: "Hide Submission Form"
  },
  platform: {
    cardKey: "platformFormCard",
    buttonKey: "togglePlatformFormBtn",
    closedLabel: "+ Add Platform",
    openLabel: "Hide Platform Form"
  },
  status: {
    cardKey: "statusFormCard",
    buttonKey: "toggleStatusFormBtn",
    closedLabel: "+ Add Status",
    openLabel: "Hide Status Form"
  }
};

const state = loadState();
const dashboardFilters = {
  platformIds: new Set(),
  statuses: new Set(),
  workTypes: new Set(["creation", "update"]),
  timePreset: "this_month",
  fromDate: "",
  toDate: ""
};
let dashboardFiltersInitialized = false;
let knownPlatformIds = new Set();
let knownStatusIds = new Set();
let timelineScale = "week";
let timelineAnchorDate = startOfDay(new Date());
let timelineQuickPreset = "current_month";
let timelineRenderContext = null;
let timelineDragState = null;
let timelineSuppressClickUntil = 0;
let dashboardResizeTimer = null;
let dashboardFilterTab = "quick";
let performanceScope = "project";
let submissionDetailContext = null;
let statsDetailContext = null;
let projectHistoryContext = null;

const elements = {
  tabLinks: document.querySelectorAll(".tab-link"),
  tabPanels: document.querySelectorAll(".tab-panel"),
  liveClock: document.getElementById("liveClock"),
  liveDate: document.getElementById("liveDate"),

  dashboardFiltersBtn: document.getElementById("dashboardFiltersBtn"),
  dashboardClearFiltersBtn: document.getElementById("dashboardClearFiltersBtn"),
  dashboardDrawerClearBtn: document.getElementById("dashboardDrawerClearBtn"),
  dashboardDrawerCloseBtn: document.getElementById("dashboardDrawerCloseBtn"),
  dashboardFilterDrawer: document.getElementById("dashboardFilterDrawer"),
  dashboardFilterBackdrop: document.getElementById("dashboardFilterBackdrop"),
  dashboardFilterTabs: document.getElementById("dashboardFilterTabs"),
  dashboardFilterSearch: document.getElementById("dashboardFilterSearch"),
  dashboardActiveFilters: document.getElementById("dashboardActiveFilters"),
  statsScopeLabel: document.getElementById("statsScopeLabel"),
  statsDetailBackdrop: document.getElementById("statsDetailBackdrop"),
  statsDetailModal: document.getElementById("statsDetailModal"),
  statsDetailTitle: document.getElementById("statsDetailTitle"),
  statsDetailSubtitle: document.getElementById("statsDetailSubtitle"),
  statsDetailBody: document.getElementById("statsDetailBody"),
  statsDetailCloseBtn: document.getElementById("statsDetailCloseBtn"),
  projectHistoryBackdrop: document.getElementById("projectHistoryBackdrop"),
  projectHistoryModal: document.getElementById("projectHistoryModal"),
  projectHistoryTitle: document.getElementById("projectHistoryTitle"),
  projectHistorySubtitle: document.getElementById("projectHistorySubtitle"),
  projectHistoryBody: document.getElementById("projectHistoryBody"),
  projectHistoryCloseBtn: document.getElementById("projectHistoryCloseBtn"),
  dashboardPresetInProgressBtn: document.getElementById("dashboardPresetInProgressBtn"),
  dashboardPresetPassedBtn: document.getElementById("dashboardPresetPassedBtn"),
  dashboardPresetFailedBtn: document.getElementById("dashboardPresetFailedBtn"),
  dashboardPresetThisMonthBtn: document.getElementById("dashboardPresetThisMonthBtn"),
  dashboardPlatformToggles: document.getElementById("dashboardPlatformToggles"),
  dashboardStatusToggles: document.getElementById("dashboardStatusToggles"),
  dashboardWorkTypeToggles: document.getElementById("dashboardWorkTypeToggles"),
  dashboardTimePreset: document.getElementById("dashboardTimePreset"),
  dashboardFromDate: document.getElementById("dashboardFromDate"),
  dashboardToDate: document.getElementById("dashboardToDate"),
  dashboardApplyRangeBtn: document.getElementById("dashboardApplyRangeBtn"),
  statsGrid: document.getElementById("statsGrid"),
  timelineList: document.getElementById("timelineList") || document.getElementById("calendarRows"),
  timelineRangeLabel: document.getElementById("timelineRangeLabel"),
  timelineEmpty: document.getElementById("timelineEmpty"),
  timelineCount: document.getElementById("timelineCount"),
  timelinePrevBtn: document.getElementById("timelinePrevBtn"),
  timelineTodayBtn: document.getElementById("timelineTodayBtn"),
  timelineNextBtn: document.getElementById("timelineNextBtn"),
  timelineQuickPresetToggles: document.getElementById("timelineQuickPresetToggles"),
  timelineScaleToggles: document.getElementById("timelineScaleToggles"),
  calendarGridHeader: document.getElementById("calendarGridHeader"),
  calendarRows: document.getElementById("calendarRows"),
  platformChart: document.getElementById("platformChart"),
  performanceTimeRange: document.getElementById("performanceTimeRange"),
  performanceScopeToggles: document.getElementById("performanceScopeToggles"),
  performanceRefreshBtn: document.getElementById("performanceRefreshBtn"),
  performancePassRateTrend: document.getElementById("performancePassRateTrend"),
  performanceHotfixProjects: document.getElementById("performanceHotfixProjects"),
  performanceHotfixTitle: document.getElementById("performanceHotfixTitle"),
  performanceOutcomeTitle: document.getElementById("performanceOutcomeTitle"),
  performancePassedTitle: document.getElementById("performancePassedTitle"),
  performanceFailedTitle: document.getElementById("performanceFailedTitle"),
  performanceTopPassedProjects: document.getElementById("performanceTopPassedProjects"),
  performanceTopFailedProjects: document.getElementById("performanceTopFailedProjects"),
  performanceFailureTitle: document.getElementById("performanceFailureTitle"),
  performanceFailureReasons: document.getElementById("performanceFailureReasons"),
  performanceGenerateReportBtn: document.getElementById("performanceGenerateReportBtn"),
  performanceCopyReportBtn: document.getElementById("performanceCopyReportBtn"),
  performanceReportOutput: document.getElementById("performanceReportOutput"),
  performanceReportMeta: document.getElementById("performanceReportMeta"),
  submissionDetailBackdrop: document.getElementById("submissionDetailBackdrop"),
  submissionDetailModal: document.getElementById("submissionDetailModal"),
  submissionDetailTitle: document.getElementById("submissionDetailTitle"),
  submissionDetailSubtitle: document.getElementById("submissionDetailSubtitle"),
  submissionDetailBody: document.getElementById("submissionDetailBody"),
  submissionDetailCloseBtn: document.getElementById("submissionDetailCloseBtn"),
  submissionDetailOpenEditorBtn: document.getElementById("submissionDetailOpenEditorBtn"),

  projectForm: document.getElementById("projectForm"),
  projectFormCard: document.getElementById("projectFormCard"),
  toggleProjectFormBtn: document.getElementById("toggleProjectFormBtn"),
  projectId: document.getElementById("projectId"),
  projectName: document.getElementById("projectName"),
  projectStudio: document.getElementById("projectStudio"),
  projectQaStudio: document.getElementById("projectQaStudio"),
  projectStage: document.getElementById("projectStage"),
  projectResetBtn: document.getElementById("projectResetBtn"),
  projectsTableBody: document.getElementById("projectsTableBody"),

  submissionForm: document.getElementById("submissionForm"),
  submissionFormCard: document.getElementById("submissionFormCard"),
  toggleSubmissionFormBtn: document.getElementById("toggleSubmissionFormBtn"),
  submissionId: document.getElementById("submissionId"),
  submissionProject: document.getElementById("submissionProject"),
  submissionName: document.getElementById("submissionName"),
  submissionStatus: document.getElementById("submissionStatus"),
  submissionMainDate: document.getElementById("submissionMainDate"),
  submissionMainReleaseDate: document.getElementById("submissionMainReleaseDate"),
  submissionIsHotfix: document.getElementById("submissionIsHotfix"),
  submissionHotfixReason: document.getElementById("submissionHotfixReason"),
  submissionHotfixReasonField: document.getElementById("submissionHotfixReasonField"),
  submissionHotfixLabel: document.getElementById("submissionHotfixLabel"),
  submissionHotfixLabelField: document.getElementById("submissionHotfixLabelField"),
  submissionFailedReason: document.getElementById("submissionFailedReason"),
  submissionFailedLabel: document.getElementById("submissionFailedLabel"),
  failedReasonField: document.getElementById("failedReasonField"),
  failedLabelField: document.getElementById("failedLabelField"),
  addPlatformEntryBtn: document.getElementById("addPlatformEntryBtn"),
  platformEntries: document.getElementById("platformEntries"),
  submissionResetBtn: document.getElementById("submissionResetBtn"),
  submissionsTableBody: document.getElementById("submissionsTableBody"),

  platformForm: document.getElementById("platformForm"),
  platformFormCard: document.getElementById("platformFormCard"),
  togglePlatformFormBtn: document.getElementById("togglePlatformFormBtn"),
  platformId: document.getElementById("platformId"),
  platformName: document.getElementById("platformName"),
  platformIcon: document.getElementById("platformIcon"),
  platformColor: document.getElementById("platformColor"),
  platformResetBtn: document.getElementById("platformResetBtn"),
  platformsTableBody: document.getElementById("platformsTableBody"),

  statusForm: document.getElementById("statusForm"),
  statusFormCard: document.getElementById("statusFormCard"),
  toggleStatusFormBtn: document.getElementById("toggleStatusFormBtn"),
  statusId: document.getElementById("statusId"),
  statusName: document.getElementById("statusName"),
  statusColor: document.getElementById("statusColor"),
  statusResetBtn: document.getElementById("statusResetBtn"),
  statusesTableBody: document.getElementById("statusesTableBody"),

  platformRowTemplate: document.getElementById("platformRowTemplate")
};

init();

function init() {
  ensureDemoData();
  ensureBulkDemoSubmissions(100);
  let requiresSave = false;
  if (normalizeLastMonthSubmissionStatuses()) {
    requiresSave = true;
  }
  if (normalizeSingleInProgressPerProject()) {
    requiresSave = true;
  }
  if (rebalanceTodoBacklogOnce(0.8)) {
    requiresSave = true;
  }
  if (requiresSave) {
    saveState();
  }
  bindTabs();
  bindForms();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(() => {
    renderDashboard();
    renderPerformanceReporting();
  }, 60000);

  renderAll();
}

function bindTabs() {
  elements.tabLinks.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });
}

function bindForms() {
  elements.projectForm.addEventListener("submit", onProjectSave);
  elements.projectResetBtn.addEventListener("click", resetProjectForm);
  elements.projectsTableBody.addEventListener("click", onProjectTableClick);

  elements.submissionForm.addEventListener("submit", onSubmissionSave);
  elements.submissionResetBtn.addEventListener("click", resetSubmissionForm);
  elements.addPlatformEntryBtn.addEventListener("click", () => addPlatformEntryRow());
  elements.submissionStatus.addEventListener("change", toggleFailedFields);
  elements.submissionIsHotfix.addEventListener("change", toggleFailedFields);
  if (elements.submissionMainDate) {
    elements.submissionMainDate.addEventListener("change", syncMainDatesToEmptyPlatformRows);
  }
  if (elements.submissionMainReleaseDate) {
    elements.submissionMainReleaseDate.addEventListener("change", syncMainDatesToEmptyPlatformRows);
  }
  elements.submissionsTableBody.addEventListener("click", onSubmissionTableClick);
  elements.platformEntries.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-platform-entry")) {
      const row = event.target.closest(".platform-row");
      if (row) {
        row.remove();
      }
    }
  });

  elements.platformForm.addEventListener("submit", onPlatformSave);
  elements.platformResetBtn.addEventListener("click", resetPlatformForm);
  elements.platformsTableBody.addEventListener("click", onPlatformTableClick);

  if (elements.statusForm) {
    elements.statusForm.addEventListener("submit", onStatusSave);
  }
  if (elements.statusResetBtn) {
    elements.statusResetBtn.addEventListener("click", resetStatusForm);
  }
  if (elements.statusesTableBody) {
    elements.statusesTableBody.addEventListener("click", onStatusTableClick);
  }

  if (elements.toggleProjectFormBtn) {
    elements.toggleProjectFormBtn.addEventListener("click", () => toggleFormPanel("project"));
  }
  if (elements.toggleSubmissionFormBtn) {
    elements.toggleSubmissionFormBtn.addEventListener("click", () => toggleFormPanel("submission"));
  }
  if (elements.togglePlatformFormBtn) {
    elements.togglePlatformFormBtn.addEventListener("click", () => toggleFormPanel("platform"));
  }
  if (elements.toggleStatusFormBtn) {
    elements.toggleStatusFormBtn.addEventListener("click", () => toggleFormPanel("status"));
  }

  if (elements.dashboardFiltersBtn) {
    elements.dashboardFiltersBtn.addEventListener("click", () => setDashboardFilterDrawerOpen(true));
  }
  if (elements.dashboardDrawerCloseBtn) {
    elements.dashboardDrawerCloseBtn.addEventListener("click", () => setDashboardFilterDrawerOpen(false));
  }
  if (elements.dashboardFilterBackdrop) {
    elements.dashboardFilterBackdrop.addEventListener("click", () => setDashboardFilterDrawerOpen(false));
  }
  if (elements.dashboardClearFiltersBtn) {
    elements.dashboardClearFiltersBtn.addEventListener("click", resetDashboardFiltersToDefault);
  }
  if (elements.dashboardDrawerClearBtn) {
    elements.dashboardDrawerClearBtn.addEventListener("click", resetDashboardFiltersToDefault);
  }
  if (elements.dashboardFilterTabs) {
    elements.dashboardFilterTabs.addEventListener("click", onDashboardFilterTabClick);
  }
  if (elements.dashboardFilterSearch) {
    elements.dashboardFilterSearch.addEventListener("input", applyDashboardFilterSearch);
  }
  if (elements.dashboardPresetInProgressBtn) {
    elements.dashboardPresetInProgressBtn.addEventListener("click", () => applyDashboardCustomPreset("in_progress"));
  }
  if (elements.dashboardPresetPassedBtn) {
    elements.dashboardPresetPassedBtn.addEventListener("click", () => applyDashboardCustomPreset("passed"));
  }
  if (elements.dashboardPresetFailedBtn) {
    elements.dashboardPresetFailedBtn.addEventListener("click", () => applyDashboardCustomPreset("failed"));
  }
  if (elements.dashboardPresetThisMonthBtn) {
    elements.dashboardPresetThisMonthBtn.addEventListener("click", () => applyDashboardCustomPreset("this_month_all"));
  }
  if (elements.statsGrid) {
    elements.statsGrid.addEventListener("click", onStatsGridClick);
  }
  if (elements.submissionDetailCloseBtn) {
    elements.submissionDetailCloseBtn.addEventListener("click", closeSubmissionDetailModal);
  }
  if (elements.submissionDetailBackdrop) {
    elements.submissionDetailBackdrop.addEventListener("click", closeSubmissionDetailModal);
  }
  if (elements.submissionDetailOpenEditorBtn) {
    elements.submissionDetailOpenEditorBtn.addEventListener("click", onSubmissionDetailOpenEditor);
  }
  if (elements.statsDetailCloseBtn) {
    elements.statsDetailCloseBtn.addEventListener("click", closeStatsDetailModal);
  }
  if (elements.statsDetailBackdrop) {
    elements.statsDetailBackdrop.addEventListener("click", closeStatsDetailModal);
  }
  if (elements.projectHistoryCloseBtn) {
    elements.projectHistoryCloseBtn.addEventListener("click", closeProjectHistoryModal);
  }
  if (elements.projectHistoryBackdrop) {
    elements.projectHistoryBackdrop.addEventListener("click", closeProjectHistoryModal);
  }
  if (elements.projectHistoryBody) {
    elements.projectHistoryBody.addEventListener("click", onProjectHistoryBodyClick);
  }

  if (elements.dashboardPlatformToggles) {
    elements.dashboardPlatformToggles.addEventListener("click", onDashboardToggleClick);
  }
  if (elements.dashboardStatusToggles) {
    elements.dashboardStatusToggles.addEventListener("click", onDashboardToggleClick);
  }
  if (elements.dashboardWorkTypeToggles) {
    elements.dashboardWorkTypeToggles.addEventListener("click", onDashboardToggleClick);
  }
  if (elements.dashboardTimePreset) {
    elements.dashboardTimePreset.addEventListener("change", onDashboardTimePresetChange);
  }
  if (elements.dashboardApplyRangeBtn) {
    elements.dashboardApplyRangeBtn.addEventListener("click", applyDashboardCustomRange);
  }
  if (elements.dashboardFromDate) {
    elements.dashboardFromDate.addEventListener("change", onDashboardDateChange);
  }
  if (elements.dashboardToDate) {
    elements.dashboardToDate.addEventListener("change", onDashboardDateChange);
  }

  if (elements.timelineScaleToggles) {
    elements.timelineScaleToggles.addEventListener("click", onTimelineScaleToggleClick);
  }
  if (elements.timelineQuickPresetToggles) {
    elements.timelineQuickPresetToggles.addEventListener("click", onTimelineQuickPresetClick);
  }
  if (elements.timelinePrevBtn) {
    elements.timelinePrevBtn.addEventListener("click", () => shiftTimelineWindow(-1));
  }
  if (elements.timelineNextBtn) {
    elements.timelineNextBtn.addEventListener("click", () => shiftTimelineWindow(1));
  }
  if (elements.timelineTodayBtn) {
    elements.timelineTodayBtn.addEventListener("click", resetTimelineToToday);
  }

  if (elements.performanceTimeRange) {
    elements.performanceTimeRange.addEventListener("change", renderPerformanceReporting);
  }
  if (elements.performanceScopeToggles) {
    elements.performanceScopeToggles.addEventListener("click", onPerformanceScopeToggleClick);
  }
  if (elements.performanceRefreshBtn) {
    elements.performanceRefreshBtn.addEventListener("click", renderPerformanceReporting);
  }
  if (elements.performanceGenerateReportBtn) {
    elements.performanceGenerateReportBtn.addEventListener("click", generatePerformanceReport);
  }
  if (elements.performanceCopyReportBtn) {
    elements.performanceCopyReportBtn.addEventListener("click", copyPerformanceReport);
  }

  if (elements.calendarRows) {
    elements.calendarRows.addEventListener("click", onTimelineClick);
    elements.calendarRows.addEventListener("pointerdown", onTimelinePointerDown);
  }
  document.addEventListener("pointermove", onTimelinePointerMove);
  document.addEventListener("pointerup", onTimelinePointerUp);
  document.addEventListener("keydown", onGlobalKeyDown);
  window.addEventListener("resize", onDashboardResize);
}

function onDashboardResize() {
  if (dashboardResizeTimer) {
    clearTimeout(dashboardResizeTimer);
  }
  dashboardResizeTimer = setTimeout(() => {
    renderDashboard();
  }, 120);
}

function onGlobalKeyDown(event) {
  if (event.key !== "Escape") {
    return;
  }
  if (isDashboardFilterDrawerOpen()) {
    setDashboardFilterDrawerOpen(false);
  }
  if (isSubmissionDetailModalOpen()) {
    closeSubmissionDetailModal();
  }
  if (isStatsDetailModalOpen()) {
    closeStatsDetailModal();
  }
  if (isProjectHistoryModalOpen()) {
    closeProjectHistoryModal();
  }
}

function isDashboardFilterDrawerOpen() {
  return Boolean(elements.dashboardFilterDrawer && !elements.dashboardFilterDrawer.classList.contains("hidden"));
}

function setDashboardFilterDrawerOpen(isOpen) {
  if (!elements.dashboardFilterDrawer || !elements.dashboardFilterBackdrop) {
    return;
  }

  elements.dashboardFilterDrawer.classList.toggle("hidden", !isOpen);
  elements.dashboardFilterBackdrop.classList.toggle("hidden", !isOpen);
  elements.dashboardFilterDrawer.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    setDashboardFilterTab(dashboardFilterTab);
    applyDashboardFilterSearch();
  }
}

function onDashboardFilterTabClick(event) {
  const button = event.target.closest("button[data-filter-tab]");
  if (!button) {
    return;
  }
  setDashboardFilterTab(button.dataset.filterTab);
}

function setDashboardFilterTab(tabId) {
  if (!elements.dashboardFilterDrawer) {
    return;
  }
  dashboardFilterTab = tabId || "quick";

  elements.dashboardFilterDrawer.querySelectorAll("button[data-filter-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filterTab === dashboardFilterTab);
  });

  elements.dashboardFilterDrawer.querySelectorAll("[data-filter-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.filterPanel === dashboardFilterTab);
  });
}

function applyDashboardFilterSearch() {
  if (!elements.dashboardFilterSearch || !elements.dashboardFilterDrawer) {
    return;
  }
  const query = elements.dashboardFilterSearch.value.trim().toLowerCase();
  const groups = elements.dashboardFilterDrawer.querySelectorAll(".drawer-filter-group[data-filter-group]");

  groups.forEach((group) => {
    const buttons = group.querySelectorAll(".toggle-btn");
    let visibleCount = 0;
    buttons.forEach((button) => {
      const matches = !query || button.textContent.toLowerCase().includes(query);
      button.classList.toggle("hidden", !matches);
      if (matches) {
        visibleCount += 1;
      }
    });
    group.classList.toggle("hidden", visibleCount === 0);
  });
}

function resetDashboardFiltersToDefault() {
  syncDashboardFilters();
  dashboardFilters.platformIds.clear();
  dashboardFilters.statuses.clear();
  dashboardFilters.workTypes.clear();
  dashboardFilters.timePreset = "all";
  dashboardFilters.fromDate = "";
  dashboardFilters.toDate = "";
  if (elements.dashboardFilterSearch) {
    elements.dashboardFilterSearch.value = "";
  }
  renderDashboardFilterToggles();
  renderDashboardWorkTypeToggles();
  renderDashboardTimeControls();
  applyDashboardFilterSearch();
  renderDashboard();
}

function applyDashboardCustomPreset(presetId) {
  syncDashboardFilters();
  dashboardFilters.platformIds.clear();
  state.platformCatalog.forEach((platform) => dashboardFilters.platformIds.add(platform.id));
  dashboardFilters.statuses.clear();
  dashboardFilters.workTypes.clear();
  dashboardFilters.workTypes.add("creation");
  dashboardFilters.workTypes.add("update");

  if (presetId === "in_progress") {
    const inProgressId = findStatusIdByPriority(["in_progress"]);
    if (inProgressId) {
      dashboardFilters.statuses.add(inProgressId);
    }
  } else if (presetId === "passed") {
    const doneId = findStatusIdByPriority(["done"]);
    if (doneId) {
      dashboardFilters.statuses.add(doneId);
    }
  } else if (presetId === "failed") {
    const failedId = findStatusIdByPriority(["failed"]);
    if (failedId) {
      dashboardFilters.statuses.add(failedId);
    }
  } else {
    state.statusCatalog.forEach((status) => dashboardFilters.statuses.add(status.id));
  }

  if (!dashboardFilters.statuses.size) {
    state.statusCatalog.forEach((status) => dashboardFilters.statuses.add(status.id));
  }

  dashboardFilters.timePreset = "this_month";
  dashboardFilters.fromDate = "";
  dashboardFilters.toDate = "";
  renderDashboardFilterToggles();
  renderDashboardWorkTypeToggles();
  renderDashboardTimeControls();
  renderDashboard();
}

function findStatusIdByPriority(priorityIds) {
  for (const rawId of priorityIds) {
    const id = normalizeStatusId(rawId);
    const byId = state.statusCatalog.find((status) => normalizeStatusId(status.id) === id);
    if (byId) {
      return byId.id;
    }
    const byName = state.statusCatalog.find((status) => normalizeStatusId(status.name) === id);
    if (byName) {
      return byName.id;
    }
  }
  return "";
}

function isSubmissionDetailModalOpen() {
  return Boolean(elements.submissionDetailModal && !elements.submissionDetailModal.classList.contains("hidden"));
}

function openSubmissionDetailModal(submissionId, entryId) {
  const submission = state.submissions.find((item) => item.id === submissionId);
  if (!submission || !elements.submissionDetailModal) {
    return;
  }
  closeStatsDetailModal();
  closeProjectHistoryModal();

  const project = state.projects.find((item) => item.id === submission.projectId);
  const selectedEntry = (submission.platformEntries || []).find((entry) => entry.id === entryId)
    || (submission.platformEntries || [])[0]
    || null;
  const qaLabel = getSubmissionQaLabel(submission);
  const reasonLines = getSubmissionReasonLines(submission);
  const reasonMarkup = reasonLines.length
    ? `<div class="submission-reason-list">${reasonLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</div>`
    : "<strong>-</strong>";
  const statusChip = renderStatusChip(submission.status);
  const labelChip = renderLabelChip(qaLabel, buildSubmissionQaTooltip(submission));

  elements.submissionDetailTitle.textContent = submission.name || "Submission";
  elements.submissionDetailSubtitle.textContent = project
    ? `${project.name} · ${project.studio}`
    : "Deleted Project";

  elements.submissionDetailBody.innerHTML = `
    <div class="submission-modal-grid">
      <div class="submission-modal-item">
        <span>Global Status</span>
        <strong>${statusChip}</strong>
      </div>
      <div class="submission-modal-item">
        <span>QA Label</span>
        <strong>${labelChip || "-"}</strong>
      </div>
      <div class="submission-modal-item">
        <span>Reasons</span>
        ${reasonMarkup}
      </div>
      <div class="submission-modal-item">
        <span>Updated</span>
        <strong>${formatDateTime(submission.updatedAt)}</strong>
      </div>
    </div>
    <div class="submission-modal-list">
      <article class="submission-entry-head">
        <strong>Platform</strong>
        <strong>Status</strong>
        <strong>Version</strong>
        <strong>Submission Date</strong>
        <strong>Release Date</strong>
      </article>
      ${(submission.platformEntries || [])
        .map((entry) => {
          const isActive = selectedEntry && selectedEntry.id === entry.id;
          const rowStatus = entry.status || submission.status;
          return `
            <article class="submission-entry-row ${isActive ? "active" : ""}">
              <div class="submission-entry-cell">
                <span class="submission-entry-cell-label">Platform</span>
                <div>${renderPlatformChipById(entry.platformId, true)}</div>
              </div>
              <div class="submission-entry-cell">
                <span class="submission-entry-cell-label">Status</span>
                <div>${renderStatusChip(rowStatus)}</div>
              </div>
              <div class="submission-entry-cell">
                <span class="submission-entry-cell-label">Version</span>
                <div>v${escapeHtml(entry.version || "-")}</div>
              </div>
              <div class="submission-entry-cell">
                <span class="submission-entry-cell-label">Submission Date</span>
                <div>${formatDate(entry.submissionDate)}</div>
              </div>
              <div class="submission-entry-cell">
                <span class="submission-entry-cell-label">Release Date</span>
                <div>${formatDate(entry.releaseDate)}</div>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  submissionDetailContext = { submissionId, entryId: selectedEntry?.id || "" };
  elements.submissionDetailModal.classList.remove("hidden");
  elements.submissionDetailBackdrop?.classList.remove("hidden");
  elements.submissionDetailModal.setAttribute("aria-hidden", "false");
  hydratePlatformBrandIcons(elements.submissionDetailModal);
}

function closeSubmissionDetailModal() {
  if (!elements.submissionDetailModal) {
    return;
  }
  elements.submissionDetailModal.classList.add("hidden");
  elements.submissionDetailBackdrop?.classList.add("hidden");
  elements.submissionDetailModal.setAttribute("aria-hidden", "true");
  submissionDetailContext = null;
}

function onSubmissionDetailOpenEditor() {
  if (!submissionDetailContext?.submissionId) {
    return;
  }
  const submissionId = submissionDetailContext.submissionId;
  closeSubmissionDetailModal();
  openSubmissionEditor(submissionId);
}

function onStatsGridClick(event) {
  const card = event.target.closest("[data-stat-key]");
  if (!card) {
    return;
  }
  const key = card.dataset.statKey;
  if (!key) {
    return;
  }
  openStatsDetailModal(key);
}

function isStatsDetailModalOpen() {
  return Boolean(elements.statsDetailModal && !elements.statsDetailModal.classList.contains("hidden"));
}

function openStatsDetailModal(statKey) {
  if (!statsDetailContext || !elements.statsDetailModal || !elements.statsDetailBody) {
    return;
  }
  closeSubmissionDetailModal();
  closeProjectHistoryModal();
  const bucket = statsDetailContext[statKey];
  if (!bucket) {
    return;
  }

  const entries = bucket.items
    .slice()
    .sort((a, b) => {
      const project = a.projectName.localeCompare(b.projectName);
      if (project !== 0) {
        return project;
      }
      const submission = a.submissionName.localeCompare(b.submissionName);
      if (submission !== 0) {
        return submission;
      }
      const dateA = parseDate(a.submissionDate)?.getTime() || 0;
      const dateB = parseDate(b.submissionDate)?.getTime() || 0;
      return dateB - dateA;
    });
  const scope = elements.statsScopeLabel?.textContent || "Current Scope";
  const includeReasons = statKey !== "total";
  const tableClass = includeReasons ? "with-reason" : "basic";

  elements.statsDetailTitle.textContent = bucket.label;
  elements.statsDetailSubtitle.textContent = `${scope} · ${entries.length} store releases`;
  elements.statsDetailBody.innerHTML = entries.length
    ? `<div class="stats-detail-table ${tableClass}">
        <article class="stats-detail-head">
          <strong>Project</strong>
          <strong>Submission</strong>
          <strong>Status</strong>
          <strong>Platform</strong>
          ${includeReasons ? "<strong>Reason Details</strong>" : ""}
        </article>
        <div class="stats-detail-list">${entries
        .map((entry) => {
          const reasonDetails = buildStatsEntryReasonDetails(entry);
          return `
            <article class="stats-detail-row">
              <div class="stats-detail-project">${escapeHtml(entry.projectName)}</div>
              <div class="stats-detail-main">
                <strong>${escapeHtml(entry.submissionName)}</strong>
                <span>${formatDate(entry.submissionDate)} → ${formatDate(entry.releaseDate)}</span>
              </div>
              <div>${renderStatusChip(entry.status)}</div>
              <div class="stats-detail-platforms">${renderPlatformChipById(entry.platformId, true)}</div>
              ${
                includeReasons
                  ? `<div class="stats-detail-reason">${reasonDetails.map((part) => `<span>${escapeHtml(part)}</span>`).join("")}</div>`
                  : ""
              }
            </article>
          `;
        })
        .join("")}</div>
      </div>`
    : '<div class="empty-state">No submissions in this category for current filters.</div>';

  elements.statsDetailModal.classList.remove("hidden");
  elements.statsDetailBackdrop?.classList.remove("hidden");
  elements.statsDetailModal.setAttribute("aria-hidden", "false");
  hydratePlatformBrandIcons(elements.statsDetailModal);
}

function buildStatsEntryReasonDetails(item) {
  const statusId = normalizeStatusId(item?.status);
  const parts = [];
  const hotfixReason = String(item?.hotfixReason || "").trim();
  const failReason = String(item?.failedReason || "").trim();
  const hotfixTone = item?.hotfixLabel === "QA" ? "QA" : item?.hotfixLabel === "NotQA" ? "Non-QA" : "";
  const failTone = item?.failedLabel === "QA" ? "QA" : item?.failedLabel === "NotQA" ? "Non-QA" : "";

  if (item?.isHotfix && hotfixReason) {
    parts.push(`HF reason${hotfixTone ? ` (${hotfixTone})` : ""}: ${hotfixReason}`);
  }
  if (statusId === "failed" && failReason) {
    parts.push(`Fail reason${failTone ? ` (${failTone})` : ""}: ${failReason}`);
  }
  if (!parts.length) {
    parts.push("-");
  }

  return parts;
}

function closeStatsDetailModal() {
  if (!elements.statsDetailModal) {
    return;
  }
  elements.statsDetailModal.classList.add("hidden");
  elements.statsDetailBackdrop?.classList.add("hidden");
  elements.statsDetailModal.setAttribute("aria-hidden", "true");
}

function isProjectHistoryModalOpen() {
  return Boolean(elements.projectHistoryModal && !elements.projectHistoryModal.classList.contains("hidden"));
}

function openProjectHistoryModal(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project || !elements.projectHistoryModal || !elements.projectHistoryBody) {
    return;
  }

  closeSubmissionDetailModal();
  closeStatsDetailModal();

  const submissions = state.submissions
    .filter((submission) => submission.projectId === projectId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const storeEntries = submissions.flatMap((submission) =>
    (submission.platformEntries || []).map((entry) => ({
      status: normalizeStatusId(entry.status || submission.status),
      isHotfix: Boolean(submission.isHotfix)
    }))
  );
  const total = storeEntries.length;
  const done = storeEntries.filter((entry) => isDoneStatus(entry.status)).length;
  const failed = storeEntries.filter((entry) => isFailedStatus(entry.status)).length;
  const inProgress = storeEntries.filter((entry) => normalizeStatusId(entry.status) === "in_progress").length;
  const hotfixCount = storeEntries.filter((entry) => entry.isHotfix).length;
  const resolvedTotal = done + failed;
  const passRate = resolvedTotal ? Math.round((done / resolvedTotal) * 100) : 0;
  const passRateTone = getPassRateTone(passRate, resolvedTotal);

  elements.projectHistoryTitle.textContent = project.name || "Project History";
  const qaPart = project.qaStudio ? `QA: ${project.qaStudio}` : "QA: -";
  const stagePart = `Stage: ${getProjectStageLabel(project.stage)}`;
  const flowPart = normalizeProjectWorkType(project.workType) === "creation" ? "Creation" : "Update";
  elements.projectHistorySubtitle.textContent = `${project.studio} · ${qaPart} · ${stagePart} · ${flowPart}`;

  elements.projectHistoryBody.innerHTML = `
    <div class="submission-modal-grid project-history-summary-grid">
      <article class="stat-card stat-${passRateTone} project-history-stat-card"><span>Pass Rate</span><strong>${passRate}%</strong></article>
      <article class="stat-card stat-neutral project-history-stat-card"><span>Total Store Releases</span><strong>${total}</strong></article>
      <article class="stat-card stat-success project-history-stat-card"><span>Done</span><strong>${done}</strong></article>
      <article class="stat-card stat-info project-history-stat-card"><span>In Progress</span><strong>${inProgress}</strong></article>
      <article class="stat-card stat-danger project-history-stat-card"><span>Failed</span><strong>${failed}</strong></article>
      <article class="stat-card stat-warning project-history-stat-card"><span>Hotfix</span><strong>${hotfixCount}</strong></article>
    </div>
    ${
      submissions.length
        ? `<div class="project-history-list">${submissions
            .map((submission) => {
              const qaLabel = getSubmissionQaLabel(submission);
              const qaTooltip = buildSubmissionQaTooltip(submission);
              const reason = getSubmissionReason(submission);
              const sortedEntries = (submission.platformEntries || []).slice().sort((a, b) => {
                const aDate = parseDate(a.submissionDate)?.getTime() || 0;
                const bDate = parseDate(b.submissionDate)?.getTime() || 0;
                return bDate - aDate;
              });
              const entryDone = sortedEntries.filter((entry) => isDoneStatus(entry.status || submission.status)).length;
              const entryInProgress = sortedEntries.filter(
                (entry) => normalizeStatusId(entry.status || submission.status) === "in_progress"
              ).length;
              const entryFailed = sortedEntries.filter((entry) => isFailedStatus(entry.status || submission.status)).length;
              return `
                <article class="project-history-item">
                  <header class="project-history-item-header">
                    <div>
                      <h4>${escapeHtml(submission.name)}</h4>
                      <p>Updated ${formatDateTime(submission.updatedAt)}</p>
                      <p>Store Releases ${sortedEntries.length} · Done ${entryDone} · In Progress ${entryInProgress} · Failed ${entryFailed}</p>
                    </div>
                    <button class="btn-ghost" type="button" data-action="project-history-open-submission" data-id="${submission.id}">Open</button>
                  </header>
                  <div class="project-history-meta">
                    ${renderStatusChip(submission.status)}
                    ${renderLabelChip(qaLabel, qaTooltip)}
                    ${renderHotfixChip(Boolean(submission.isHotfix))}
                  </div>
                  ${reason ? `<p class="project-history-reason">${escapeHtml(reason)}</p>` : ""}
                  <div class="project-history-platform-list">
                    ${sortedEntries
                      .map(
                        (entry) => `
                      <div class="project-history-platform-row">
                        <span>${renderPlatformChipById(entry.platformId, true)}</span>
                        <span>${renderStatusChip(entry.status || submission.status)}</span>
                        <span>v${escapeHtml(entry.version || "-")}</span>
                        <span>${formatDate(entry.submissionDate)} → ${formatDate(entry.releaseDate)}</span>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </article>
              `;
            })
            .join("")}</div>`
        : '<div class="empty-state">No submissions registered for this project yet.</div>'
    }
  `;

  projectHistoryContext = { projectId };
  elements.projectHistoryModal.classList.remove("hidden");
  elements.projectHistoryBackdrop?.classList.remove("hidden");
  elements.projectHistoryModal.setAttribute("aria-hidden", "false");
  hydratePlatformBrandIcons(elements.projectHistoryModal);
}

function closeProjectHistoryModal() {
  if (!elements.projectHistoryModal) {
    return;
  }
  elements.projectHistoryModal.classList.add("hidden");
  elements.projectHistoryBackdrop?.classList.add("hidden");
  elements.projectHistoryModal.setAttribute("aria-hidden", "true");
  projectHistoryContext = null;
}

function onProjectHistoryBodyClick(event) {
  const button = event.target.closest("button[data-action='project-history-open-submission']");
  if (!button) {
    return;
  }
  const submissionId = button.dataset.id;
  if (!submissionId) {
    return;
  }
  closeProjectHistoryModal();
  openSubmissionDetailModal(submissionId, "");
}

function summarizeItemsBySubmission(items) {
  const map = new Map();
  items.forEach((item) => {
    if (!map.has(item.submissionId)) {
      map.set(item.submissionId, {
        submissionId: item.submissionId,
        submissionName: item.submissionName,
        projectName: item.projectName,
        status: item.status,
        qaLabel: isQaDecision(item.qaLabel) ? item.qaLabel : "",
        reason: getCombinedReasonText(item),
        tooltip: buildTimelineQaTooltip(item),
        platformIds: new Set()
      });
    }
    const current = map.get(item.submissionId);
    current.platformIds.add(item.platformId);
    if (!current.reason) {
      current.reason = getCombinedReasonText(item);
    }
  });

  return [...map.values()]
    .map((entry) => ({
      ...entry,
      platformIds: [...entry.platformIds]
    }))
    .sort((a, b) => a.submissionName.localeCompare(b.submissionName));
}

function toggleFormPanel(panelKey) {
  const card = getFormPanelCard(panelKey);
  if (!card) {
    return;
  }

  const willOpen = card.hidden;
  if (willOpen) {
    resetFormPanelForCreate(panelKey);
  }
  setFormPanelOpen(panelKey, willOpen);
}

function syncFormPanelsUi() {
  Object.keys(FORM_PANEL_CONFIG).forEach((panelKey) => {
    const card = getFormPanelCard(panelKey);
    if (!card) {
      return;
    }
    setFormPanelOpen(panelKey, !card.hidden);
  });
}

function setFormPanelOpen(panelKey, isOpen) {
  const config = FORM_PANEL_CONFIG[panelKey];
  if (!config) {
    return;
  }

  const card = getFormPanelCard(panelKey);
  if (card) {
    card.hidden = !isOpen;
    card.classList.toggle("is-open", isOpen);
  }

  const button = getFormPanelButton(panelKey);
  if (button) {
    button.textContent = isOpen ? config.openLabel : config.closedLabel;
    button.setAttribute("aria-expanded", String(isOpen));
  }
}

function resetFormPanelForCreate(panelKey) {
  if (panelKey === "project") {
    resetProjectForm();
  }
  if (panelKey === "submission") {
    resetSubmissionForm();
  }
  if (panelKey === "platform") {
    resetPlatformForm();
  }
  if (panelKey === "status") {
    resetStatusForm();
  }
}

function getFormPanelCard(panelKey) {
  const config = FORM_PANEL_CONFIG[panelKey];
  if (!config) {
    return null;
  }
  return elements[config.cardKey] || null;
}

function getFormPanelButton(panelKey) {
  const config = FORM_PANEL_CONFIG[panelKey];
  if (!config) {
    return null;
  }
  return elements[config.buttonKey] || null;
}

function setActiveTab(tabId) {
  elements.tabLinks.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  if (tabId !== "dashboard") {
    setDashboardFilterDrawerOpen(false);
    closeSubmissionDetailModal();
    closeStatsDetailModal();
    closeProjectHistoryModal();
  }
}

function updateClock() {
  const now = new Date();
  elements.liveClock.textContent = now.toLocaleTimeString();
  elements.liveDate.textContent = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function renderAll() {
  renderStatusOptions();
  renderProjectOptions();
  renderDashboardFilterToggles();
  renderDashboardWorkTypeToggles();
  renderDashboardTimeControls();
  setDashboardFilterTab(dashboardFilterTab);
  renderTimelineQuickPresetToggles();
  renderTimelineScaleToggles();
  renderProjectsTable();
  renderSubmissionsTable();
  renderPlatformsTable();
  renderStatusesTable();
  toggleFailedFields();
  syncFormPanelsUi();
  renderDashboard();
  renderPerformanceScopeToggles();
  renderPerformanceReporting();
  hydratePlatformBrandIcons();

  if (!elements.platformEntries.children.length) {
    addPlatformEntryRow();
  }
}

function onPerformanceScopeToggleClick(event) {
  const button = event.target.closest("button[data-performance-scope]");
  if (!button) {
    return;
  }
  const scope = button.dataset.performanceScope;
  if (scope !== "project" && scope !== "platform") {
    return;
  }
  if (scope === performanceScope) {
    return;
  }
  performanceScope = scope;
  renderPerformanceScopeToggles();
  renderPerformanceReporting();
}

function renderPerformanceScopeToggles() {
  if (!elements.performanceScopeToggles) {
    return;
  }
  elements.performanceScopeToggles.querySelectorAll("button[data-performance-scope]").forEach((button) => {
    const isActive = button.dataset.performanceScope === performanceScope;
    button.classList.toggle("active", isActive);
    button.classList.toggle("inactive", !isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function renderStatusOptions() {
  const current = elements.submissionStatus.value;
  elements.submissionStatus.innerHTML = "";

  getSortedStatuses().forEach((status) => {
    const option = document.createElement("option");
    option.value = status.id;
    option.textContent = status.name;
    elements.submissionStatus.appendChild(option);
  });

  const validIds = getStatusIds();
  if (validIds.includes(current)) {
    elements.submissionStatus.value = current;
  } else {
    elements.submissionStatus.value = getDefaultStatusId();
  }
}

function renderProjectOptions() {
  const currentValue = elements.submissionProject.value;
  elements.submissionProject.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select project...";
  elements.submissionProject.appendChild(defaultOption);

  state.projects
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = `${project.name} (${project.studio})`;
      elements.submissionProject.appendChild(option);
    });

  if (state.projects.some((item) => item.id === currentValue)) {
    elements.submissionProject.value = currentValue;
  }
}

function renderDashboardFilterToggles() {
  syncDashboardFilters();
  if (!elements.dashboardPlatformToggles || !elements.dashboardStatusToggles) {
    return;
  }

  const sortedPlatforms = state.platformCatalog.slice().sort((a, b) => a.name.localeCompare(b.name));
  elements.dashboardPlatformToggles.innerHTML = sortedPlatforms
    .map((platform) => {
      const isActive = dashboardFilters.platformIds.has(platform.id);
      const color = normalizeHexColor(platform.color, "#0f766e");
      return `
        <button
          class="toggle-btn ${isActive ? "active" : "inactive"}"
          type="button"
          aria-pressed="${isActive ? "true" : "false"}"
          data-filter-type="platform"
          data-filter-id="${platform.id}"
          style="border-color:${color}; ${isActive ? `background:${hexToRgba(color, 0.18)}; color:${color};` : ""}">
          ${renderPlatformIconMarkup(platform, "platform-brand-icon")} ${escapeHtml(platform.name)}
        </button>
      `;
    })
    .join("");

  elements.dashboardStatusToggles.innerHTML = getSortedStatuses()
    .map((status) => {
      const isActive = dashboardFilters.statuses.has(status.id);
      const statusColor = getStatusDisplayColor(status.id, status.color);
      return `
        <button
          class="toggle-btn ${isActive ? "active" : "inactive"}"
          type="button"
          aria-pressed="${isActive ? "true" : "false"}"
          data-filter-type="status"
          data-filter-id="${status.id}"
          style="border-color:${statusColor}; ${isActive ? `background:${hexToRgba(statusColor, 0.2)}; color:${statusColor};` : ""}">
          ${escapeHtml(status.name)}
        </button>
      `;
    })
    .join("");

  applyDashboardFilterSearch();
  renderDashboardFilterSummary();
}

function renderDashboardWorkTypeToggles() {
  if (!elements.dashboardWorkTypeToggles) {
    return;
  }

  const options = [
    { id: "creation", label: "Creations" },
    { id: "update", label: "Updates" }
  ];

  elements.dashboardWorkTypeToggles.innerHTML = options
    .map((option) => {
      const isActive = dashboardFilters.workTypes.has(option.id);
      return `
        <button
          class="toggle-btn ${isActive ? "active" : "inactive"}"
          type="button"
          aria-pressed="${isActive ? "true" : "false"}"
          data-filter-type="work_type"
          data-filter-id="${option.id}">
          ${escapeHtml(option.label)}
        </button>
      `;
    })
    .join("");

  applyDashboardFilterSearch();
  renderDashboardFilterSummary();
}

function renderDashboardTimeControls() {
  if (!elements.dashboardTimePreset) {
    return;
  }
  elements.dashboardTimePreset.value = dashboardFilters.timePreset;
  if (elements.dashboardFromDate) {
    elements.dashboardFromDate.value = dashboardFilters.fromDate || "";
  }
  if (elements.dashboardToDate) {
    elements.dashboardToDate.value = dashboardFilters.toDate || "";
  }
  const isCustom = dashboardFilters.timePreset === "custom";
  if (elements.dashboardFromDate) {
    elements.dashboardFromDate.disabled = !isCustom;
  }
  if (elements.dashboardToDate) {
    elements.dashboardToDate.disabled = !isCustom;
  }
  if (elements.dashboardApplyRangeBtn) {
    elements.dashboardApplyRangeBtn.disabled = !isCustom;
  }
  renderDashboardFilterSummary();
}

function renderDashboardFilterSummary() {
  if (!elements.dashboardActiveFilters) {
    return;
  }

  const totalPlatforms = state.platformCatalog.length;
  const totalStatuses = state.statusCatalog.length;
  const platformCount = dashboardFilters.platformIds.size;
  const statusCount = dashboardFilters.statuses.size;
  const typeCount = dashboardFilters.workTypes.size;
  const typeLabel = typeCount === 2 ? "All Types" : `${typeCount} ${typeCount === 1 ? "Type" : "Types"}`;
  const timeLabel = getDashboardTimeFilterLabel();

  const chips = [
    `<span class="active-filter-chip">${platformCount === totalPlatforms ? "All Platforms" : `${platformCount}/${totalPlatforms} Platforms`}</span>`,
    `<span class="active-filter-chip">${statusCount === totalStatuses ? "All Statuses" : `${statusCount}/${totalStatuses} Statuses`}</span>`,
    `<span class="active-filter-chip">${typeLabel}</span>`,
    `<span class="active-filter-chip">${timeLabel}</span>`
  ];

  elements.dashboardActiveFilters.innerHTML = chips.join("");
}

function getDashboardTimeFilterLabel() {
  const preset = dashboardFilters.timePreset || "all";
  if (preset === "this_month") {
    return "This Month";
  }
  if (preset === "last_30_days") {
    return "Last 30 Days";
  }
  if (preset === "custom") {
    if (dashboardFilters.fromDate || dashboardFilters.toDate) {
      const from = dashboardFilters.fromDate || "...";
      const to = dashboardFilters.toDate || "...";
      return `Custom: ${from} to ${to}`;
    }
    return "Custom Range";
  }
  return "All Time";
}

function syncDashboardFilters() {
  const platformIds = new Set(state.platformCatalog.map((platform) => platform.id));
  const statusIds = new Set(state.statusCatalog.map((status) => status.id));
  const workTypeIds = new Set(["creation", "update"]);
  if (!dashboardFiltersInitialized) {
    statusIds.forEach((status) => dashboardFilters.statuses.add(status));
    platformIds.forEach((platformId) => dashboardFilters.platformIds.add(platformId));
    workTypeIds.forEach((workType) => dashboardFilters.workTypes.add(workType));
    knownPlatformIds = platformIds;
    knownStatusIds = statusIds;
    dashboardFiltersInitialized = true;
    return;
  }

  [...dashboardFilters.platformIds].forEach((id) => {
    if (!platformIds.has(id)) {
      dashboardFilters.platformIds.delete(id);
    }
  });
  [...dashboardFilters.statuses].forEach((id) => {
    if (!statusIds.has(id)) {
      dashboardFilters.statuses.delete(id);
    }
  });
  [...dashboardFilters.workTypes].forEach((id) => {
    if (!workTypeIds.has(id)) {
      dashboardFilters.workTypes.delete(id);
    }
  });

  [...knownPlatformIds].forEach((id) => {
    if (!platformIds.has(id)) {
      knownPlatformIds.delete(id);
    }
  });
  [...knownStatusIds].forEach((id) => {
    if (!statusIds.has(id)) {
      knownStatusIds.delete(id);
    }
  });

  platformIds.forEach((id) => {
    if (!knownPlatformIds.has(id)) {
      dashboardFilters.platformIds.add(id);
      knownPlatformIds.add(id);
    }
  });
  statusIds.forEach((id) => {
    if (!knownStatusIds.has(id)) {
      dashboardFilters.statuses.add(id);
      knownStatusIds.add(id);
    }
  });

}

function onDashboardToggleClick(event) {
  const button = event.target.closest("button[data-filter-type]");
  if (!button) {
    return;
  }

  const filterType = button.dataset.filterType;
  const filterId = button.dataset.filterId;

  if (filterType === "platform") {
    toggleFilterSet(dashboardFilters.platformIds, filterId);
  }

  if (filterType === "status") {
    toggleFilterSet(dashboardFilters.statuses, filterId);
  }
  if (filterType === "work_type") {
    toggleFilterSet(dashboardFilters.workTypes, filterId);
  }

  renderDashboardFilterToggles();
  renderDashboardWorkTypeToggles();
  renderDashboard();
}

function toggleFilterSet(targetSet, value) {
  if (targetSet.has(value)) {
    targetSet.delete(value);
  } else {
    targetSet.add(value);
  }
}

function onDashboardTimePresetChange() {
  if (!elements.dashboardTimePreset) {
    return;
  }
  dashboardFilters.timePreset = elements.dashboardTimePreset.value || "all";
  if (dashboardFilters.timePreset !== "custom") {
    dashboardFilters.fromDate = "";
    dashboardFilters.toDate = "";
  }
  renderDashboardTimeControls();
  renderDashboard();
}

function onDashboardDateChange() {
  if (dashboardFilters.timePreset !== "custom") {
    return;
  }
  dashboardFilters.fromDate = elements.dashboardFromDate?.value || "";
  dashboardFilters.toDate = elements.dashboardToDate?.value || "";
}

function applyDashboardCustomRange() {
  if (dashboardFilters.timePreset !== "custom") {
    return;
  }
  dashboardFilters.fromDate = elements.dashboardFromDate?.value || "";
  dashboardFilters.toDate = elements.dashboardToDate?.value || "";

  const from = parseDate(dashboardFilters.fromDate);
  const to = parseDate(dashboardFilters.toDate);
  if (from && to && startOfDay(from) > startOfDay(to)) {
    window.alert("From date cannot be after To date.");
    return;
  }

  renderDashboard();
}

function onProjectSave(event) {
  event.preventDefault();

  const rawStage = String(elements.projectStage?.value || "").trim();
  if (!rawStage) {
    window.alert("Please select project stage.");
    return;
  }
  const selectedStage = normalizeProjectStage(rawStage);
  const selectedWorkType = normalizeProjectWorkType(getProjectWorkTypeFromStage(selectedStage));

  const formData = {
    id: elements.projectId.value || createId(),
    name: elements.projectName.value.trim(),
    studio: elements.projectStudio.value.trim(),
    qaStudio: (elements.projectQaStudio?.value || "").trim(),
    stage: selectedStage,
    workType: selectedWorkType,
    updatedAt: new Date().toISOString()
  };

  if (!formData.name || !formData.studio || !formData.stage || !formData.workType) {
    window.alert("Please complete required project fields.");
    return;
  }

  const existingIndex = state.projects.findIndex((project) => project.id === formData.id);

  if (existingIndex >= 0) {
    const createdAt = state.projects[existingIndex].createdAt;
    state.projects[existingIndex] = { ...state.projects[existingIndex], ...formData, createdAt };
  } else {
    state.projects.push({ ...formData, createdAt: new Date().toISOString() });
  }

  persistAndRefresh();
  resetProjectForm();
  setFormPanelOpen("project", false);
}

function resetProjectForm() {
  elements.projectForm.reset();
  elements.projectId.value = "";
  if (elements.projectStage) {
    elements.projectStage.value = "creation";
  }
}

function onProjectTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const projectId = button.dataset.id;

  if (button.dataset.action === "history") {
    openProjectHistoryModal(projectId);
    return;
  }

  if (button.dataset.action === "edit") {
    const project = state.projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    elements.projectId.value = project.id;
    elements.projectName.value = project.name;
    elements.projectStudio.value = project.studio;
    if (elements.projectQaStudio) {
      elements.projectQaStudio.value = project.qaStudio || "";
    }
    if (elements.projectStage) {
      elements.projectStage.value = normalizeProjectStage(project.stage, project.workType);
    }
    setFormPanelOpen("project", true);
    setActiveTab("projects");
  }

  if (button.dataset.action === "delete") {
    const hasSubmissions = state.submissions.some((submission) => submission.projectId === projectId);
    const warning = hasSubmissions
      ? "This project has submissions. Deleting it will delete linked submissions. Continue?"
      : "Delete this project?";

    if (!window.confirm(warning)) {
      return;
    }

    state.projects = state.projects.filter((project) => project.id !== projectId);
    state.submissions = state.submissions.filter((submission) => submission.projectId !== projectId);
    persistAndRefresh();
  }
}

function renderProjectsTable() {
  if (!state.projects.length) {
    elements.projectsTableBody.innerHTML = '<tr><td colspan="6">No projects yet.</td></tr>';
    return;
  }

  const sorted = state.projects.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  elements.projectsTableBody.innerHTML = sorted
    .map((project) => `
      <tr>
        <td><button class="table-link-btn" data-action="history" data-id="${project.id}" type="button">${escapeHtml(project.name)}</button></td>
        <td>${escapeHtml(project.studio)}</td>
        <td>${escapeHtml(project.qaStudio || "-")}</td>
        <td>${escapeHtml(getProjectStageLabel(project.stage))}</td>
        <td>${normalizeProjectWorkType(project.workType) === "creation" ? "Creation" : "Update"}</td>
        <td>
          <button class="btn-ghost" data-action="history" data-id="${project.id}" type="button">History</button>
          <button class="btn-ghost" data-action="edit" data-id="${project.id}" type="button">Edit</button>
          <button class="btn-danger" data-action="delete" data-id="${project.id}" type="button">Delete</button>
        </td>
      </tr>
    `)
    .join("");
}

function onSubmissionSave(event) {
  event.preventDefault();

  if (!state.projects.length) {
    window.alert("Create at least one project before adding submissions.");
    return;
  }

  const mainSubmissionDate = elements.submissionMainDate?.value || "";
  const mainReleaseDate = elements.submissionMainReleaseDate?.value || "";
  const platformEntries = collectPlatformEntries({
    submissionDate: mainSubmissionDate,
    releaseDate: mainReleaseDate
  });
  if (!platformEntries.length) {
    window.alert("Add at least one platform entry.");
    return;
  }

  const status = elements.submissionStatus.value;
  const isHotfix = Boolean(elements.submissionIsHotfix.checked);
  let hotfixReason = elements.submissionHotfixReason.value.trim();
  let hotfixLabel = elements.submissionHotfixLabel.value;
  let failedReason = elements.submissionFailedReason.value.trim();
  let failedLabel = elements.submissionFailedLabel.value;

  if (isHotfix) {
    if (!hotfixReason) {
      window.alert("Hotfix submission requires hotfix reason.");
      return;
    }
    if (!isQaDecision(hotfixLabel)) {
      window.alert("Hotfix submission requires QA decision: QA or NotQA.");
      return;
    }
    if (isFailedStatus(status)) {
      if (!failedReason) {
        window.alert("Failed hotfix submission requires fail reason.");
        return;
      }
      if (!isQaDecision(failedLabel)) {
        window.alert("Failed hotfix submission requires QA decision for fail reason: QA or NotQA.");
        return;
      }
    } else {
      failedReason = "";
      failedLabel = "none";
    }
  } else {
    hotfixReason = "";
    hotfixLabel = "none";
    if (isFailedStatus(status)) {
      if (!failedReason) {
        window.alert("Failed submission requires fail reason.");
        return;
      }
      if (!isQaDecision(failedLabel)) {
        window.alert("Failed submission requires QA decision: QA or NotQA.");
        return;
      }
    } else {
      failedReason = "";
      failedLabel = "none";
    }
  }

  const data = {
    id: elements.submissionId.value || createId(),
    projectId: elements.submissionProject.value,
    name: elements.submissionName.value.trim(),
    status,
    submissionDate: mainSubmissionDate,
    releaseDate: mainReleaseDate,
    isHotfix,
    hotfixReason,
    hotfixLabel,
    failedReason,
    failedLabel,
    platformEntries,
    updatedAt: new Date().toISOString()
  };

  if (!data.projectId || !data.name) {
    window.alert("Please select a project and name the submission.");
    return;
  }

  const index = state.submissions.findIndex((item) => item.id === data.id);
  if (index >= 0) {
    const createdAt = state.submissions[index].createdAt;
    state.submissions[index] = { ...state.submissions[index], ...data, createdAt };
  } else {
    state.submissions.push({ ...data, createdAt: new Date().toISOString() });
  }

  persistAndRefresh();
  resetSubmissionForm();
  setFormPanelOpen("submission", false);
}

function collectPlatformEntries(defaults = {}) {
  const rows = [...elements.platformEntries.querySelectorAll(".platform-row")];
  const entries = [];
  const defaultSubmissionDate = defaults.submissionDate || "";
  const defaultReleaseDate = defaults.releaseDate || "";

  rows.forEach((row) => {
    const platformId = row.querySelector(".entry-platform").value;
    const version = row.querySelector(".entry-version").value.trim();
    const submissionDateRaw = row.querySelector(".entry-sub-date").value;
    const releaseDateRaw = row.querySelector(".entry-rel-date").value;
    const submissionDate = submissionDateRaw || defaultSubmissionDate;
    const releaseDate = releaseDateRaw || defaultReleaseDate;
    const status = row.querySelector(".entry-status").value;

    if (!platformId || !version) {
      return;
    }

    entries.push({
      id: row.dataset.entryId || createId(),
      platformId,
      version,
      submissionDate,
      releaseDate,
      status
    });
  });

  return entries;
}

function addPlatformEntryRow(entry) {
  const fragment = elements.platformRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".platform-row");

  if (entry && entry.id) {
    row.dataset.entryId = entry.id;
  }

  const platformSelect = row.querySelector(".entry-platform");
  platformSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Platform";
  platformSelect.appendChild(defaultOption);

  state.platformCatalog
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((platform) => {
      const option = document.createElement("option");
      option.value = platform.id;
      option.textContent = `${getPlatformIcon(platform)} ${platform.name}`;
      platformSelect.appendChild(option);
    });

  const statusSelect = row.querySelector(".entry-status");
  statusSelect.innerHTML = "";
  getSortedStatuses().forEach((status) => {
    const option = document.createElement("option");
    option.value = status.id;
    option.textContent = status.name;
    statusSelect.appendChild(option);
  });

  if (entry) {
    platformSelect.value = entry.platformId || "";
    row.querySelector(".entry-version").value = entry.version || "";
    row.querySelector(".entry-sub-date").value = entry.submissionDate || elements.submissionMainDate?.value || "";
    row.querySelector(".entry-rel-date").value = entry.releaseDate || elements.submissionMainReleaseDate?.value || "";
    statusSelect.value = getStatusIds().includes(entry.status) ? entry.status : getDefaultStatusId();
  } else {
    row.querySelector(".entry-sub-date").value = elements.submissionMainDate?.value || "";
    row.querySelector(".entry-rel-date").value = elements.submissionMainReleaseDate?.value || "";
    statusSelect.value = elements.submissionStatus.value || getDefaultStatusId();
  }

  elements.platformEntries.appendChild(fragment);
}

function syncMainDatesToEmptyPlatformRows() {
  const mainSubmissionDate = elements.submissionMainDate?.value || "";
  const mainReleaseDate = elements.submissionMainReleaseDate?.value || "";
  const rows = [...elements.platformEntries.querySelectorAll(".platform-row")];
  rows.forEach((row) => {
    const submissionDateInput = row.querySelector(".entry-sub-date");
    const releaseDateInput = row.querySelector(".entry-rel-date");
    if (submissionDateInput && !submissionDateInput.value && mainSubmissionDate) {
      submissionDateInput.value = mainSubmissionDate;
    }
    if (releaseDateInput && !releaseDateInput.value && mainReleaseDate) {
      releaseDateInput.value = mainReleaseDate;
    }
  });
}

function resetSubmissionForm() {
  elements.submissionForm.reset();
  elements.submissionId.value = "";
  elements.submissionIsHotfix.checked = false;
  elements.submissionFailedLabel.value = "none";
  elements.submissionHotfixLabel.value = "none";
  elements.submissionStatus.value = getDefaultStatusId();
  if (elements.submissionMainDate) {
    elements.submissionMainDate.value = "";
  }
  if (elements.submissionMainReleaseDate) {
    elements.submissionMainReleaseDate.value = "";
  }
  elements.platformEntries.innerHTML = "";
  addPlatformEntryRow();
  toggleFailedFields();
}

function toggleFailedFields() {
  const isHotfix = Boolean(elements.submissionIsHotfix.checked);
  const isFailed = isFailedStatus(elements.submissionStatus.value);

  if (elements.submissionHotfixReasonField) {
    elements.submissionHotfixReasonField.classList.toggle("hidden", !isHotfix);
  }
  if (elements.submissionHotfixLabelField) {
    elements.submissionHotfixLabelField.classList.toggle("hidden", !isHotfix);
  }

  const showFailedFields = isFailed;
  elements.failedReasonField.classList.toggle("hidden", !showFailedFields);
  elements.failedLabelField.classList.toggle("hidden", !showFailedFields);

  if (!isHotfix) {
    elements.submissionHotfixReason.value = "";
    elements.submissionHotfixLabel.value = "none";
  }

  if (!showFailedFields) {
    elements.submissionFailedReason.value = "";
    elements.submissionFailedLabel.value = "none";
  }
}

function onSubmissionTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const submissionId = button.dataset.id;
  const submission = state.submissions.find((item) => item.id === submissionId);

  if (!submission) {
    return;
  }

  if (button.dataset.action === "edit") {
    openSubmissionEditor(submissionId);
  }

  if (button.dataset.action === "delete") {
    if (!window.confirm("Delete this submission?")) {
      return;
    }

    state.submissions = state.submissions.filter((item) => item.id !== submissionId);
    persistAndRefresh();
  }
}

function openSubmissionEditor(submissionId) {
  const submission = state.submissions.find((item) => item.id === submissionId);
  if (!submission) {
    return;
  }

  elements.submissionId.value = submission.id;
  elements.submissionProject.value = submission.projectId;
  elements.submissionName.value = submission.name;
  elements.submissionStatus.value = getStatusIds().includes(submission.status)
    ? submission.status
    : getDefaultStatusId();
  if (elements.submissionMainDate) {
    elements.submissionMainDate.value = submission.submissionDate
      || (submission.platformEntries || [])[0]?.submissionDate
      || "";
  }
  if (elements.submissionMainReleaseDate) {
    elements.submissionMainReleaseDate.value = submission.releaseDate
      || (submission.platformEntries || [])[0]?.releaseDate
      || "";
  }
  elements.submissionIsHotfix.checked = Boolean(submission.isHotfix);
  elements.submissionHotfixReason.value = submission.hotfixReason || "";
  elements.submissionHotfixLabel.value = submission.hotfixLabel || "none";
  elements.submissionFailedReason.value = submission.failedReason || "";
  elements.submissionFailedLabel.value = submission.failedLabel || "none";
  elements.platformEntries.innerHTML = "";

  (submission.platformEntries || []).forEach((entry) => addPlatformEntryRow(entry));
  if (!(submission.platformEntries || []).length) {
    addPlatformEntryRow();
  }

  toggleFailedFields();
  setFormPanelOpen("submission", true);
  setActiveTab("submissions");
}

function renderSubmissionsTable() {
  if (!state.submissions.length) {
    elements.submissionsTableBody.innerHTML = '<tr><td colspan="8">No submissions yet.</td></tr>';
    return;
  }

  const projectMap = new Map(state.projects.map((project) => [project.id, project]));

  const sorted = state.submissions.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  elements.submissionsTableBody.innerHTML = sorted
    .map((submission) => {
      const project = projectMap.get(submission.projectId);
      const platforms = (submission.platformEntries || [])
        .map((entry) => renderPlatformChipById(entry.platformId, true))
        .join(" ");

      const label = getSubmissionQaLabel(submission);
      const reason = getSubmissionReason(submission);
      const labelTooltip = buildSubmissionQaTooltip(submission);

      return `
        <tr>
          <td><div class="submission-name-cell">${escapeHtml(submission.name)} ${renderHotfixChip(Boolean(submission.isHotfix))}</div></td>
          <td>${escapeHtml(project ? project.name : "Deleted Project")}</td>
          <td>${renderStatusChip(submission.status)}</td>
          <td><div class="stacked-labels">${platforms || "-"}</div></td>
          <td>${renderLabelChip(label, labelTooltip)}</td>
          <td>${reason ? escapeHtml(reason) : ""}</td>
          <td>${formatDateTime(submission.updatedAt)}</td>
          <td>
            <button class="btn-ghost" data-action="edit" data-id="${submission.id}" type="button">Edit</button>
            <button class="btn-danger" data-action="delete" data-id="${submission.id}" type="button">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function onPlatformSave(event) {
  event.preventDefault();

  const id = elements.platformId.value || createId();
  const rawName = elements.platformName.value.trim();
  const name = normalizePlatformCatalogName(rawName);
  const icon = (elements.platformIcon?.value || "").trim();
  const color = normalizeHexColor(elements.platformColor?.value, getDefaultPlatformMeta(name).color);
  if (!name) {
    return;
  }

  const normalized = name.toLowerCase();
  const duplicate = state.platformCatalog.find(
    (platform) => platform.name.toLowerCase() === normalized && platform.id !== id
  );

  if (duplicate) {
    window.alert("Platform name already exists.");
    return;
  }

  const index = state.platformCatalog.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.platformCatalog[index] = {
      ...state.platformCatalog[index],
      name,
      icon: icon || state.platformCatalog[index].icon || getDefaultPlatformMeta(name).icon,
      color: color || state.platformCatalog[index].color || getDefaultPlatformMeta(name).color
    };
  } else {
    const fallback = getDefaultPlatformMeta(name);
    state.platformCatalog.push({
      id,
      name,
      icon: icon || fallback.icon,
      color: color || fallback.color
    });
  }

  persistAndRefresh();
  resetPlatformForm();
  setFormPanelOpen("platform", false);
}

function resetPlatformForm() {
  elements.platformForm.reset();
  elements.platformId.value = "";
  if (elements.platformColor) {
    elements.platformColor.value = "#0f766e";
  }
}

function onPlatformTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const platformId = button.dataset.id;

  if (button.dataset.action === "edit") {
    const platform = state.platformCatalog.find((item) => item.id === platformId);
    if (!platform) {
      return;
    }

    elements.platformId.value = platform.id;
    elements.platformName.value = platform.name;
    if (elements.platformIcon) {
      elements.platformIcon.value = platform.icon || "";
    }
    if (elements.platformColor) {
      elements.platformColor.value = normalizeHexColor(platform.color, "#0f766e");
    }
    setFormPanelOpen("platform", true);
    setActiveTab("platforms");
  }

  if (button.dataset.action === "delete") {
    const usageCount = countPlatformUsage(platformId);
    if (usageCount > 0) {
      window.alert("Platform is used in submissions and cannot be deleted yet.");
      return;
    }

    if (!window.confirm("Delete this platform?")) {
      return;
    }

    state.platformCatalog = state.platformCatalog.filter((item) => item.id !== platformId);
    persistAndRefresh();
  }
}

function renderPlatformsTable() {
  if (!state.platformCatalog.length) {
    elements.platformsTableBody.innerHTML = '<tr><td colspan="3">No platforms yet.</td></tr>';
    return;
  }

  const sorted = state.platformCatalog.slice().sort((a, b) => a.name.localeCompare(b.name));

  elements.platformsTableBody.innerHTML = sorted
    .map((platform) => {
      const usage = countPlatformUsage(platform.id);
      return `
        <tr>
          <td>${renderPlatformChip(platform)}</td>
          <td>${usage}</td>
          <td>
            <button class="btn-ghost" data-action="edit" data-id="${platform.id}" type="button">Edit</button>
            <button class="btn-danger" data-action="delete" data-id="${platform.id}" type="button">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function countPlatformUsage(platformId) {
  let count = 0;
  state.submissions.forEach((submission) => {
    count += (submission.platformEntries || []).filter((entry) => entry.platformId === platformId).length;
  });
  return count;
}

function onStatusSave(event) {
  event.preventDefault();

  const existingId = elements.statusId?.value || "";
  const name = (elements.statusName?.value || "").trim();
  const color = normalizeHexColor(elements.statusColor?.value, "#2563eb");
  if (!name) {
    return;
  }

  const duplicate = state.statusCatalog.find(
    (status) => status.name.toLowerCase() === name.toLowerCase() && status.id !== existingId
  );
  if (duplicate) {
    window.alert("Status name already exists.");
    return;
  }

  if (existingId) {
    const index = state.statusCatalog.findIndex((status) => status.id === existingId);
    if (index >= 0) {
      state.statusCatalog[index] = {
        ...state.statusCatalog[index],
        name,
        color
      };
    }
  } else {
    const id = buildUniqueStatusId(normalizeStatusId(name));
    state.statusCatalog.push({
      id,
      name,
      color,
      core: CORE_STATUS_IDS.has(id)
    });
    dashboardFilters.statuses.add(id);
    knownStatusIds.add(id);
  }

  persistAndRefresh();
  resetStatusForm();
  setFormPanelOpen("status", false);
}

function resetStatusForm() {
  if (!elements.statusForm) {
    return;
  }
  elements.statusForm.reset();
  elements.statusId.value = "";
  if (elements.statusColor) {
    elements.statusColor.value = "#2563eb";
  }
}

function onStatusTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const statusId = button.dataset.id;
  const status = getStatusById(statusId);
  if (!status) {
    return;
  }

  if (button.dataset.action === "edit") {
    elements.statusId.value = status.id;
    elements.statusName.value = status.name;
    elements.statusColor.value = normalizeHexColor(status.color, "#2563eb");
    setFormPanelOpen("status", true);
    setActiveTab("settings");
  }

  if (button.dataset.action === "delete") {
    if (status.core || CORE_STATUS_IDS.has(status.id)) {
      window.alert("Core statuses cannot be deleted.");
      return;
    }

    const usageCount = countStatusUsage(status.id);
    if (usageCount > 0) {
      window.alert("Status is used in submissions and cannot be deleted yet.");
      return;
    }

    if (!window.confirm("Delete this status?")) {
      return;
    }

    state.statusCatalog = state.statusCatalog.filter((entry) => entry.id !== status.id);
    dashboardFilters.statuses.delete(status.id);
    knownStatusIds.delete(status.id);
    persistAndRefresh();
  }
}

function renderStatusesTable() {
  if (!elements.statusesTableBody) {
    return;
  }

  if (!state.statusCatalog.length) {
    elements.statusesTableBody.innerHTML = '<tr><td colspan="3">No statuses yet.</td></tr>';
    return;
  }

  elements.statusesTableBody.innerHTML = getSortedStatuses()
    .map((status) => {
      const usage = countStatusUsage(status.id);
      return `
        <tr>
          <td>${renderStatusChip(status.id)} ${status.core ? '<span class="none-chip">Core</span>' : ""}</td>
          <td>${usage}</td>
          <td>
            <button class="btn-ghost" data-action="edit" data-id="${status.id}" type="button">Edit</button>
            ${status.core ? "" : `<button class="btn-danger" data-action="delete" data-id="${status.id}" type="button">Delete</button>`}
          </td>
        </tr>
      `;
    })
    .join("");
}

function countStatusUsage(statusId) {
  let count = 0;
  state.submissions.forEach((submission) => {
    if (normalizeStatusId(submission.status) === statusId) {
      count += 1;
    }
    count += (submission.platformEntries || []).filter((entry) => normalizeStatusId(entry.status) === statusId).length;
  });
  return count;
}

function buildUniqueStatusId(baseId) {
  const seed = baseId || `status_${Date.now()}`;
  if (!state.statusCatalog.some((status) => status.id === seed)) {
    return seed;
  }
  let idx = 2;
  while (state.statusCatalog.some((status) => status.id === `${seed}_${idx}`)) {
    idx += 1;
  }
  return `${seed}_${idx}`;
}

function renderDashboard() {
  renderDashboardFilterSummary();
  updateStatsScopeLabel();
  const items = getTimelineItems();
  const scopedItems = items.filter((item) => {
    const platformPass = dashboardFilters.platformIds.has(item.platformId);
    const statusPass = dashboardFilters.statuses.has(item.status);
    const workTypePass = dashboardFilters.workTypes.has(item.projectWorkType);
    return platformPass && statusPass && workTypePass;
  });
  const filteredItems = scopedItems.filter((item) => matchTimeFilter(item));
  const timelineItems = applyTimelineQuickPreset(filteredItems);

  renderStats(filteredItems);
  renderTimeline(timelineItems);
  hydratePlatformBrandIcons();
}

function updateStatsScopeLabel() {
  if (!elements.statsScopeLabel) {
    return;
  }
  const preset = dashboardFilters.timePreset || "all";
  if (preset === "this_month") {
    elements.statsScopeLabel.textContent = "Current scope: this month submissions overview.";
    return;
  }
  if (preset === "last_30_days") {
    elements.statsScopeLabel.textContent = "Current scope: last 30 days submissions overview.";
    return;
  }
  if (preset === "custom") {
    elements.statsScopeLabel.textContent = "Current scope: custom date range submissions overview.";
    return;
  }
  elements.statsScopeLabel.textContent = "Current scope: all time submissions overview.";
}

function matchTimeFilter(item) {
  const preset = dashboardFilters.timePreset || "all";
  if (preset === "all") {
    return true;
  }

  const now = startOfDay(new Date());
  let rangeStart = null;
  let rangeEnd = null;

  if (preset === "this_month") {
    rangeStart = startOfMonth(now);
    rangeEnd = addMonths(rangeStart, 1);
  }

  if (preset === "last_30_days") {
    rangeStart = addDays(now, -30);
    rangeEnd = addDays(now, 1);
  }

  if (preset === "custom") {
    const from = parseDate(dashboardFilters.fromDate);
    const to = parseDate(dashboardFilters.toDate);
    if (!from && !to) {
      return true;
    }
    if (from && to) {
      const fromDay = startOfDay(from);
      const toDay = startOfDay(to);
      if (fromDay <= toDay) {
        rangeStart = fromDay;
        rangeEnd = addDays(toDay, 1);
      } else {
        rangeStart = toDay;
        rangeEnd = addDays(fromDay, 1);
      }
    } else {
      rangeStart = from ? startOfDay(from) : null;
      rangeEnd = to ? addDays(startOfDay(to), 1) : null;
    }
  }

  const itemStart = startOfDay(item.start);
  const itemEndExclusive = addDays(startOfDay(item.end), 1);

  if (rangeStart && itemEndExclusive <= rangeStart) {
    return false;
  }
  if (rangeEnd && itemStart >= rangeEnd) {
    return false;
  }
  return true;
}

function applyTimelineQuickPreset(items) {
  const preset = timelineQuickPreset || "all_time";
  if (preset === "all_time") {
    return items.slice();
  }

  const { rangeStart, rangeEndExclusive } = getTimelineQuickPresetRange(preset);
  if (!rangeStart || !rangeEndExclusive) {
    return items.slice();
  }

  return items.filter((item) => {
    const itemStart = startOfDay(item.start);
    const itemEndExclusive = addDays(startOfDay(item.end), 1);
    if (itemEndExclusive <= rangeStart) {
      return false;
    }
    if (itemStart >= rangeEndExclusive) {
      return false;
    }
    return true;
  });
}

function getTimelineQuickPresetRange(preset) {
  const now = startOfDay(new Date());
  if (preset === "current_month") {
    const rangeStart = startOfMonth(now);
    return { rangeStart, rangeEndExclusive: addMonths(rangeStart, 1) };
  }
  if (preset === "last_month") {
    const rangeEndExclusive = startOfMonth(now);
    return { rangeStart: addMonths(rangeEndExclusive, -1), rangeEndExclusive };
  }
  return { rangeStart: null, rangeEndExclusive: null };
}

function getTimelineItems() {
  const projectMap = new Map(state.projects.map((project) => [project.id, project]));
  const platformMap = new Map(state.platformCatalog.map((platform) => [platform.id, platform]));

  const items = [];

  state.submissions.forEach((submission) => {
    const project = projectMap.get(submission.projectId);
    const projectName = project?.name || "Deleted Project";

    (submission.platformEntries || []).forEach((entry) => {
      const start = parseDate(entry.submissionDate) || parseDate(toDateOnly(submission.createdAt)) || new Date();
      const fallbackEnd = entry.releaseDate || project?.releaseDate || project?.deadline || entry.submissionDate;
      const end = parseDate(fallbackEnd) || new Date(start);
      const status = normalizeStatusId(entry.status || submission.status || getDefaultStatusId());
      const label = isFailedStatus(status)
        ? submission.failedLabel || "none"
        : submission.isHotfix
          ? submission.hotfixLabel || "none"
          : "none";

      items.push({
        submissionId: submission.id,
        entryId: entry.id,
        submissionName: submission.name,
        isHotfix: Boolean(submission.isHotfix),
        projectName,
        projectWorkType: normalizeProjectWorkType(project?.workType || "update"),
        platformName: platformMap.get(entry.platformId)?.name || "Unknown",
        platformId: entry.platformId,
        version: entry.version,
        status,
        qaLabel: label,
        hotfixLabel: submission.hotfixLabel || "none",
        failedLabel: submission.failedLabel || "none",
        start,
        end,
        submissionDate: entry.submissionDate,
        releaseDate: entry.releaseDate,
        failedReason: submission.failedReason,
        hotfixReason: submission.hotfixReason
      });
    });
  });

  return items.sort((a, b) => a.start - b.start);
}

function renderStats(items) {
  const totalStoreReleases = items.length;
  const successfulItems = items.filter((item) => isDoneStatus(item.status));
  const successful = successfulItems.length;
  const resolvedItems = items.filter((item) => isDoneStatus(item.status) || isFailedStatus(item.status));
  const resolvedTotal = resolvedItems.length;
  const passRate = resolvedTotal ? Math.round((successful / resolvedTotal) * 100) : 0;
  const passRateTone = getPassRateTone(passRate, resolvedTotal);
  const failedQaItems = items.filter((item) => isFailedStatus(item.status) && item.qaLabel === "QA");
  const failedNonQaItems = items.filter((item) => isFailedStatus(item.status) && item.qaLabel === "NotQA");
  const failedQa = failedQaItems.length;
  const failedNonQa = failedNonQaItems.length;
  const inProgressItems = items.filter((item) => normalizeStatusId(item.status) === "in_progress");
  const inProgress = inProgressItems.length;
  const failedQaTooltip = buildFailedStatsTooltip(failedQaItems);
  const failedNonQaTooltip = buildFailedStatsTooltip(failedNonQaItems);

  statsDetailContext = {
    pass_rate: { label: "Pass Rate (Resolved: Passed + Failed)", items: resolvedItems },
    total: { label: "Total Store Releases", items: items.slice() },
    passed: { label: "Passed Store Releases", items: successfulItems },
    failed_qa: { label: "Failed QA", items: failedQaItems },
    failed_nonqa: { label: "Failed Non-QA", items: failedNonQaItems },
    in_progress: { label: "In Progress", items: inProgressItems }
  };

  const stats = [
    {
      key: "pass_rate",
      label: "Pass Rate",
      value: `${passRate}%`,
      tone: passRateTone,
      tooltip: resolvedTotal ? `${successful}/${resolvedTotal} passed from resolved store releases` : ""
    },
    { key: "total", label: "Total Store Releases", value: totalStoreReleases, tone: "neutral", tooltip: buildFailedStatsTooltip(items) },
    { key: "passed", label: "Passed Store Releases", value: successful, tone: "success", tooltip: buildFailedStatsTooltip(successfulItems) },
    { key: "failed_qa", label: "Failed QA", value: failedQa, tone: "danger", tooltip: failedQaTooltip },
    { key: "failed_nonqa", label: "Failed Non-QA", value: failedNonQa, tone: "warning", tooltip: failedNonQaTooltip },
    { key: "in_progress", label: "In Progress", value: inProgress, tone: "info", tooltip: buildFailedStatsTooltip(inProgressItems) }
  ];

  elements.statsGrid.innerHTML = stats
    .map(
      (stat) => `
      <article class="stat-card stat-${stat.tone}" data-stat-key="${stat.key}" ${stat.tooltip ? `title="${escapeHtml(stat.tooltip)}"` : ""}>
        <span>${stat.label}</span>
        <strong>${stat.value}</strong>
      </article>
    `
    )
    .join("");
}

function getPassRateTone(passRate, total) {
  if (!total) {
    return "neutral";
  }
  if (passRate >= 85) {
    return "success";
  }
  if (passRate >= 60) {
    return "warning";
  }
  return "danger";
}

function renderTimeline(items) {
  const submissionCount = new Set(items.map((item) => item.submissionId)).size;
  elements.timelineCount.textContent = `${submissionCount} submission${submissionCount === 1 ? "" : "s"} · ${items.length} store release${
    items.length === 1 ? "" : "s"
  }`;

  if (!items.length) {
    elements.timelineEmpty.classList.remove("hidden");
    if (elements.calendarGridHeader) {
      elements.calendarGridHeader.innerHTML = "";
    }
    elements.timelineList.innerHTML = "";
    if (elements.timelineRangeLabel) {
      elements.timelineRangeLabel.textContent = "No submission records in current filters.";
    }
    timelineRenderContext = null;
    return;
  }

  elements.timelineEmpty.classList.add("hidden");

  timelineRenderContext = timelineQuickPreset === "all_time"
    ? buildAllTimeCalendarContext(items)
    : buildCalendarContext(timelineScale, timelineAnchorDate);
  const { units, windowStart, windowEndExclusive, labelWidth, totalMs } = timelineRenderContext;

  if (elements.timelineRangeLabel) {
    elements.timelineRangeLabel.textContent = `${formatDate(toInputDate(windowStart))} - ${formatDate(
      toInputDate(addDays(windowEndExclusive, -1))
    )}`;
  }

  if (elements.calendarGridHeader) {
    elements.calendarGridHeader.style.gridTemplateColumns = `${labelWidth}px repeat(${units.length}, minmax(0, 1fr))`;
    elements.calendarGridHeader.innerHTML = `
      <div class="calendar-header-cell">Submission</div>
      ${units
        .map(
          (unit) =>
            `<div class="calendar-header-cell ${unit.isToday ? "today" : ""}">${escapeHtml(unit.label)}</div>`
        )
        .join("")}
    `;
  }

  const windowStartMs = windowStart.getTime();
  const windowEndMs = windowEndExclusive.getTime();
  const today = new Date();
  const todayMs = today.getTime();
  const showToday = todayMs >= windowStartMs && todayMs < windowEndMs;
  const todayLeft = showToday ? ((todayMs - windowStartMs) / totalMs) * 100 : 0;
  const minWidthPercentByScale = {
    day: 8.5,
    week: 12,
    month: 20
  };
  const minWidthPercent = minWidthPercentByScale[timelineScale] || 8.5;
  const rows = buildTimelineRows(items, windowStartMs, windowEndMs, totalMs, minWidthPercent);

  if (!rows.length) {
    elements.timelineEmpty.classList.remove("hidden");
    elements.timelineList.innerHTML = "";
    if (elements.timelineRangeLabel) {
      elements.timelineRangeLabel.textContent = "No submission records in current filters.";
    }
    return;
  }

  elements.timelineList.innerHTML = rows
    .map((row) => {
      const rowQaItem = {
        submissionName: row.submissionName,
        status: row.rowStatus,
        isHotfix: row.isHotfix,
        qaLabel: row.qaLabel,
        failedReason: row.failedReason,
        hotfixReason: row.hotfixReason
      };

      return `
        <article class="calendar-row" style="grid-template-columns:${labelWidth}px minmax(0, 1fr);">
          <div class="calendar-row-label">
            <div class="calendar-row-title">
              ${escapeHtml(row.projectName)}
              <button class="label-edit-btn" type="button" data-action="timeline-view" data-submission-id="${row.submissionId}" data-entry-id="${
        row.entries[0]?.entryId || ""
      }">View</button>
            </div>
            <div class="calendar-row-submission" title="${escapeHtml(row.submissionName)}">${escapeHtml(row.submissionName)}</div>
            <div class="calendar-row-meta">
              ${row.platformIds.map((platformId) => renderPlatformChipById(platformId, true)).join(" ")}
              ${renderStatusChip(row.rowStatus)}
              ${renderLabelChip(row.qaLabel, buildTimelineQaTooltip(rowQaItem))}
              ${renderHotfixChip(row.isHotfix)}
              <span class="none-chip">${row.projectWorkType === "creation" ? "Creation" : "Update"}</span>
            </div>
          </div>
          <div class="calendar-row-track" style="min-height:${Math.max(70, row.trackHeight)}px;">
            <div class="calendar-track-grid" style="grid-template-columns:repeat(${units.length}, 1fr);">
              ${units.map(() => '<div class="calendar-track-cell"></div>').join("")}
            </div>
            ${showToday ? `<div class="today-line" style="left:${todayLeft}%;"></div>` : ""}
            ${row.entries
              .map((entry) => {
                const entryStatus = getStatusById(entry.status);
                const statusColor = getStatusDisplayColor(entry.status, entryStatus?.color);
                const textColor = getContrastTextColor(statusColor);
                const title = `${entry.submissionName} · ${entry.platformName}\nSubmission: ${formatDate(entry.submissionDate)}\nRelease: ${formatDate(
                  entry.releaseDate
                )}`;
                return `
                  <div
                    class="timeline-block"
                    data-submission-id="${entry.submissionId}"
                    data-entry-id="${entry.entryId}"
                    title="${escapeHtml(title)}"
                    style="left:${entry.left}%;width:${entry.width}%;top:${entry.top}px;background:${statusColor};color:${textColor};">
                    ${renderPlatformIconById(entry.platformId, "timeline-platform-icon")}
                    <span class="timeline-block-text">${escapeHtml(entry.platformName)} · v${escapeHtml(entry.version || "-")}</span>
                    <button class="timeline-edit-btn" type="button" data-action="timeline-view" data-submission-id="${entry.submissionId}" data-entry-id="${
                  entry.entryId
                }">View</button>
                  </div>
                `;
              })
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function buildTimelineRows(items, windowStartMs, windowEndMs, totalMs, minWidthPercent = 8.5) {
  const laneTopStart = 10;
  const laneStep = 60;
  const grouped = new Map();
  items.forEach((item) => {
    if (!grouped.has(item.submissionId)) {
      grouped.set(item.submissionId, {
        submissionId: item.submissionId,
        submissionName: item.submissionName,
        projectName: item.projectName,
        projectWorkType: item.projectWorkType,
        isHotfix: Boolean(item.isHotfix),
        qaLabel: item.qaLabel,
        failedReason: item.failedReason || "",
        hotfixReason: item.hotfixReason || "",
        entries: []
      });
    }
    const row = grouped.get(item.submissionId);
    row.entries.push(item);
    row.isHotfix = row.isHotfix || Boolean(item.isHotfix);
    if (!row.failedReason && item.failedReason) {
      row.failedReason = item.failedReason;
    }
    if (!row.hotfixReason && item.hotfixReason) {
      row.hotfixReason = item.hotfixReason;
    }
    if (!isQaDecision(row.qaLabel) && isQaDecision(item.qaLabel)) {
      row.qaLabel = item.qaLabel;
    }
  });

  const rows = [];
  grouped.forEach((row) => {
    const visibleEntries = row.entries
      .map((entry) => {
        const itemStartMs = entry.start.getTime();
        const itemEndExclusiveMs = addDays(entry.end, 1).getTime();
        if (itemEndExclusiveMs <= windowStartMs || itemStartMs >= windowEndMs) {
          return null;
        }

        const clampedStart = Math.max(itemStartMs, windowStartMs);
        const clampedEnd = Math.min(itemEndExclusiveMs, windowEndMs);
        const left = ((clampedStart - windowStartMs) / totalMs) * 100;
        const naturalWidth = ((clampedEnd - clampedStart) / totalMs) * 100;
        const preferredWidth = Math.max(naturalWidth, minWidthPercent);
        const widthCapped = Math.min(preferredWidth, 100);
        const leftAdjusted = Math.max(0, Math.min(left, 100 - widthCapped));
        const visualStart = windowStartMs + (leftAdjusted / 100) * totalMs;
        const visualEnd = Math.min(windowEndMs, visualStart + (widthCapped / 100) * totalMs);
        return {
          ...entry,
          clampedStart,
          clampedEnd,
          left: leftAdjusted,
          naturalWidth,
          width: widthCapped,
          visualStart,
          visualEnd,
          top: 12
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.clampedStart - b.clampedStart || a.clampedEnd - b.clampedEnd);

    if (!visibleEntries.length) {
      return;
    }

    const laneEnds = [];
    visibleEntries.forEach((entry) => {
      let lane = 0;
      while (lane < laneEnds.length && entry.visualStart < laneEnds[lane]) {
        lane += 1;
      }
      if (lane === laneEnds.length) {
        laneEnds.push(entry.visualEnd);
      } else {
        laneEnds[lane] = entry.visualEnd;
      }
      entry.top = laneTopStart + lane * laneStep;
    });

    const platformIds = [...new Set(visibleEntries.map((entry) => entry.platformId))];
    const rowStatus = getDominantStatus(visibleEntries.map((entry) => entry.status));

    rows.push({
      ...row,
      platformIds,
      entries: visibleEntries,
      rowStatus,
      trackHeight: laneTopStart + laneEnds.length * laneStep + 18
    });
  });

  return rows.sort((a, b) => {
    const aStart = a.entries[0]?.start?.getTime() || 0;
    const bStart = b.entries[0]?.start?.getTime() || 0;
    if (aStart !== bStart) {
      return aStart - bStart;
    }
    return a.submissionName.localeCompare(b.submissionName);
  });
}

function getDominantStatus(statusIds) {
  const normalized = statusIds.map((statusId) => normalizeStatusId(statusId)).filter(Boolean);
  if (!normalized.length) {
    return getDefaultStatusId();
  }
  if (normalized.every((statusId) => statusId === normalized[0])) {
    return normalized[0];
  }

  const priority = ["failed", "in_progress", "to_do", "new", "done"];
  for (const statusId of priority) {
    if (normalized.includes(statusId)) {
      return statusId;
    }
  }
  return normalized[0];
}

function renderTimelineQuickPresetToggles() {
  if (!elements.timelineQuickPresetToggles) {
    return;
  }
  const presets = [
    { id: "current_month", label: "Current Month" },
    { id: "last_month", label: "Last Month" },
    { id: "all_time", label: "All Time" }
  ];
  elements.timelineQuickPresetToggles.innerHTML = presets
    .map((preset) => {
      const active = preset.id === timelineQuickPreset;
      return `
        <button class="toggle-btn ${active ? "active" : "inactive"}" type="button" data-timeline-preset="${preset.id}">
          ${preset.label}
        </button>
      `;
    })
    .join("");
}

function onTimelineQuickPresetClick(event) {
  const button = event.target.closest("button[data-timeline-preset]");
  if (!button) {
    return;
  }
  const preset = button.dataset.timelinePreset;
  if (!preset || preset === timelineQuickPreset) {
    return;
  }

  timelineQuickPreset = preset;
  if (preset === "current_month") {
    timelineAnchorDate = startOfDay(new Date());
  } else if (preset === "last_month") {
    timelineAnchorDate = startOfMonth(addMonths(new Date(), -1));
  } else {
    timelineAnchorDate = startOfDay(new Date());
  }

  syncDashboardTimeFilterWithTimelinePreset(preset);
  renderTimelineQuickPresetToggles();
  renderDashboard();
}

function syncDashboardTimeFilterWithTimelinePreset(preset) {
  if (preset === "current_month") {
    dashboardFilters.timePreset = "this_month";
    dashboardFilters.fromDate = "";
    dashboardFilters.toDate = "";
  } else if (preset === "last_month") {
    const now = startOfDay(new Date());
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = addMonths(currentMonthStart, -1);
    const lastMonthEnd = addDays(currentMonthStart, -1);
    dashboardFilters.timePreset = "custom";
    dashboardFilters.fromDate = toInputDate(lastMonthStart);
    dashboardFilters.toDate = toInputDate(lastMonthEnd);
  } else {
    dashboardFilters.timePreset = "all";
    dashboardFilters.fromDate = "";
    dashboardFilters.toDate = "";
  }

  renderDashboardTimeControls();
}

function renderTimelineScaleToggles() {
  if (!elements.timelineScaleToggles) {
    return;
  }
  elements.timelineScaleToggles.innerHTML = Object.entries(TIMELINE_SCALES)
    .map(([scale, config]) => {
      const active = scale === timelineScale;
      return `
        <button class="toggle-btn ${active ? "active" : "inactive"}" type="button" data-scale="${scale}">
          ${config.label}
        </button>
      `;
    })
    .join("");
}

function onTimelineScaleToggleClick(event) {
  const button = event.target.closest("button[data-scale]");
  if (!button) {
    return;
  }
  const nextScale = button.dataset.scale;
  if (!TIMELINE_SCALES[nextScale]) {
    return;
  }
  timelineScale = nextScale;
  renderTimelineScaleToggles();
  renderDashboard();
}

function shiftTimelineWindow(direction) {
  const config = TIMELINE_SCALES[timelineScale];
  timelineAnchorDate = addDays(timelineAnchorDate, direction * config.navDays);
  renderDashboard();
}

function resetTimelineToToday() {
  timelineAnchorDate = startOfDay(new Date());
  renderDashboard();
}

function buildCalendarContext(scale, anchorDate) {
  const config = TIMELINE_SCALES[scale];
  const units = buildCalendarUnits(scale, anchorDate, config.windowUnits);
  const labelWidth = getTimelineLabelWidth();
  const windowStart = units[0].start;
  const windowEndExclusive = units[units.length - 1].end;
  const totalMs = Math.max(windowEndExclusive.getTime() - windowStart.getTime(), 24 * 60 * 60 * 1000);

  return {
    scale,
    units,
    labelWidth,
    windowStart,
    windowEndExclusive,
    totalMs,
    stepDays: config.stepDays
  };
}

function buildAllTimeCalendarContext(items) {
  const labelWidth = getTimelineLabelWidth();
  if (!items.length) {
    return buildCalendarContext("month", startOfDay(new Date()));
  }

  let minStart = startOfDay(items[0].start);
  let maxEndExclusive = addDays(startOfDay(items[0].end), 1);
  items.forEach((item) => {
    const itemStart = startOfDay(item.start);
    const itemEndExclusive = addDays(startOfDay(item.end), 1);
    if (itemStart < minStart) {
      minStart = itemStart;
    }
    if (itemEndExclusive > maxEndExclusive) {
      maxEndExclusive = itemEndExclusive;
    }
  });

  const windowStart = startOfMonth(minStart);
  const lastVisibleDay = addDays(maxEndExclusive, -1);
  let windowEndExclusive = addMonths(startOfMonth(lastVisibleDay), 1);
  if (windowEndExclusive <= windowStart) {
    windowEndExclusive = addMonths(windowStart, 1);
  }

  const units = [];
  const today = new Date();
  let cursor = new Date(windowStart);
  let guard = 0;
  while (cursor < windowEndExclusive && guard < 96) {
    const unitStart = new Date(cursor);
    const unitEnd = addMonths(unitStart, 1);
    units.push({
      start: unitStart,
      end: unitEnd,
      label: unitStart.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      isToday: isDateInRange(today, unitStart, unitEnd)
    });
    cursor = unitEnd;
    guard += 1;
  }

  const safeUnits = units.length
    ? units
    : [
        {
          start: windowStart,
          end: addMonths(windowStart, 1),
          label: windowStart.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
          isToday: true
        }
      ];
  const safeWindowEnd = safeUnits[safeUnits.length - 1].end;
  const totalMs = Math.max(safeWindowEnd.getTime() - windowStart.getTime(), 24 * 60 * 60 * 1000);

  return {
    scale: "month",
    units: safeUnits,
    labelWidth,
    windowStart,
    windowEndExclusive: safeWindowEnd,
    totalMs,
    stepDays: 30
  };
}

function getTimelineLabelWidth() {
  const width = window.innerWidth || 1280;
  if (width <= 640) {
    return 168;
  }
  if (width <= 980) {
    return 196;
  }
  if (width <= 1280) {
    return 228;
  }
  return 260;
}

function buildCalendarUnits(scale, anchorDate, count) {
  const today = new Date();
  const units = [];

  if (scale === "day") {
    const anchor = startOfDay(anchorDate);
    const start = addDays(anchor, -Math.floor(count / 2));
    for (let i = 0; i < count; i += 1) {
      const unitStart = addDays(start, i);
      const unitEnd = addDays(unitStart, 1);
      units.push({
        start: unitStart,
        end: unitEnd,
        label: unitStart.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
        isToday: isSameDay(unitStart, today)
      });
    }
    return units;
  }

  if (scale === "week") {
    const anchor = startOfWeek(anchorDate);
    const start = addDays(anchor, -Math.floor(count / 2) * 7);
    for (let i = 0; i < count; i += 1) {
      const unitStart = addDays(start, i * 7);
      const unitEnd = addDays(unitStart, 7);
      units.push({
        start: unitStart,
        end: unitEnd,
        label: `W${String(getIsoWeekNumber(unitStart)).padStart(2, "0")} ${unitStart.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}`,
        isToday: isDateInRange(today, unitStart, unitEnd)
      });
    }
    return units;
  }

  const anchor = startOfMonth(anchorDate);
  const start = addMonths(anchor, -Math.floor(count / 2));
  for (let i = 0; i < count; i += 1) {
    const unitStart = addMonths(start, i);
    const unitEnd = addMonths(unitStart, 1);
    units.push({
      start: unitStart,
      end: unitEnd,
      label: unitStart.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      isToday: isDateInRange(today, unitStart, unitEnd)
    });
  }
  return units;
}

function onTimelineClick(event) {
  if (Date.now() < timelineSuppressClickUntil) {
    return;
  }
  const actionButton = event.target.closest("button[data-action='timeline-view']");
  if (actionButton) {
    const submissionId = actionButton.dataset.submissionId;
    const entryId = actionButton.dataset.entryId || "";
    if (submissionId) {
      openSubmissionDetailModal(submissionId, entryId);
    }
    return;
  }

  const block = event.target.closest(".timeline-block");
  if (!block) {
    return;
  }
  const submissionId = block.dataset.submissionId;
  const entryId = block.dataset.entryId || "";
  if (submissionId) {
    openSubmissionDetailModal(submissionId, entryId);
  }
}

function onTimelinePointerDown(event) {
  if (event.button !== 0 || !timelineRenderContext) {
    return;
  }
  if (event.target.closest("button[data-action='timeline-view']")) {
    return;
  }
  const block = event.target.closest(".timeline-block");
  if (!block) {
    return;
  }
  const track = block.closest(".calendar-row-track");
  if (!track) {
    return;
  }
  const trackWidth = track.getBoundingClientRect().width;
  if (!trackWidth) {
    return;
  }
  timelineDragState = {
    block,
    submissionId: block.dataset.submissionId,
    entryId: block.dataset.entryId,
    startX: event.clientX,
    pixelsPerDay: trackWidth / ((timelineRenderContext.windowEndExclusive.getTime() - timelineRenderContext.windowStart.getTime()) / (24 * 60 * 60 * 1000)),
    stepDays: timelineRenderContext.stepDays,
    deltaDays: 0
  };
  block.classList.add("dragging");
  event.preventDefault();
}

function onTimelinePointerMove(event) {
  if (!timelineDragState) {
    return;
  }
  const dx = event.clientX - timelineDragState.startX;
  const rawDays = dx / timelineDragState.pixelsPerDay;
  const snappedDays = Math.round(rawDays / timelineDragState.stepDays) * timelineDragState.stepDays;
  if (snappedDays === timelineDragState.deltaDays) {
    return;
  }
  timelineDragState.deltaDays = snappedDays;
  timelineDragState.block.style.transform = `translateX(${snappedDays * timelineDragState.pixelsPerDay}px)`;
}

function onTimelinePointerUp() {
  if (!timelineDragState) {
    return;
  }
  const movedDays = timelineDragState.deltaDays;
  const submissionId = timelineDragState.submissionId;
  const entryId = timelineDragState.entryId;
  timelineDragState.block.classList.remove("dragging");
  timelineDragState.block.style.transform = "";
  timelineDragState = null;

  if (!movedDays) {
    return;
  }

  timelineSuppressClickUntil = Date.now() + 200;
  shiftSubmissionEntryDates(submissionId, entryId, movedDays);
}

function shiftSubmissionEntryDates(submissionId, entryId, deltaDays) {
  const submission = state.submissions.find((item) => item.id === submissionId);
  if (!submission) {
    return;
  }
  const entry = (submission.platformEntries || []).find((item) => item.id === entryId);
  if (!entry) {
    return;
  }

  const startDate = parseDate(entry.submissionDate)
    || parseDate(toDateOnly(submission.createdAt))
    || startOfDay(new Date());
  entry.submissionDate = toInputDate(addDays(startDate, deltaDays));

  if (entry.releaseDate) {
    const releaseDate = parseDate(entry.releaseDate) || startDate;
    entry.releaseDate = toInputDate(addDays(releaseDate, deltaDays));
  }

  submission.updatedAt = new Date().toISOString();
  persistAndRefresh();
}

function renderPlatformChart(items) {
  if (!items.length) {
    elements.platformChart.innerHTML = '<div class="empty-state">No platform data for current filters.</div>';
    return;
  }

  const byPlatform = new Map();
  items.forEach((item) => {
    const current = byPlatform.get(item.platformId) || 0;
    byPlatform.set(item.platformId, current + 1);
  });

  const rows = [...byPlatform.entries()].sort((a, b) => b[1] - a[1]);
  const max = rows[0][1] || 1;
  const total = items.length || 1;

  elements.platformChart.innerHTML = rows
    .map(([platformId, count]) => {
      const width = (count / max) * 100;
      const pct = Math.round((count / total) * 100);
      return `
        <div class="chart-row">
          <span>${renderPlatformChipById(platformId, true)}</span>
          <div class="chart-track"><div class="chart-bar" style="width:${width}%;"></div></div>
          <strong title="${count} of ${total} store releases">${count} (${pct}%)</strong>
        </div>
      `;
    })
    .join("");
}

function renderPerformanceReporting() {
  if (!elements.performancePassRateTrend) {
    return;
  }

  const reportData = collectPerformanceReportData(performanceScope);
  const scopePlural = reportData.scopePlural;
  const scopePluralLower = scopePlural.toLowerCase();
  const scopeSingularLower = reportData.scopeSingular.toLowerCase();

  if (elements.performanceHotfixTitle) {
    elements.performanceHotfixTitle.textContent = `${scopePlural} With Most Hotfixes`;
  }
  if (elements.performanceOutcomeTitle) {
    elements.performanceOutcomeTitle.textContent = `${scopePlural} by Outcomes`;
  }
  if (elements.performancePassedTitle) {
    elements.performancePassedTitle.textContent = `Most Passed ${scopePlural}`;
  }
  if (elements.performanceFailedTitle) {
    elements.performanceFailedTitle.textContent = `Most Failed ${scopePlural}`;
  }
  if (elements.performanceFailureTitle) {
    elements.performanceFailureTitle.textContent = `Failure Reasons by ${scopeSingularLower}`;
  }

  renderPerformancePassRateTrend(reportData.monthlyTrend);
  renderPerformanceRankList(
    elements.performanceHotfixProjects,
    reportData.topHotfixProjects,
    `No hotfix ${scopePluralLower} in this window.`
  );
  renderPerformanceRankList(
    elements.performanceTopPassedProjects,
    reportData.topPassedProjects,
    `No passed ${scopePluralLower} in this window.`
  );
  renderPerformanceRankList(
    elements.performanceTopFailedProjects,
    reportData.topFailedProjects,
    `No failed ${scopePluralLower} in this window.`,
    true
  );
  renderPerformanceFailureReasons(reportData.failureReasons);

  if (elements.performanceReportMeta) {
    elements.performanceReportMeta.textContent = `Window: ${reportData.windowLabel} · Grouped by ${scopeSingularLower} · ${reportData.totalStoreReleases} store releases · ${reportData.resolvedReleases} resolved`;
  }
}

function collectPerformanceReportData(scope = "project") {
  const items = getTimelineItems();
  const { rangeStart, rangeEndExclusive, windowLabel } = getPerformanceTimeRange();
  const scopeConfig = getPerformanceScopeConfig(scope);
  const scopedItems = items.filter((item) => {
    const date = getItemSubmissionDate(item);
    if (!date) {
      return false;
    }
    if (rangeStart && date < rangeStart) {
      return false;
    }
    if (rangeEndExclusive && date >= rangeEndExclusive) {
      return false;
    }
    return true;
  });

  const monthBuckets = buildPerformanceMonthBuckets(rangeStart, rangeEndExclusive, scopedItems);
  const trendByMonth = new Map(
    monthBuckets.map((bucket) => [
      bucket.key,
      {
        ...bucket,
        done: 0,
        failed: 0,
        resolved: 0,
        passRate: 0
      }
    ])
  );

  const hotfixByScope = new Map();
  const passedByScope = new Map();
  const failedByScope = new Map();
  const reasonsMap = new Map();

  scopedItems.forEach((item) => {
    const date = getItemSubmissionDate(item);
    if (!date) {
      return;
    }

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthEntry = trendByMonth.get(monthKey);
    if (monthEntry) {
      if (isDoneStatus(item.status)) {
        monthEntry.done += 1;
      }
      if (isFailedStatus(item.status)) {
        monthEntry.failed += 1;
      }
    }

    const scopeLabel = scopeConfig.labelFromItem(item);

    if (item.isHotfix) {
      if (!hotfixByScope.has(scopeLabel)) {
        hotfixByScope.set(scopeLabel, new Set());
      }
      hotfixByScope.get(scopeLabel).add(item.submissionId);
    }

    if (isDoneStatus(item.status)) {
      passedByScope.set(scopeLabel, (passedByScope.get(scopeLabel) || 0) + 1);
    }
    if (isFailedStatus(item.status)) {
      failedByScope.set(scopeLabel, (failedByScope.get(scopeLabel) || 0) + 1);
      const reasonText = getCombinedReasonText(item) || "Fail reason not provided";
      if (!reasonsMap.has(reasonText)) {
        reasonsMap.set(reasonText, {
          count: 0,
          subjects: new Set()
        });
      }
      const reasonEntry = reasonsMap.get(reasonText);
      reasonEntry.count += 1;
      reasonEntry.subjects.add(scopeLabel);
    }
  });

  const monthlyTrend = [...trendByMonth.values()].map((entry) => {
    const resolved = entry.done + entry.failed;
    const passRate = resolved ? Math.round((entry.done / resolved) * 100) : 0;
    return {
      ...entry,
      resolved,
      passRate
    };
  });

  const topHotfixProjects = [...hotfixByScope.entries()]
    .map(([subject, submissionIds]) => ({
      label: subject,
      value: submissionIds.size,
      meta: `${submissionIds.size} hotfix ${submissionIds.size === 1 ? "submission" : "submissions"}`
    }))
    .sort((a, b) => b.value - a.value);

  const topPassedProjects = [...passedByScope.entries()]
    .map(([subject, count]) => ({
      label: subject,
      value: count,
      meta: `${count} passed store ${count === 1 ? "release" : "releases"}`
    }))
    .sort((a, b) => b.value - a.value);

  const topFailedProjects = [...failedByScope.entries()]
    .map(([subject, count]) => ({
      label: subject,
      value: count,
      meta: `${count} failed store ${count === 1 ? "release" : "releases"}`
    }))
    .sort((a, b) => b.value - a.value);

  const failureReasons = [...reasonsMap.entries()]
    .map(([reason, value]) => ({
      reason,
      count: value.count,
      subjects: [...value.subjects].sort((a, b) => a.localeCompare(b)).slice(0, 3)
    }))
    .sort((a, b) => b.count - a.count);

  const resolvedReleases = scopedItems.filter((item) => isDoneStatus(item.status) || isFailedStatus(item.status)).length;

  return {
    scope: scopeConfig.id,
    scopeSingular: scopeConfig.singular,
    scopePlural: scopeConfig.plural,
    windowLabel,
    totalStoreReleases: scopedItems.length,
    resolvedReleases,
    monthlyTrend,
    topHotfixProjects,
    topPassedProjects,
    topFailedProjects,
    failureReasons
  };
}

function getPerformanceScopeConfig(scope = "project") {
  if (scope === "platform") {
    return {
      id: "platform",
      singular: "Platform",
      plural: "Platforms",
      labelFromItem: (item) => item?.platformName || "Unknown Platform"
    };
  }
  return {
    id: "project",
    singular: "Project",
    plural: "Projects",
    labelFromItem: (item) => item?.projectName || "Unknown Project"
  };
}

function getPerformanceTimeRange() {
  const selection = elements.performanceTimeRange?.value || "6";
  const today = startOfDay(new Date());
  const rangeEndExclusive = addDays(today, 1);

  if (selection === "all") {
    return {
      rangeStart: null,
      rangeEndExclusive,
      windowLabel: "All time"
    };
  }

  const months = Number.parseInt(selection, 10);
  const safeMonths = Number.isFinite(months) && months > 0 ? months : 6;
  const rangeStart = addMonths(startOfMonth(today), -(safeMonths - 1));
  return {
    rangeStart,
    rangeEndExclusive,
    windowLabel: `Last ${safeMonths} months`
  };
}

function getItemSubmissionDate(item) {
  const date = parseDate(item?.submissionDate) || item?.start || null;
  return date ? startOfDay(date) : null;
}

function buildPerformanceMonthBuckets(rangeStart, rangeEndExclusive, items) {
  const today = startOfDay(new Date());
  const defaultEnd = startOfMonth(today);

  let start = rangeStart ? startOfMonth(rangeStart) : null;
  let end = rangeEndExclusive ? addMonths(startOfMonth(addDays(rangeEndExclusive, -1)), 1) : addMonths(defaultEnd, 1);

  if (!start) {
    const oldestDate = items
      .map((item) => getItemSubmissionDate(item))
      .filter(Boolean)
      .sort((a, b) => a - b)[0];
    start = oldestDate ? startOfMonth(oldestDate) : defaultEnd;
  }

  if (start >= end) {
    end = addMonths(start, 1);
  }

  const buckets = [];
  let cursor = new Date(start);
  while (cursor < end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: cursor.toLocaleDateString(undefined, { month: "short", year: "numeric" })
    });
    cursor = addMonths(cursor, 1);
  }
  return buckets;
}

function renderPerformancePassRateTrend(rows) {
  if (!elements.performancePassRateTrend) {
    return;
  }
  if (!rows.length) {
    elements.performancePassRateTrend.innerHTML = '<div class="empty-state">No pass-rate data available.</div>';
    return;
  }

  elements.performancePassRateTrend.innerHTML = rows
    .map((row) => {
      const valueText = row.resolved ? `${row.passRate}% (${row.done}/${row.resolved})` : "-";
      const tone = row.resolved && row.passRate < 60 ? "fail" : "";
      return `
        <div class="performance-row ${tone}">
          <span class="label">${escapeHtml(row.label)}</span>
          <div class="performance-bar">
            <div class="performance-bar-fill" style="width:${Math.max(0, Math.min(100, row.passRate))}%;"></div>
          </div>
          <span class="value" title="Passed ${row.done} of ${row.resolved} resolved">${escapeHtml(valueText)}</span>
        </div>
      `;
    })
    .join("");
}

function renderPerformanceRankList(target, rows, emptyMessage, isFailureTone = false) {
  if (!target) {
    return;
  }
  if (!rows.length) {
    target.innerHTML = `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
    return;
  }
  const max = rows[0]?.value || 1;
  target.innerHTML = rows
    .slice(0, 8)
    .map((row) => {
      const width = max ? Math.max(8, (row.value / max) * 100) : 0;
      const tone = isFailureTone ? "fail" : "";
      return `
        <div class="performance-row ${tone}" title="${escapeHtml(row.meta || "")}">
          <span class="label">${escapeHtml(row.label)}</span>
          <div class="performance-bar">
            <div class="performance-bar-fill" style="width:${width}%;"></div>
          </div>
          <span class="value">${row.value}</span>
        </div>
      `;
    })
    .join("");
}

function renderPerformanceFailureReasons(rows) {
  if (!elements.performanceFailureReasons) {
    return;
  }
  if (!rows.length) {
    elements.performanceFailureReasons.innerHTML = '<div class="empty-state">No failures in this time window.</div>';
    return;
  }

  elements.performanceFailureReasons.innerHTML = rows
    .slice(0, 12)
    .map((row) => {
      const subjectList = row.subjects.length ? ` · ${row.subjects.join(", ")}` : "";
      return `
        <div class="performance-reason-row">
          <div class="performance-reason-text">${escapeHtml(row.reason)}${escapeHtml(subjectList)}</div>
          <div class="performance-reason-meta">${row.count}x</div>
        </div>
      `;
    })
    .join("");
}

function generatePerformanceReport() {
  if (!elements.performanceReportOutput) {
    return;
  }
  const data = collectPerformanceReportData(performanceScope);
  const doneCount = data.topPassedProjects.reduce((sum, row) => sum + row.value, 0);
  const failedCount = data.topFailedProjects.reduce((sum, row) => sum + row.value, 0);
  const resolved = doneCount + failedCount;
  const globalPassRate = resolved ? Math.round((doneCount / resolved) * 100) : 0;
  const nowLabel = new Date().toLocaleString();
  const scopePluralLower = data.scopePlural.toLowerCase();
  const scopeSingularLower = data.scopeSingular.toLowerCase();

  const lines = [
    `QA Release Flow - Performance Report`,
    `Generated: ${nowLabel}`,
    `Time Window: ${data.windowLabel}`,
    `Grouping: ${scopeSingularLower}`,
    "",
    `Summary`,
    `- Total store releases: ${data.totalStoreReleases}`,
    `- Resolved (Passed + Failed): ${resolved}`,
    `- Passed: ${doneCount}`,
    `- Failed: ${failedCount}`,
    `- Global pass rate: ${globalPassRate}%`,
    "",
    `Monthly pass rate trend`
  ];

  data.monthlyTrend.forEach((row) => {
    const text = row.resolved ? `${row.passRate}% (${row.done}/${row.resolved})` : "no resolved releases";
    lines.push(`- ${row.label}: ${text}`);
  });

  lines.push("", `Top hotfix ${scopePluralLower}`);
  if (data.topHotfixProjects.length) {
    data.topHotfixProjects.slice(0, 8).forEach((row) => lines.push(`- ${row.label}: ${row.value}`));
  } else {
    lines.push("- None");
  }

  lines.push("", `Top passed ${scopePluralLower}`);
  if (data.topPassedProjects.length) {
    data.topPassedProjects.slice(0, 8).forEach((row) => lines.push(`- ${row.label}: ${row.value}`));
  } else {
    lines.push("- None");
  }

  lines.push("", `Top failed ${scopePluralLower}`);
  if (data.topFailedProjects.length) {
    data.topFailedProjects.slice(0, 8).forEach((row) => lines.push(`- ${row.label}: ${row.value}`));
  } else {
    lines.push("- None");
  }

  lines.push("", `Failure reasons by ${scopeSingularLower}`);
  if (data.failureReasons.length) {
    data.failureReasons.slice(0, 12).forEach((row) => {
      const subjects = row.subjects.length ? ` [${row.subjects.join(", ")}]` : "";
      lines.push(`- ${row.reason}: ${row.count}${subjects}`);
    });
  } else {
    lines.push("- None");
  }

  elements.performanceReportOutput.value = lines.join("\n");
  if (elements.performanceReportMeta) {
    elements.performanceReportMeta.textContent = `Report generated at ${nowLabel}`;
  }
}

async function copyPerformanceReport() {
  if (!elements.performanceReportOutput) {
    return;
  }
  if (!elements.performanceReportOutput.value.trim()) {
    generatePerformanceReport();
  }
  const text = elements.performanceReportOutput.value.trim();
  if (!text) {
    return;
  }

  let copied = false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (error) {
      copied = false;
    }
  }

  if (!copied) {
    elements.performanceReportOutput.focus();
    elements.performanceReportOutput.select();
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
  }

  if (elements.performanceReportMeta) {
    elements.performanceReportMeta.textContent = copied ? "Report copied to clipboard." : "Could not copy automatically. Copy manually from report box.";
  }
}

function ensureDemoData() {
  if (state.projects.length || state.submissions.length) {
    return;
  }

  seedDemoData();
  saveState();
}

function seedDemoData() {
  const demoPlatformNames = ["Steam", "Epic Store"];
  demoPlatformNames.forEach((name) => {
    const exists = state.platformCatalog.some((platform) => platform.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      const meta = getDefaultPlatformMeta(name);
      state.platformCatalog.push({ id: createId(), name, icon: meta.icon, color: meta.color });
    }
  });

  const platformIdByName = new Map(
    state.platformCatalog.map((platform) => [platform.name.toLowerCase(), platform.id])
  );
  const getPlatformId = (name) =>
    platformIdByName.get(name.toLowerCase()) || state.platformCatalog[0]?.id || "";

  const makeProject = ({
    name,
    studio,
    qaStudio = "",
    stage = "creation",
    workType = ""
  }) => ({
    id: createId(),
    name,
    studio,
    qaStudio,
    stage: normalizeProjectStage(stage, workType),
    workType: normalizeProjectWorkType(workType || getProjectWorkTypeFromStage(stage)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const projects = [
    makeProject({
      name: "Nebula Raiders",
      studio: "NorthForge Studio",
      qaStudio: "HQ QA",
      stage: "submission_ready",
      workType: "creation"
    }),
    makeProject({
      name: "Drift Legends Mobile",
      studio: "Apex Drift Labs",
      qaStudio: "Internal QA",
      stage: "live_ops",
      workType: "update",
    }),
    makeProject({
      name: "Mythic Forge Online",
      studio: "Valiant Byte",
      qaStudio: "Partner QA",
      stage: "production",
      workType: "creation",
    }),
    makeProject({
      name: "Skyline Clash",
      studio: "Urban Arc Games",
      qaStudio: "External QA",
      stage: "maintenance",
      workType: "update",
    }),
    makeProject({
      name: "Pixel Farm World",
      studio: "GreenLoop Interactive",
      qaStudio: "HQ QA",
      stage: "live_ops",
      workType: "update",
    }),
    makeProject({
      name: "Echo Horizon VR",
      studio: "Prism Reactor",
      qaStudio: "Internal QA",
      stage: "qa_validation",
      workType: "creation",
    })
  ];

  const projectIdByName = new Map(projects.map((project) => [project.name, project.id]));
  const nowIso = new Date().toISOString();

  const submissions = [
    {
      id: createId(),
      projectId: projectIdByName.get("Nebula Raiders"),
      name: "Launch Candidate 1.0",
      status: "done",
      isHotfix: false,
      hotfixReason: "",
      hotfixLabel: "none",
      failedReason: "",
      failedLabel: "none",
      platformEntries: [
        {
          id: createId(),
          platformId: getPlatformId("iOS"),
          version: "1.0.0",
          submissionDate: dateFromToday(-56),
          releaseDate: dateFromToday(-48),
          status: "done"
        },
        {
          id: createId(),
          platformId: getPlatformId("Android"),
          version: "1.0.0",
          submissionDate: dateFromToday(-55),
          releaseDate: dateFromToday(-47),
          status: "done"
        },
        {
          id: createId(),
          platformId: getPlatformId("Steam"),
          version: "1.0.0",
          submissionDate: dateFromToday(-54),
          releaseDate: dateFromToday(-45),
          status: "done"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: createId(),
      projectId: projectIdByName.get("Drift Legends Mobile"),
      name: "Season 8 Content Pack",
      status: "in_progress",
      isHotfix: false,
      hotfixReason: "",
      hotfixLabel: "none",
      failedReason: "",
      failedLabel: "none",
      platformEntries: [
        {
          id: createId(),
          platformId: getPlatformId("iOS"),
          version: "2.8.0",
          submissionDate: dateFromToday(-6),
          releaseDate: dateFromToday(6),
          status: "in_progress"
        },
        {
          id: createId(),
          platformId: getPlatformId("Android"),
          version: "2.8.0",
          submissionDate: dateFromToday(-5),
          releaseDate: dateFromToday(7),
          status: "in_progress"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: createId(),
      projectId: projectIdByName.get("Drift Legends Mobile"),
      name: "Hotfix 2.7.4",
      status: "failed",
      isHotfix: true,
      hotfixReason: "Crash after ad reward callback on low-memory devices",
      hotfixLabel: "QA",
      failedReason: "QA found regression on in-app purchase restore flow",
      failedLabel: "QA",
      platformEntries: [
        {
          id: createId(),
          platformId: getPlatformId("iOS"),
          version: "2.7.4",
          submissionDate: dateFromToday(-14),
          releaseDate: dateFromToday(-10),
          status: "failed"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: createId(),
      projectId: projectIdByName.get("Skyline Clash"),
      name: "Crossplay Stability Hotfix",
      status: "in_progress",
      isHotfix: true,
      hotfixReason: "Intermittent lobby disconnect on console cross-region sessions",
      hotfixLabel: "NotQA",
      failedReason: "",
      failedLabel: "none",
      platformEntries: [
        {
          id: createId(),
          platformId: getPlatformId("PlayStation"),
          version: "3.1.2",
          submissionDate: dateFromToday(-2),
          releaseDate: dateFromToday(4),
          status: "in_progress"
        },
        {
          id: createId(),
          platformId: getPlatformId("Xbox"),
          version: "3.1.2",
          submissionDate: dateFromToday(-1),
          releaseDate: dateFromToday(5),
          status: "in_progress"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: createId(),
      projectId: projectIdByName.get("Mythic Forge Online"),
      name: "Expansion Pre-Cert Batch A",
      status: "in_progress",
      isHotfix: false,
      hotfixReason: "",
      hotfixLabel: "none",
      failedReason: "",
      failedLabel: "none",
      platformEntries: [
        {
          id: createId(),
          platformId: getPlatformId("Windows Store"),
          version: "0.9.0-rc1",
          submissionDate: dateFromToday(9),
          releaseDate: dateFromToday(36),
          status: "in_progress"
        },
        {
          id: createId(),
          platformId: getPlatformId("Epic Store"),
          version: "0.9.0-rc1",
          submissionDate: dateFromToday(10),
          releaseDate: dateFromToday(37),
          status: "in_progress"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: createId(),
      projectId: projectIdByName.get("Pixel Farm World"),
      name: "Harvest Festival Update",
      status: "done",
      isHotfix: false,
      hotfixReason: "",
      hotfixLabel: "none",
      failedReason: "",
      failedLabel: "none",
      platformEntries: [
        {
          id: createId(),
          platformId: getPlatformId("Nintendo Switch"),
          version: "5.2.0",
          submissionDate: dateFromToday(-22),
          releaseDate: dateFromToday(-15),
          status: "done"
        },
        {
          id: createId(),
          platformId: getPlatformId("Windows Store"),
          version: "5.2.0",
          submissionDate: dateFromToday(-21),
          releaseDate: dateFromToday(-14),
          status: "done"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: createId(),
      projectId: projectIdByName.get("Echo Horizon VR"),
      name: "Vertical Slice Build Review",
      status: "failed",
      isHotfix: false,
      hotfixReason: "",
      hotfixLabel: "none",
      failedReason: "Build packaging failed due to missing localization assets",
      failedLabel: "NotQA",
      platformEntries: [
        {
          id: createId(),
          platformId: getPlatformId("Windows Store"),
          version: "0.5.2",
          submissionDate: dateFromToday(-8),
          releaseDate: dateFromToday(-6),
          status: "failed"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    }
  ];

  state.projects = projects;
  state.submissions = submissions;
}

function ensureBulkDemoSubmissions(targetCount = 100) {
  if (!state.projects.length) {
    return;
  }

  let hasSeeded = false;
  try {
    hasSeeded = localStorage.getItem(BULK_DEMO_SEED_KEY) === "1";
  } catch (error) {
    hasSeeded = false;
  }
  if (hasSeeded) {
    return;
  }

  const missing = Math.max(0, targetCount - state.submissions.length);
  if (missing > 0) {
    appendFakeSubmissions(missing);
    saveState();
  }

  try {
    localStorage.setItem(BULK_DEMO_SEED_KEY, "1");
  } catch (error) {
    // Ignore localStorage write failures in restricted environments.
  }
}

function appendFakeSubmissions(count) {
  const projectIds = state.projects.map((project) => project.id).filter(Boolean);
  const platformIds = state.platformCatalog.map((platform) => platform.id).filter(Boolean);
  if (!projectIds.length || !platformIds.length || count <= 0) {
    return;
  }

  const statusDone = findStatusIdByPriority(["done"]);
  const statusFailed = findStatusIdByPriority(["failed"]);
  const statusInProgress = findStatusIdByPriority(["in_progress"]);
  const statusTodo = findStatusIdByPriority(["to_do", "new"]);
  const fallbackStatus = getDefaultStatusId();
  const projectHasInProgress = new Set();
  state.submissions.forEach((submission) => {
    if (isSubmissionInProgress(submission)) {
      projectHasInProgress.add(submission.projectId);
    }
  });

  const submissionNameBase = [
    "Certification Batch",
    "Store Package",
    "Release Candidate",
    "Content Drop",
    "LiveOps Update",
    "Maintenance Update"
  ];
  const hotfixReasons = [
    "Critical crash on startup after latest dependencies merge",
    "Store metadata mismatch detected during compliance pass",
    "Save migration conflict reported by players on legacy builds",
    "Matchmaking handshake instability across regions"
  ];
  const failedReasons = [
    "Build failed store validation because of missing entitlement metadata",
    "Regression found in onboarding flow after latest UI merge",
    "Age-rating payload differs from policy requirements",
    "Localization package incomplete for mandatory storefront languages"
  ];

  const existingCount = state.submissions.length;
  for (let index = 0; index < count; index += 1) {
    const sequence = existingCount + index + 1;
    const projectId = randomFrom(projectIds);
    let status = pickFakeStatus(statusDone, statusFailed, statusInProgress, statusTodo, fallbackStatus);
    if (normalizeStatusId(status) === "in_progress" && projectHasInProgress.has(projectId)) {
      status = statusTodo || statusDone || fallbackStatus;
    }
    if (normalizeStatusId(status) === "in_progress") {
      projectHasInProgress.add(projectId);
    }
    const isHotfix = Math.random() < 0.2;
    const hotfixLabel = isHotfix ? randomFrom(["QA", "NotQA"]) : "none";
    const failedSubmission = !isHotfix && isFailedStatus(status);
    const failedLabel = failedSubmission ? randomFrom(["QA", "NotQA"]) : "none";
    const hotfixReason = isHotfix ? `${randomFrom(hotfixReasons)} (#${sequence})` : "";
    const failedReason = failedSubmission ? `${randomFrom(failedReasons)} (#${sequence})` : "";

    const timelinePreset = getFakeTimelinePreset(status);
    const baseSubmissionOffset = randomInt(timelinePreset.submissionMin, timelinePreset.submissionMax);
    const platformCount = Math.min(platformIds.length, randomInt(1, Math.min(3, platformIds.length)));
    const selectedPlatformIds = pickUniqueRandom(platformIds, platformCount);

    const major = randomInt(1, 9);
    const minor = randomInt(0, 12);
    const patch = randomInt(0, 18);
    const version = `${major}.${minor}.${patch}`;
    const name = isHotfix
      ? `Hotfix ${version}`
      : `${randomFrom(submissionNameBase)} ${version}`;

    const platformEntries = selectedPlatformIds.map((platformId, platformIndex) => {
      const jitter = randomInt(0, 4) + platformIndex;
      const submissionOffset = baseSubmissionOffset + jitter;
      const releaseOffset = submissionOffset + randomInt(timelinePreset.releaseGapMin, timelinePreset.releaseGapMax);
      return {
        id: createId(),
        platformId,
        version,
        submissionDate: dateFromToday(submissionOffset),
        releaseDate: dateFromToday(releaseOffset),
        status
      };
    });

    const firstSubmissionDate = platformEntries[0]?.submissionDate || dateFromToday(0);
    const lastReleaseDate = platformEntries[platformEntries.length - 1]?.releaseDate || firstSubmissionDate;
    const createdAt = toIsoAtNoon(firstSubmissionDate);
    const updatedAt = toIsoAtNoon(lastReleaseDate);

    state.submissions.push({
      id: createId(),
      projectId,
      name,
      status,
      isHotfix,
      hotfixReason,
      hotfixLabel,
      failedReason,
      failedLabel,
      platformEntries,
      createdAt,
      updatedAt
    });
  }
}

function normalizeSingleInProgressPerProject() {
  const todoStatusId = findStatusIdByPriority(["to_do", "new"]) || getDefaultStatusId();
  const byProject = new Map();
  let changed = false;

  state.submissions.forEach((submission) => {
    if (!submission?.projectId || !isSubmissionInProgress(submission)) {
      return;
    }
    const list = byProject.get(submission.projectId) || [];
    list.push(submission);
    byProject.set(submission.projectId, list);
  });

  byProject.forEach((submissions) => {
    if (submissions.length <= 1) {
      return;
    }
    const keeper = pickMostRelevantInProgressSubmission(submissions);
    submissions.forEach((submission) => {
      if (submission.id === keeper?.id) {
        return;
      }
      if (downgradeSubmissionInProgressToTodo(submission, todoStatusId)) {
        changed = true;
      }
    });
  });

  return changed;
}

function isSubmissionInProgress(submission) {
  const entries = Array.isArray(submission?.platformEntries) ? submission.platformEntries : [];
  if (!entries.length) {
    return normalizeStatusId(submission?.status) === "in_progress";
  }
  return entries.some((entry) => normalizeStatusId(entry?.status || submission.status) === "in_progress");
}

function pickMostRelevantInProgressSubmission(submissions) {
  const todayMs = startOfDay(new Date()).getTime();
  const ranked = submissions.map((submission) => {
    const window = getSubmissionInProgressWindow(submission);
    const inActiveWindow = todayMs >= window.startMs && todayMs <= window.endMs;
    const distance = Math.abs(todayMs - window.startMs);
    const updatedMs = parseDate(submission.updatedAt)?.getTime() || 0;
    return {
      submission,
      inActiveWindow,
      distance,
      updatedMs
    };
  });

  ranked.sort((a, b) => {
    if (a.inActiveWindow !== b.inActiveWindow) {
      return a.inActiveWindow ? -1 : 1;
    }
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    return b.updatedMs - a.updatedMs;
  });

  return ranked[0]?.submission || submissions[0] || null;
}

function getSubmissionInProgressWindow(submission) {
  const entries = Array.isArray(submission?.platformEntries) ? submission.platformEntries : [];
  const inProgressEntries = entries.filter(
    (entry) => normalizeStatusId(entry?.status || submission.status) === "in_progress"
  );

  if (!inProgressEntries.length) {
    const fallback = parseDate(toDateOnly(submission?.createdAt)) || new Date();
    const startMs = startOfDay(fallback).getTime();
    return { startMs, endMs: startMs };
  }

  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;

  inProgressEntries.forEach((entry) => {
    const start = parseDate(entry.submissionDate)
      || parseDate(toDateOnly(submission.createdAt))
      || new Date();
    const end = parseDate(entry.releaseDate) || start;
    const startMs = startOfDay(start).getTime();
    const endMs = startOfDay(end).getTime();
    if (startMs < minStart) {
      minStart = startMs;
    }
    if (endMs > maxEnd) {
      maxEnd = endMs;
    }
  });

  return {
    startMs: Number.isFinite(minStart) ? minStart : startOfDay(new Date()).getTime(),
    endMs: Number.isFinite(maxEnd) ? maxEnd : startOfDay(new Date()).getTime()
  };
}

function downgradeSubmissionInProgressToTodo(submission, todoStatusId) {
  const entries = Array.isArray(submission?.platformEntries) ? submission.platformEntries : [];
  let changed = false;

  if (!entries.length) {
    if (normalizeStatusId(submission.status) === "in_progress" && submission.status !== todoStatusId) {
      submission.status = todoStatusId;
      changed = true;
    }
  } else {
    entries.forEach((entry) => {
      if (normalizeStatusId(entry?.status || submission.status) === "in_progress" && entry.status !== todoStatusId) {
        entry.status = todoStatusId;
        changed = true;
      }
    });
    const nextStatus = getDominantStatus(entries.map((entry) => entry.status || submission.status));
    if (submission.status !== nextStatus) {
      submission.status = nextStatus;
      changed = true;
    }
  }

  if (changed) {
    submission.updatedAt = new Date().toISOString();
    if (!isFailedStatus(submission.status) && !submission.isHotfix) {
      submission.failedReason = "";
      submission.failedLabel = "none";
    }
  }

  return changed;
}

function normalizeLastMonthSubmissionStatuses() {
  const now = startOfDay(new Date());
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = addMonths(currentMonthStart, -1);
  const statusDone = findStatusIdByPriority(["done"]) || getDefaultStatusId();

  let changed = false;
  state.submissions.forEach((submission) => {
    const entries = Array.isArray(submission.platformEntries) ? submission.platformEntries : [];
    if (!entries.length) {
      return;
    }

    let submissionChanged = false;
    entries.forEach((entry) => {
      const currentStatus = normalizeStatusId(entry.status || submission.status || "");
      if (currentStatus !== "in_progress") {
        return;
      }

      const startDate = parseDate(entry.submissionDate)
        || parseDate(toDateOnly(submission.createdAt))
        || null;
      if (!startDate) {
        return;
      }
      const endDate = parseDate(entry.releaseDate) || startDate;

      const rangeStart = startOfDay(startDate);
      const rangeEndExclusive = addDays(startOfDay(endDate), 1);
      const intersectsLastMonth = rangeStart < currentMonthStart && rangeEndExclusive > lastMonthStart;
      if (!intersectsLastMonth) {
        return;
      }

      entry.status = statusDone;
      submissionChanged = true;
      changed = true;
    });

    if (submissionChanged) {
      submission.status = getDominantStatus(entries.map((entry) => entry.status || submission.status));
      submission.updatedAt = new Date().toISOString();
      if (!isFailedStatus(submission.status) && !submission.isHotfix) {
        submission.failedReason = "";
        submission.failedLabel = "none";
      }
    }
  });

  return changed;
}

function rebalanceTodoBacklogOnce(targetFraction = 0.8) {
  let alreadyRebalanced = false;
  try {
    alreadyRebalanced = localStorage.getItem(TODO_REBALANCE_KEY) === "1";
  } catch (error) {
    alreadyRebalanced = false;
  }
  if (alreadyRebalanced) {
    return false;
  }

  const doneStatusId = findStatusIdByPriority(["done"]) || getDefaultStatusId();
  const today = toInputDate(new Date());
  const todayIso = toIsoAtNoon(today);
  const candidates = [];

  state.submissions.forEach((submission) => {
    const entries = Array.isArray(submission.platformEntries) ? submission.platformEntries : [];
    if (entries.length) {
      entries.forEach((entry) => {
        const statusId = normalizeStatusId(entry.status || submission.status);
        if (statusId !== "to_do" && statusId !== "new") {
          return;
        }
        const sortDate = parseDate(entry.submissionDate)
          || parseDate(entry.releaseDate)
          || parseDate(toDateOnly(submission.createdAt))
          || new Date();
        candidates.push({
          submission,
          entry,
          sortMs: startOfDay(sortDate).getTime()
        });
      });
      return;
    }

    const submissionStatus = normalizeStatusId(submission.status);
    if (submissionStatus === "to_do" || submissionStatus === "new") {
      const sortDate = parseDate(toDateOnly(submission.createdAt)) || new Date();
      candidates.push({
        submission,
        entry: null,
        sortMs: startOfDay(sortDate).getTime()
      });
    }
  });

  if (!candidates.length) {
    try {
      localStorage.setItem(TODO_REBALANCE_KEY, "1");
    } catch (error) {
      // Ignore localStorage write failures in restricted environments.
    }
    return false;
  }

  const safeFraction = Math.max(0, Math.min(1, targetFraction));
  const convertCount = Math.floor(candidates.length * safeFraction);
  if (!convertCount) {
    try {
      localStorage.setItem(TODO_REBALANCE_KEY, "1");
    } catch (error) {
      // Ignore localStorage write failures in restricted environments.
    }
    return false;
  }

  candidates.sort((a, b) => a.sortMs - b.sortMs);
  const touchedSubmissionIds = new Set();
  let changed = false;

  candidates.slice(0, convertCount).forEach((item) => {
    if (item.entry) {
      if (item.entry.status !== doneStatusId) {
        item.entry.status = doneStatusId;
        changed = true;
      }
      if (item.entry.submissionDate !== today) {
        item.entry.submissionDate = today;
        changed = true;
      }
      if (item.entry.releaseDate !== today) {
        item.entry.releaseDate = today;
        changed = true;
      }
    } else if (item.submission.status !== doneStatusId) {
      item.submission.status = doneStatusId;
      changed = true;
    }
    touchedSubmissionIds.add(item.submission.id);
  });

  if (!changed) {
    try {
      localStorage.setItem(TODO_REBALANCE_KEY, "1");
    } catch (error) {
      // Ignore localStorage write failures in restricted environments.
    }
    return false;
  }

  state.submissions.forEach((submission) => {
    if (!touchedSubmissionIds.has(submission.id)) {
      return;
    }
    const entries = Array.isArray(submission.platformEntries) ? submission.platformEntries : [];
    if (entries.length) {
      submission.status = getDominantStatus(entries.map((entry) => entry.status || submission.status));
    }
    if (!isFailedStatus(submission.status)) {
      submission.failedReason = "";
      submission.failedLabel = "none";
    }
    submission.updatedAt = todayIso;
  });

  try {
    localStorage.setItem(TODO_REBALANCE_KEY, "1");
  } catch (error) {
    // Ignore localStorage write failures in restricted environments.
  }

  return true;
}

function pickFakeStatus(doneId, failedId, inProgressId, todoId, fallbackId) {
  const roll = Math.random();
  if (roll < 0.42 && doneId) {
    return doneId;
  }
  if (roll < 0.62 && failedId) {
    return failedId;
  }
  if (roll < 0.9 && inProgressId) {
    return inProgressId;
  }
  if (todoId) {
    return todoId;
  }
  return fallbackId;
}

function getFakeTimelinePreset(statusId) {
  const normalized = normalizeStatusId(statusId);
  if (normalized === "done") {
    return { submissionMin: -180, submissionMax: -20, releaseGapMin: 2, releaseGapMax: 18 };
  }
  if (normalized === "failed") {
    return { submissionMin: -120, submissionMax: 18, releaseGapMin: 1, releaseGapMax: 11 };
  }
  if (normalized === "in_progress") {
    return { submissionMin: 0, submissionMax: 30, releaseGapMin: 8, releaseGapMax: 45 };
  }
  return { submissionMin: 6, submissionMax: 70, releaseGapMin: 14, releaseGapMax: 55 };
}

function persistAndRefresh() {
  saveState();
  renderAll();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  let parsed = null;
  try {
    parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    parsed = null;
  }

  const projects = Array.isArray(parsed?.projects)
    ? parsed.projects
        .filter((project) => project && project.id)
        .map((project) => {
          const normalizedWorkType = normalizeProjectWorkType(project.workType);
          const normalizedStage = normalizeProjectStage(project.stage, normalizedWorkType);
          return {
            ...project,
            name: String(project.name || "").trim(),
            studio: String(project.studio || "").trim(),
            qaStudio: String(project.qaStudio || "").trim(),
            stage: normalizedStage,
            workType: normalizeProjectWorkType(normalizedWorkType || getProjectWorkTypeFromStage(normalizedStage)),
            createdAt: project.createdAt || new Date().toISOString(),
            updatedAt: project.updatedAt || project.createdAt || new Date().toISOString()
          };
        })
        .filter((project) => project.name && project.studio)
    : [];
  const submissions = Array.isArray(parsed?.submissions)
    ? parsed.submissions
        .filter((submission) => submission && submission.id)
        .map((submission) => ({
          ...submission,
          status: normalizeStatusId(submission.status || "in_progress"),
          platformEntries: Array.isArray(submission.platformEntries)
            ? submission.platformEntries.map((entry) => ({
                ...entry,
                status: normalizeStatusId(entry?.status || submission.status || "in_progress")
              }))
            : []
        }))
    : [];

  let platformCatalog = Array.isArray(parsed?.platformCatalog)
    ? parsed.platformCatalog
        .filter((platform) => platform && platform.id && platform.name)
        .map((platform) => {
          const normalizedName = normalizePlatformCatalogName(platform.name);
          const meta = getDefaultPlatformMeta(normalizedName);
          return {
            id: platform.id,
            name: normalizedName,
            icon: normalizePlatformIcon(platform.icon, normalizedName),
            color: normalizeHexColor(platform.color, meta.color)
          };
        })
    : [];

  if (platformCatalog.length) {
    const deduped = [];
    const seen = new Set();
    platformCatalog.forEach((platform) => {
      const key = platform.name.toLowerCase();
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      deduped.push(platform);
    });
    platformCatalog = deduped;
  }

  const existingNames = new Set(platformCatalog.map((platform) => platform.name.toLowerCase()));
  DEFAULT_PLATFORMS.forEach((platform) => {
    if (existingNames.has(platform.name.toLowerCase())) {
      return;
    }
    platformCatalog.push({
      id: createId(),
      name: platform.name,
      icon: platform.icon,
      color: platform.color
    });
    existingNames.add(platform.name.toLowerCase());
  });

  const statusCatalog = normalizeStatusCatalog(parsed?.statusCatalog, submissions);

  submissions.forEach((submission) => {
    if (!statusCatalog.some((status) => status.id === submission.status)) {
      submission.status = getDefaultStatusIdFromCatalog(statusCatalog);
    }
    (submission.platformEntries || []).forEach((entry) => {
      if (!statusCatalog.some((status) => status.id === entry.status)) {
        entry.status = submission.status;
      }
    });
  });

  return { projects, submissions, platformCatalog, statusCatalog };
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isDateInRange(date, start, endExclusive) {
  const time = date.getTime();
  return time >= start.getTime() && time < endExclusive.getTime();
}

function getIsoWeekNumber(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
}

function toDateOnly(value) {
  if (!value) {
    return "";
  }
  return value.split("T")[0];
}

function dateFromToday(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toInputDate(date);
}

function toIsoAtNoon(dateOnly) {
  const date = parseDate(dateOnly) || new Date();
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function randomInt(min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function randomFrom(items) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }
  return items[randomInt(0, items.length - 1)];
}

function pickUniqueRandom(items, count) {
  const pool = Array.isArray(items) ? items.slice() : [];
  const target = Math.max(0, Math.min(count, pool.length));
  const selected = [];
  for (let i = 0; i < target; i += 1) {
    const index = randomInt(0, pool.length - 1);
    selected.push(pool[index]);
    pool.splice(index, 1);
  }
  return selected;
}

function toInputDate(date) {
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return normalized.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = parseDate(value);
  if (!date) {
    return "-";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) {
    return "-";
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderPlatformChipById(platformId, compact = false) {
  const platform = getPlatformById(platformId);
  if (!platform) {
    return `<span class="platform-pill">${renderPlatformIconFallback(PLATFORM_ICONS.generic)} Unknown</span>`;
  }
  return renderPlatformChip(platform, compact);
}

function renderPlatformChip(platform, compact = false) {
  const compactClass = compact ? "compact" : "";
  const color = normalizeHexColor(platform.color, "#0f766e");
  return `<span class="platform-pill ${compactClass}" style="--pill-color:${color};">${renderPlatformIconMarkup(
    platform,
    "platform-brand-icon"
  )} ${escapeHtml(platform.name)}</span>`;
}

function getPlatformById(platformId) {
  return state.platformCatalog.find((platform) => platform.id === platformId) || null;
}

function renderPlatformIconById(platformId, className = "platform-brand-icon") {
  const platform = getPlatformById(platformId);
  if (!platform) {
    return renderPlatformIconFallback(PLATFORM_ICONS.generic, className);
  }
  return renderPlatformIconMarkup(platform, className);
}

function renderPlatformIconMarkup(platform, className = "platform-brand-icon") {
  const brandIconSources = getPlatformBrandIconSources(platform?.name);
  if (brandIconSources.length) {
    const [primary, ...alternatives] = brandIconSources;
    const altSources = alternatives.join("|");
    const fallbackIcon = getPlatformIcon(platform);
    return `<img class="${className}" src="${primary}" alt="${escapeHtml(platform?.name || "Platform")}" loading="lazy" data-platform-brand-icon="1" data-alt-sources="${escapeHtml(
      altSources
    )}" data-fallback-icon="${escapeHtml(fallbackIcon)}" />`;
  }
  return renderPlatformIconFallback(getPlatformIcon(platform), className);
}

function renderPlatformIconFallback(icon, className = "platform-brand-icon") {
  return `<span class="${className} icon-fallback">${escapeHtml(icon || PLATFORM_ICONS.generic)}</span>`;
}

function normalizePlatformCatalogName(name) {
  const raw = String(name || "").trim();
  if (!raw) {
    return "";
  }
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  const aliases = {
    pc: "Windows Store",
    windows: "Windows Store",
    "windows store": "Windows Store",
    "microsoft store": "Windows Store",
    samsung: "Samsung Store",
    "galaxy store": "Samsung Store",
    "samsung store": "Samsung Store",
    netflix: "Netflix",
    "netflix games": "Netflix",
    "apple arcade": "Apple Arcade",
    "epic games store": "Epic Store",
    epic: "Epic Store",
    ios: "iOS"
  };
  return aliases[key] || raw;
}

function getPlatformBrandIconSources(platformName) {
  const key = normalizePlatformCatalogName(platformName).toLowerCase();
  if (key.includes("apple arcade")) {
    return PLATFORM_BRAND_ICON_URLS.apple_arcade;
  }
  if (key.includes("ios") || key.includes("apple")) {
    return PLATFORM_BRAND_ICON_URLS.ios;
  }
  if (key.includes("android")) {
    return PLATFORM_BRAND_ICON_URLS.android;
  }
  if (key.includes("samsung")) {
    return PLATFORM_BRAND_ICON_URLS.samsung_store;
  }
  if (key.includes("playstation") || key.includes("ps")) {
    return PLATFORM_BRAND_ICON_URLS.playstation;
  }
  if (key.includes("xbox")) {
    return PLATFORM_BRAND_ICON_URLS.xbox;
  }
  if (key.includes("switch") || key.includes("nintendo")) {
    return PLATFORM_BRAND_ICON_URLS.nintendo;
  }
  if (key.includes("netflix")) {
    return PLATFORM_BRAND_ICON_URLS.netflix;
  }
  if (key.includes("epic")) {
    return PLATFORM_BRAND_ICON_URLS.epic;
  }
  if (key.includes("steam")) {
    return PLATFORM_BRAND_ICON_URLS.steam;
  }
  if (key.includes("windows")) {
    return PLATFORM_BRAND_ICON_URLS.windows_store;
  }
  return [];
}

function hydratePlatformBrandIcons(root = document) {
  const icons = root.querySelectorAll("img[data-platform-brand-icon]");
  icons.forEach((img) => {
    if (img.dataset.boundErrorHandler === "1") {
      return;
    }
    img.dataset.boundErrorHandler = "1";
    img.addEventListener("error", onPlatformBrandIconError);
    if (img.complete && !img.naturalWidth) {
      onPlatformBrandIconError({ currentTarget: img });
    }
  });
}

function onPlatformBrandIconError(event) {
  const img = event?.currentTarget;
  if (!img) {
    return;
  }

  const alternatives = (img.dataset.altSources || "").split("|").filter(Boolean);
  if (alternatives.length) {
    const [next, ...rest] = alternatives;
    img.dataset.altSources = rest.join("|");
    img.src = next;
    return;
  }

  const fallbackIcon = img.dataset.fallbackIcon || PLATFORM_ICONS.generic;
  const fallback = document.createElement("span");
  fallback.className = `${img.className} icon-fallback`;
  fallback.textContent = fallbackIcon;
  img.replaceWith(fallback);
}

function getPlatformIcon(platform) {
  return normalizePlatformIcon(platform?.icon, platform?.name);
}

function normalizePlatformIcon(iconValue, platformName) {
  const icon = String(iconValue || "").trim();
  if (!icon || looksCorruptedIcon(icon)) {
    return getDefaultPlatformMeta(platformName).icon;
  }
  return icon;
}

function looksCorruptedIcon(value) {
  const hasLatin1Noise = /[\u00C0-\u00FF]/.test(value);
  const hasEmoji = /\p{Extended_Pictographic}/u.test(value);
  return hasLatin1Noise && !hasEmoji;
}

function getDefaultPlatformMeta(name) {
  const key = normalizePlatformCatalogName(name).toLowerCase();
  if (key.includes("apple arcade")) {
    return { icon: PLATFORM_ICONS.apple_arcade, color: "#111827" };
  }
  if (key.includes("ios")) {
    return { icon: PLATFORM_ICONS.ios, color: "#64748b" };
  }
  if (key.includes("android")) {
    return { icon: PLATFORM_ICONS.android, color: "#22c55e" };
  }
  if (key.includes("samsung")) {
    return { icon: PLATFORM_ICONS.samsung_store, color: "#1428a0" };
  }
  if (key.includes("playstation") || key.includes("ps")) {
    return { icon: PLATFORM_ICONS.playstation, color: "#1d4ed8" };
  }
  if (key.includes("xbox")) {
    return { icon: PLATFORM_ICONS.xbox, color: "#16a34a" };
  }
  if (key.includes("netflix")) {
    return { icon: PLATFORM_ICONS.netflix, color: "#e50914" };
  }
  if (key.includes("switch") || key.includes("nintendo")) {
    return { icon: PLATFORM_ICONS.nintendo, color: "#dc2626" };
  }
  if (key.includes("windows")) {
    return { icon: PLATFORM_ICONS.windows_store, color: "#2563eb" };
  }
  if (key.includes("steam")) {
    return { icon: PLATFORM_ICONS.steam, color: "#111827" };
  }
  if (key.includes("epic")) {
    return { icon: PLATFORM_ICONS.epic, color: "#111827" };
  }
  return { icon: PLATFORM_ICONS.generic, color: "#0f766e" };
}

function normalizeHexColor(value, fallback) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const chars = raw.slice(1).split("");
    return `#${chars.map((char) => char + char).join("")}`.toLowerCase();
  }
  return fallback;
}

function hexToRgba(hexColor, alpha) {
  const hex = normalizeHexColor(hexColor, "#0f766e").slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastTextColor(hexColor) {
  const hex = normalizeHexColor(hexColor, "#0f766e").slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#0f172a" : "#ffffff";
}

function normalizeStatusCatalog(rawCatalog, submissions) {
  const catalog = [];
  const seen = new Set();

  if (Array.isArray(rawCatalog)) {
    rawCatalog.forEach((item) => {
      if (!item) {
        return;
      }
      const id = normalizeStatusId(item.id || item.name);
      const name = String(item.name || STATUS_TEXT[id] || humanizeStatusId(id)).trim();
      if (!id || !name || seen.has(id)) {
        return;
      }
      seen.add(id);
      catalog.push({
        id,
        name,
        color: normalizeHexColor(item.color, randomColorFromStatusId(id)),
        core: Boolean(item.core) || CORE_STATUS_IDS.has(id)
      });
    });
  }

  Object.entries(STATUS_TEXT).forEach(([id, name]) => {
    if (!seen.has(id)) {
      seen.add(id);
      catalog.push({
        id,
        name,
        color: randomColorFromStatusId(id),
        core: true
      });
    }
  });

  (submissions || []).forEach((submission) => {
    const ids = [normalizeStatusId(submission.status)];
    (submission.platformEntries || []).forEach((entry) => ids.push(normalizeStatusId(entry.status)));

    ids.forEach((id) => {
      if (!id || seen.has(id)) {
        return;
      }
      seen.add(id);
      catalog.push({
        id,
        name: humanizeStatusId(id),
        color: randomColorFromStatusId(id),
        core: CORE_STATUS_IDS.has(id)
      });
    });
  });

  return catalog;
}

function getStatusIds() {
  return state.statusCatalog.map((status) => status.id);
}

function getSortedStatuses() {
  const order = Object.keys(STATUS_TEXT);
  return state.statusCatalog.slice().sort((a, b) => {
    const aCore = a.core || CORE_STATUS_IDS.has(a.id);
    const bCore = b.core || CORE_STATUS_IDS.has(b.id);
    if (aCore && bCore) {
      return order.indexOf(a.id) - order.indexOf(b.id);
    }
    if (aCore) {
      return -1;
    }
    if (bCore) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function getStatusById(statusId) {
  const id = normalizeStatusId(statusId);
  return state.statusCatalog.find((status) => status.id === id) || null;
}

function getDefaultStatusId() {
  return getDefaultStatusIdFromCatalog(state.statusCatalog);
}

function getDefaultStatusIdFromCatalog(statusCatalog) {
  const preferred = ["in_progress", "to_do", "new", "done", "failed"];
  for (const id of preferred) {
    if (statusCatalog.some((status) => status.id === id)) {
      return id;
    }
  }
  return statusCatalog[0]?.id || "in_progress";
}

function getStatusDisplayColor(statusId, fallbackColor) {
  const id = normalizeStatusId(statusId);
  const mapped = {
    done: "#16a34a",
    in_progress: "#2563eb",
    failed: "#dc2626"
  };
  if (mapped[id]) {
    return mapped[id];
  }
  return normalizeHexColor(fallbackColor, "#64748b");
}

function renderStatusChip(statusId) {
  const status = getStatusById(statusId);
  if (!status) {
    return `<span class="status-chip" style="background:${getStatusDisplayColor(statusId, "#64748b")};">${escapeHtml(humanizeStatusId(statusId))}</span>`;
  }
  const color = getStatusDisplayColor(status.id, status.color);
  return `<span class="status-chip" style="background:${color};">${escapeHtml(status.name)}</span>`;
}

function getSubmissionQaLabel(submission) {
  if (submission.isHotfix) {
    return isQaDecision(submission.hotfixLabel) ? submission.hotfixLabel : "none";
  }
  if (isFailedStatus(submission.status)) {
    return isQaDecision(submission.failedLabel) ? submission.failedLabel : "none";
  }
  return "none";
}

function getReasonParts(item) {
  const parts = [];
  const hotfixReason = String(item?.hotfixReason || "").trim();
  const failReason = String(item?.failedReason || "").trim();
  const statusId = normalizeStatusId(item?.status);

  if (item?.isHotfix && hotfixReason) {
    parts.push(`HF reason: ${hotfixReason}`);
  }
  if (statusId === "failed" && failReason) {
    parts.push(`Fail reason: ${failReason}`);
  }
  return parts;
}

function getCombinedReasonText(item) {
  return getReasonParts(item).join(" | ");
}

function getSubmissionReasonLines(submission) {
  return getReasonParts(submission);
}

function getSubmissionReason(submission) {
  return getCombinedReasonText(submission);
}

function buildSubmissionQaTooltip(submission) {
  const qaLabel = getSubmissionQaLabel(submission);
  if (!isQaDecision(qaLabel)) {
    return "";
  }
  const reason = getSubmissionReasonLines(submission).join("\n") || "No reason provided";
  const name = submission.name || "Submission";
  return `${name}\n${reason}`;
}

function buildTimelineQaTooltip(item) {
  if (!isQaDecision(item?.qaLabel)) {
    return "";
  }
  const reason = getCombinedReasonText(item);
  const name = item?.submissionName || "Submission";
  return `${name}\n${reason || "No reason provided"}`;
}

function buildFailedStatsTooltip(items) {
  if (!items.length) {
    return "";
  }
  return items
    .slice(0, 8)
    .map((item) => {
      const reason = getCombinedReasonText(item);
      const platform = item.platformName ? ` [${item.platformName}]` : "";
      if (reason) {
        return `${item.submissionName}${platform}: ${reason}`;
      }
      return `${item.submissionName}${platform}: ${humanizeStatusId(item.status)}`;
    })
    .join("\n");
}

function isQaDecision(label) {
  return label === "QA" || label === "NotQA";
}

function isFailedStatus(statusId) {
  return normalizeStatusId(statusId) === "failed";
}

function isDoneStatus(statusId) {
  return normalizeStatusId(statusId) === "done";
}

function normalizeStatusId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeProjectWorkType(value) {
  return normalizeStatusId(value) === "creation" ? "creation" : "update";
}

function normalizeProjectStage(stage, fallbackWorkType = "") {
  const normalizedStage = normalizeStatusId(stage);
  if (PROJECT_STAGE_META[normalizedStage]) {
    return normalizedStage;
  }
  return normalizeProjectWorkType(fallbackWorkType) === "creation" ? "creation" : "live_ops";
}

function getProjectWorkTypeFromStage(stage) {
  const normalizedStage = normalizeProjectStage(stage);
  return PROJECT_STAGE_META[normalizedStage]?.defaultWorkType || "update";
}

function getProjectStageLabel(stage) {
  const normalizedStage = normalizeProjectStage(stage);
  return PROJECT_STAGE_META[normalizedStage]?.label || "LiveOps / Updates";
}

function humanizeStatusId(statusId) {
  return normalizeStatusId(statusId)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Status";
}

function randomColorFromStatusId(statusId) {
  const palette = ["#2563eb", "#16a34a", "#d97706", "#9333ea", "#0891b2", "#be123c", "#64748b"];
  const id = normalizeStatusId(statusId);
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

function renderLabelChip(label, tooltip = "") {
  const titleAttr = tooltip ? ` title="${escapeHtml(tooltip)}"` : "";
  if (label === "QA") {
    return `<span class="qa-chip"${titleAttr}>QA</span>`;
  }
  if (label === "NotQA") {
    return `<span class="notqa-chip"${titleAttr}>Non QA</span>`;
  }
  return "";
}

function renderHotfixChip(isHotfix) {
  if (!isHotfix) {
    return "";
  }
  return '<span class="hf-chip" title="Hotfix submission">HF</span>';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}



