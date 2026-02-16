// Transaction types
export interface Transaction {
  id: number;
  transactionDate: string;
  transactionType: 'INCOME' | 'EXPENSE';
  originalAmount: number;
  originalCurrency: string;
  conversionRate?: number;
  amountKrw: number;
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
  memo?: string;
  tagIds: number[];
}

// Budget types
export interface Budget {
  id: number;
  amount: number;
  period: string;
  alertThreshold: number;
}

export interface CreateBudgetRequest {
  amount: number;
  period: string;
  alertThreshold: number;
}
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

// Analytics types
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

// Session types
export interface SessionPreferences {
  theme: 'LIGHT' | 'DARK';
}

export interface UpdateSessionRequest {
  theme?: 'LIGHT' | 'DARK';
}

// Pagination
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
