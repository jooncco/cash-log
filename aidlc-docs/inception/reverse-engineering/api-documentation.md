# API Documentation

## REST APIs

### Transaction Endpoints

#### POST /api/transactions
- **Purpose**: Create a new transaction
- **Request**: CreateTransactionRequest (date, amount, type, category, currency, memo, tagIds)
- **Response**: 201 Created with TransactionDTO

#### GET /api/transactions
- **Purpose**: Get all transactions with optional filtering
- **Parameters**: startDate, endDate (optional)
- **Response**: 200 OK with List<TransactionDTO>

#### GET /api/transactions/{id}
- **Purpose**: Get transaction by ID
- **Response**: 200 OK with TransactionDTO

#### PUT /api/transactions/{id}
- **Purpose**: Update existing transaction
- **Request**: CreateTransactionRequest
- **Response**: 200 OK with TransactionDTO

#### DELETE /api/transactions/{id}
- **Purpose**: Delete transaction
- **Response**: 204 No Content

### Budget Endpoints

#### POST /api/budgets
- **Purpose**: Create a new budget
- **Request**: CreateBudgetRequest (category, amount, period, alertThreshold)
- **Response**: 201 Created with BudgetDTO

#### GET /api/budgets
- **Purpose**: Get all budgets
- **Response**: 200 OK with List<BudgetDTO>

#### GET /api/budgets/{year}/{month}
- **Purpose**: Get budget for specific month
- **Response**: 200 OK with BudgetDTO

#### PUT /api/budgets/{id}
- **Purpose**: Update existing budget
- **Request**: CreateBudgetRequest
- **Response**: 200 OK with BudgetDTO

#### DELETE /api/budgets/{id}
- **Purpose**: Delete budget
- **Response**: 204 No Content

### Tag Endpoints

#### POST /api/tags
- **Purpose**: Create a new tag
- **Request**: CreateTagRequest (name, color)
- **Response**: 201 Created with TagDTO

#### GET /api/tags
- **Purpose**: Get all tags
- **Response**: 200 OK with List<TagDTO>

#### PUT /api/tags/{id}
- **Purpose**: Update existing tag
- **Request**: CreateTagRequest
- **Response**: 200 OK with TagDTO

#### DELETE /api/tags/{id}
- **Purpose**: Delete tag
- **Response**: 204 No Content

### Analytics Endpoints

#### GET /api/analytics/monthly-summary
- **Purpose**: Get monthly income/expense summary
- **Parameters**: year, month
- **Response**: 200 OK with MonthlySummaryDTO

#### GET /api/analytics/category-breakdown
- **Purpose**: Get expense breakdown by category
- **Parameters**: startDate, endDate
- **Response**: 200 OK with List<CategoryDataDTO>

#### GET /api/analytics/cumulative
- **Purpose**: Get cumulative profit/loss over time
- **Parameters**: startDate, endDate
- **Response**: 200 OK with cumulative data

### Export Endpoints

#### GET /api/export/csv
- **Purpose**: Export transactions to CSV
- **Parameters**: startDate, endDate
- **Response**: 200 OK with CSV file

#### GET /api/export/excel
- **Purpose**: Export transactions to Excel
- **Parameters**: startDate, endDate
- **Response**: 200 OK with Excel file

#### GET /api/export/pdf
- **Purpose**: Export transactions to PDF
- **Parameters**: startDate, endDate
- **Response**: 200 OK with PDF file

### Session Endpoints

#### GET /api/session/{sessionKey}
- **Purpose**: Get session preferences
- **Response**: 200 OK with SessionPreferences

#### PUT /api/session/{sessionKey}
- **Purpose**: Update session preferences
- **Request**: UpdateSessionRequest (theme)
- **Response**: 200 OK with SessionPreferences

## Data Models

### Transaction
- **Fields**: id, date, amount, type, category, currency, memo, tags
- **Relationships**: Many-to-Many with Tag
- **Validation**: amount > 0, type in [INCOME, EXPENSE], date required

### Budget
- **Fields**: id, category, amount, period, alertThreshold
- **Relationships**: None
- **Validation**: amount > 0, alertThreshold 0-100

### Tag
- **Fields**: id, name, color
- **Relationships**: Many-to-Many with Transaction
- **Validation**: name unique, color hex format

### Session
- **Fields**: sessionKey, theme
- **Relationships**: None
- **Validation**: theme in [LIGHT, DARK]
