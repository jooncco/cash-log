# Component Methods

## API Client

### apiClient
```typescript
get<T>(endpoint: string): Promise<T>
post<T>(endpoint: string, data: unknown): Promise<T>
put<T>(endpoint: string, data: unknown): Promise<T>
delete<T>(endpoint: string): Promise<T>
download(endpoint: string): Promise<Blob>
```

## API Service Modules

### transactionApi
```typescript
getTransactions(params: TransactionFilterParams): Promise<PageResponse<Transaction>>
getTransaction(id: number): Promise<Transaction>
createTransaction(data: CreateTransactionRequest): Promise<Transaction>
updateTransaction(id: number, data: CreateTransactionRequest): Promise<Transaction>
deleteTransaction(id: number): Promise<void>
```

### categoryApi
```typescript
getCategories(): Promise<Category[]>
createCategory(data: CreateCategoryRequest): Promise<Category>
updateCategory(id: number, data: CreateCategoryRequest): Promise<Category>
deleteCategory(id: number): Promise<void>
```

### tagApi
```typescript
getTags(): Promise<Tag[]>
createTag(data: CreateTagRequest): Promise<Tag>
deleteTag(id: number): Promise<void>
```

### analyticsApi
```typescript
getMonthlySummary(year: number, month: number): Promise<MonthlySummary>
getCategoryBreakdown(year: number, month: number): Promise<CategoryData[]>
getMonthlyTrend(year: number): Promise<MonthlyTrendData[]>
getTopTransactions(year: number, month: number, limit: number): Promise<Transaction[]>
```

### exportApi
```typescript
exportCSV(year: number, month: number): Promise<Blob>
exportExcel(year: number, month: number): Promise<Blob>
exportPDF(year: number, month: number): Promise<Blob>
```

### sessionApi
```typescript
getSession(): Promise<SessionPreferences>
updateSession(data: UpdateSessionRequest): Promise<SessionPreferences>
```

## Zustand Stores

### useTransactionStore
```typescript
// State
transactions: Transaction[]
totalPages: number
currentPage: number
filters: TransactionFilterParams
loading: boolean

// Actions
fetchTransactions(): Promise<void>
addTransaction(data: CreateTransactionRequest): Promise<void>
updateTransaction(id: number, data: CreateTransactionRequest): Promise<void>
removeTransaction(id: number): Promise<void>
setFilters(filters: Partial<TransactionFilterParams>): void
setPage(page: number): void
```

### useCategoryStore
```typescript
categories: Category[]
loading: boolean
fetchCategories(): Promise<void>
addCategory(data: CreateCategoryRequest): Promise<void>
updateCategory(id: number, data: CreateCategoryRequest): Promise<void>
removeCategory(id: number): Promise<void>
```

### useTagStore
```typescript
tags: Tag[]
loading: boolean
fetchTags(): Promise<void>
addTag(data: CreateTagRequest): Promise<void>
removeTag(id: number): Promise<void>
```

### useSessionStore
```typescript
theme: 'light' | 'dark'
loading: boolean
fetchSession(): Promise<void>
updateTheme(theme: 'light' | 'dark'): Promise<void>
```

### useUIStore
```typescript
// Modal state
transactionModal: { open: boolean; editId?: number }
categoryModal: { open: boolean; editId?: number }
confirmDialog: { open: boolean; message: string; onConfirm: () => void }
exportDialog: { open: boolean }
toasts: Toast[]

// Actions
openTransactionModal(editId?: number): void
closeTransactionModal(): void
openCategoryModal(editId?: number): void
closeCategoryModal(): void
openConfirmDialog(message: string, onConfirm: () => void): void
closeConfirmDialog(): void
openExportDialog(): void
closeExportDialog(): void
addToast(toast: Omit<Toast, 'id'>): void
removeToast(id: string): void
```
