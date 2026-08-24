export interface Transaction {
  id: number;
  transactionDate: string;
  transactionType: 'INCOME' | 'EXPENSE';
  originalAmount: number;
  originalCurrency: string;
  conversionRate?: number;
  amountKrw: number;
  category: Category | null;
  memo?: string;
  /** True for recurring fixed costs; the API keeps it false for income. */
  fixedCost: boolean;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  transactionDate: string;
  originalAmount: number;
  transactionType: 'INCOME' | 'EXPENSE';
  originalCurrency: string;
  conversionRate?: number;
  categoryId: number;
  memo?: string;
  fixedCost?: boolean;
  tagNames: string[];
}

export interface Category {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
}

export interface BreakdownItem {
  id: number;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

/** One point of `/api/analytics/monthly-trend`; `month` is `yyyy-MM`. */
export interface MonthlyTrendPoint {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  /** Fixed-cost slice of `totalExpense` for this month, not an extra outflow. */
  fixedCost: number;
  /** Running balance since the first ever transaction, not just this range. */
  cumulativeSavings: number;
  /** False when the month holds no transaction at all (vs. netting to zero). */
  hasTransactions: boolean;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface SessionPreferences {
  theme: 'LIGHT' | 'DARK';
}

export interface UpdateSessionRequest {
  theme?: 'LIGHT' | 'DARK';
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TransactionFilterParams {
  startDate?: string;
  endDate?: string;
  type?: 'INCOME' | 'EXPENSE';
  categoryIds?: number[];
  tagIds?: number[];
  page?: number;
  size?: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
