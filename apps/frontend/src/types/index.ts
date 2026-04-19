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
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrendData {
  month: string;
  income: number;
  expense: number;
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
