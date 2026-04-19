# Component Dependencies

## Dependency Matrix

| Component | Depends On |
|---|---|
| AppLayout | Header, React Router Outlet, UIStore (modals) |
| Header | React Router (navigation links) |
| DashboardPage | analyticsApi, transactionApi, MonthlySummaryCard, CategoryPieChart, MonthlyTrendChart, TransactionList |
| TransactionsPage | TransactionList, TransactionFilters, useTransactionStore, useUIStore |
| SettingsPage | useSessionStore, useCategoryStore, useUIStore, ExportDialog |
| TransactionFormModal | useUIStore, useTransactionStore, useCategoryStore, useTagStore, react-hook-form |
| CategoryFormModal | useUIStore, useCategoryStore, react-hook-form |
| ExportDialog | useUIStore, exportApi, downloadFile |
| ConfirmDialog | useUIStore |
| MonthlySummaryCard | (presentational, props only) |
| CategoryPieChart | Chart.js, react-chartjs-2 |
| MonthlyTrendChart | Chart.js, react-chartjs-2 |
| TransactionList | (presentational, props + callbacks) |
| TransactionFilters | useCategoryStore, useTagStore |
| Zustand Stores | API Service Modules |
| API Service Modules | APIClient |

## Data Flow

```
User Interaction
      │
      ▼
Page Component (DashboardPage, TransactionsPage, SettingsPage)
      │
      ▼
Zustand Store (state + actions)
      │
      ▼
API Service Module (transactionApi, categoryApi, etc.)
      │
      ▼
APIClient (HTTP fetch)
      │
      ▼
Spring Boot Backend (localhost:8080)
      │
      ▼
MySQL Database
```

## Communication Patterns
- **Component → Store**: Zustand hooks (`useTransactionStore`, etc.)
- **Store → API**: Direct function calls to API service modules
- **API → Backend**: HTTP REST (fetch API)
- **Cross-component**: Zustand shared state (UIStore for modals/toasts)
- **Navigation**: React Router (`useNavigate`, `<Link>`)
