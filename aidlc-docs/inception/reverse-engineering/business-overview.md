# Business Overview

## Business Context

Cash Log is a personal finance management application that helps users track their income and expenses, set budgets, analyze spending patterns, and generate financial reports.

## Business Transactions

### 1. Transaction Management
- **Record Income/Expense**: Users can log financial transactions with date, amount, category, tags, and notes
- **View Transaction History**: Users can browse all past transactions with filtering capabilities
- **Edit Transaction**: Users can modify existing transaction details
- **Delete Transaction**: Users can remove transactions from their records

### 2. Budget Management
- **Set Monthly Budget**: Users can define spending limits for specific categories or overall
- **Track Budget Progress**: System monitors spending against budget limits
- **Budget Alerts**: Users receive warnings when approaching or exceeding budget thresholds
- **Manage Budgets**: Users can create, update, and delete budget configurations

### 3. Financial Analytics
- **Monthly Summary**: View total income, expenses, and balance for selected periods
- **Category Breakdown**: Analyze spending distribution across different categories
- **Trend Analysis**: Track financial patterns over time with charts
- **Tag-based Analysis**: Group and analyze transactions by custom tags

### 4. Data Export
- **CSV Export**: Download transaction data in CSV format
- **Excel Export**: Generate Excel spreadsheets with transaction details
- **PDF Reports**: Create formatted PDF reports for record-keeping

### 5. Tag Management
- **Create Tags**: Users can define custom tags for categorizing transactions
- **Assign Tags**: Multiple tags can be applied to each transaction
- **Tag-based Filtering**: Filter transactions by one or more tags
- **Tag Analytics**: View spending patterns by tag

### 6. User Preferences
- **Theme Selection**: Toggle between light and dark modes
- **Language Selection**: Switch between Korean and English
- **Session Persistence**: User preferences are saved across sessions

## Business Dictionary

- **Transaction**: A financial record representing either income or expense
- **Budget**: A spending limit set for a specific category or time period
- **Tag**: A custom label for categorizing and filtering transactions
- **Category**: A classification for transaction types (e.g., Food, Transportation, Shopping)
- **Alert Threshold**: The percentage of budget usage that triggers a warning
- **Session**: User's current application state including preferences and settings
- **Export**: The process of downloading transaction data in various formats

## Component Level Business Descriptions

### Frontend (Next.js Application)
- **Purpose**: Provides user interface for managing personal finances
- **Responsibilities**: 
  - Display financial data in user-friendly formats
  - Handle user interactions and form submissions
  - Manage client-side state and caching
  - Provide responsive design for desktop and mobile
  - Support internationalization (Korean/English)
  - Implement dark mode theming

### Backend (Spring Boot API)
- **Purpose**: Manages business logic and data persistence
- **Responsibilities**:
  - Process transaction CRUD operations
  - Calculate budget progress and alerts
  - Generate analytics and summaries
  - Export data in multiple formats
  - Manage tags and categories
  - Store user session preferences
  - Ensure data integrity and validation
