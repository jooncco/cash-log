# Code Generation Plan - Frontend Remaining Features

## Unit Context
- **Unit Name**: Frontend Enhancements
- **Workspace Root**: /Users/jooncco/workspace/cash-log
- **Code Location**: apps/frontend/ (NEVER aidlc-docs/)
- **Project Type**: Brownfield - Modify existing Next.js application

## Implementation Steps

### Step 1: Add Missing Translation Keys
- [x] Read existing translation files (messages/ko.json, messages/en.json)
- [x] Add translation keys for all new UI text
- [x] Ensure Korean and English translations for all keys

### Step 2: Create Budget Form Modal Component
- [x] Create `components/modals/BudgetFormModal.tsx`
- [x] Implement modal with React Hook Form
- [x] Fields: category, amount, period, alertThreshold
- [x] Validation and error handling
- [x] Connect to stores
- [x] Add accessibility and i18n

### Step 3: Create Tag Management Modal Component
- [x] Create `components/modals/TagFormModal.tsx`
- [x] Implement modal with tag list + create/edit form
- [x] Tag list with edit/delete buttons
- [x] Create/Edit form with name and color picker
- [x] Connect to stores
- [x] Add accessibility and i18n

### Step 4: Create Export Dialog Component
- [x] Create `components/modals/ExportDialog.tsx`
- [x] Implement modal with format selection
- [x] Date range inputs
- [x] Export button with file download
- [x] Connect to API
- [x] Add accessibility and i18n

### Step 5: Add Charts to Analytics Page
- [ ] Read existing translation files (messages/ko.json, messages/en.json)
- [ ] Add translation keys for all new UI text:
  - Budget modal: budget, setBudget, editBudget, category, amount, period, alertThreshold, monthlyBudget, yearlyBudget
  - Tag modal: tags, createTag, editTag, tagName, tagColor, colorPicker
  - Export dialog: export, exportData, selectFormat, selectDateRange, downloadCSV, downloadExcel, downloadPDF
  - Analytics: monthlyTrend, categoryBreakdown, chart, noDataAvailable
  - Filtering: filter, filters, clearFilters, dateRange, startDate, endDate, selectCategory, selectTags
  - Budget progress: spent, remaining, budgetProgress, overBudget, approachingLimit
  - Settings: settings, preferences, appearance, language
- [ ] Ensure Korean and English translations for all keys

### Step 2: Create Budget Form Modal Component
- [ ] Create `components/modals/BudgetFormModal.tsx`
- [ ] Implement modal with React Hook Form
- [ ] Fields: category (text input), amount (number input), period (select), alertThreshold (number input 0-100)
- [ ] Validation: required fields, amount > 0, threshold 0-100
- [ ] Connect to useBudgetStore (addBudget, updateBudget)
- [ ] Connect to useUIStore (budgetModalOpen, editingBudget, closeBudgetModal)
- [ ] Add data-testid attributes for testing
- [ ] Add ARIA labels for accessibility
- [ ] Make mobile-responsive (full-screen on mobile)
- [ ] Use i18n for all text

### Step 3: Create Tag Management Modal Component
- [ ] Create `components/modals/TagFormModal.tsx`
- [ ] Implement modal with tag list + create/edit form
- [ ] Tag list: Display all tags with edit/delete buttons
- [ ] Create/Edit form: name input + color picker (use HTML color input)
- [ ] Validation: required name, unique name, valid hex color
- [ ] Connect to useTagStore (tags, addTag, updateTag, deleteTag, fetchTags)
- [ ] Connect to useUIStore (tagModalOpen, editingTag, closeTagModal)
- [ ] Add confirmation dialog for delete
- [ ] Add data-testid attributes
- [ ] Add ARIA labels
- [ ] Make mobile-responsive
- [ ] Use i18n for all text

### Step 4: Create Export Dialog Component
- [ ] Create `components/modals/ExportDialog.tsx`
- [ ] Implement modal with format selection (CSV/Excel/PDF radio buttons)
- [ ] Date range inputs: start date and end date pickers
- [ ] Export button: trigger download via export API
- [ ] Connect to useUIStore (exportDialogOpen, closeExportDialog)
- [ ] Handle file download for each format:
  - CSV: GET /api/export/csv?startDate=&endDate=
  - Excel: GET /api/export/excel?startDate=&endDate=
  - PDF: GET /api/export/pdf?startDate=&endDate=
- [ ] Show loading state during export
- [ ] Handle errors with user feedback
- [ ] Add data-testid attributes
- [ ] Add ARIA labels
- [ ] Make mobile-responsive
- [ ] Use i18n for all text

### Step 5: Add Charts to Analytics Page
- [ ] Modify `app/analytics/page.tsx`
- [ ] Import Chart.js components (Line, Pie from react-chartjs-2)
- [ ] Create monthly trend line chart:
  - X-axis: Months
  - Y-axis: Amount
  - Two lines: Income (green), Expense (red)
  - Data from transactions grouped by month
- [ ] Create category pie chart:
  - Slices: Categories
  - Values: Total expense per category
  - Colors: Auto-generated or predefined palette
- [ ] Make charts responsive (use maintainAspectRatio: false)
- [ ] Add tooltips with formatted values
- [ ] Handle empty data state (show message)
- [ ] Use i18n for chart labels

### Step 6: Add Transaction Filtering
- [ ] Modify `app/transactions/page.tsx`
- [ ] Add filter UI above transaction table:
  - Date range: start and end date pickers
  - Category: dropdown/select (get categories from transactions)
  - Tags: multi-select (get tags from tagStore)
- [ ] Implement filter logic in component:
  - Filter transactions array based on selected filters
  - Apply all filters (AND logic)
- [ ] Add "Clear Filters" button
- [ ] Show active filter count badge
- [ ] Make filter UI collapsible on mobile
- [ ] Add data-testid attributes
- [ ] Use i18n for filter labels

### Step 7: Add Analytics Filtering
- [ ] Modify `app/analytics/page.tsx`
- [ ] Enhance existing month selector with additional filters:
  - Category filter: optional category selection
  - Apply filters to both charts and summary data
- [ ] Update chart data based on filters
- [ ] Update summary calculations based on filters
- [ ] Add "Clear Filters" button
- [ ] Use i18n for filter labels

### Step 8: Implement Budget Progress Tracking
- [ ] Modify `app/budgets/page.tsx`
- [ ] For each budget card, calculate progress:
  - Get transactions matching budget category and period
  - Sum expense amounts
  - Calculate percentage: (spent / budget) * 100
- [ ] Update progress bar width based on percentage
- [ ] Add spent and remaining amounts display
- [ ] Implement color coding:
  - Green: < 80%
  - Yellow: 80-100%
  - Red: > 100%
- [ ] Add alert indicator when threshold exceeded
- [ ] Update "₩0 spent" placeholder with actual values
- [ ] Use i18n for labels

### Step 9: Implement Settings Page
- [ ] Modify `app/settings/page.tsx`
- [ ] Create settings layout with sections:
  - Appearance: Theme toggle (Light/Dark)
  - Language: Language selector (Korean/English)
- [ ] Connect to useSessionStore (theme, language, updateTheme, updateLanguage)
- [ ] Save preferences via session API
- [ ] Add visual feedback on save
- [ ] Make mobile-responsive
- [ ] Add data-testid attributes
- [ ] Use i18n for all text

### Step 10: Update Layout to Open Modals
- [ ] Verify `app/layout.tsx` includes all modal components:
  - TransactionFormModal (already exists)
  - BudgetFormModal (new)
  - TagFormModal (new)
  - ExportDialog (new)
  - ConfirmDialog (already exists)
- [ ] Ensure modals are rendered at root level
- [ ] Verify modal state management via useUIStore

### Step 11: Add Export Button to UI
- [ ] Modify `app/transactions/page.tsx`
- [ ] Add "Export" button next to "Add Transaction" button
- [ ] Button onClick: openExportDialog()
- [ ] Use i18n for button text

### Step 12: Add Tag Management Button to UI
- [ ] Modify `app/transactions/page.tsx` or create tags section
- [ ] Add "Manage Tags" button (could be in header or settings)
- [ ] Button onClick: openTagModal()
- [ ] Use i18n for button text

### Step 13: Create Documentation Summary
- [ ] Create `aidlc-docs/construction/frontend-enhancements/code/implementation-summary.md`
- [ ] Document all components created
- [ ] Document all files modified
- [ ] Document integration points
- [ ] Document testing approach

## Story Traceability
- FR1 (Budget Form Modal) → Step 2
- FR2 (Tag Management Modal) → Step 3
- FR3 (Export Dialog) → Step 4
- FR4 (Analytics Charts) → Step 5
- FR5 (Transaction Filtering) → Step 6
- FR6 (Analytics Filtering) → Step 7
- FR7 (Budget Progress Tracking) → Step 8
- FR8 (Settings Page) → Step 9

## Dependencies
- All steps depend on Step 1 (translations)
- Steps 2-4 are independent (can be done in any order)
- Step 10 depends on Steps 2-4 (modal components must exist)
- Steps 5-9 are independent
- Steps 11-12 depend on Steps 3-4 (modals must exist)

## Files to Create
- `apps/frontend/components/modals/BudgetFormModal.tsx`
- `apps/frontend/components/modals/TagFormModal.tsx`
- `apps/frontend/components/modals/ExportDialog.tsx`
- `aidlc-docs/construction/frontend-enhancements/code/implementation-summary.md`

## Files to Modify
- `apps/frontend/messages/ko.json`
- `apps/frontend/messages/en.json`
- `apps/frontend/app/analytics/page.tsx`
- `apps/frontend/app/transactions/page.tsx`
- `apps/frontend/app/budgets/page.tsx`
- `apps/frontend/app/settings/page.tsx`
- `apps/frontend/app/layout.tsx`

## Technical Notes
- Follow existing patterns from TransactionFormModal.tsx
- Use Tailwind CSS for styling
- Use React Hook Form for form handling
- Use Zustand stores for state management
- Use Chart.js for data visualization
- Maintain TypeScript type safety
- Follow accessibility guidelines (ARIA labels, keyboard navigation)
- Ensure mobile responsiveness
- Use next-intl for internationalization
