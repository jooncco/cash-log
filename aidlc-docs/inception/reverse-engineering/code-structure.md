# Code Structure

## Build System
- **Frontend**: npm (Node Package Manager)
- **Backend**: Maven
- **Configuration**: 
  - Frontend: package.json, next.config.js, tsconfig.json
  - Backend: pom.xml

## Frontend Code Structure (apps/frontend)

### Existing Files Inventory

#### Pages (App Router)
- `app/page.tsx` - Root page (redirects to dashboard)
- `app/layout.tsx` - Root layout with providers and navigation
- `app/dashboard/page.tsx` - Dashboard with summary cards and recent transactions
- `app/transactions/page.tsx` - Transaction list with CRUD operations
- `app/budgets/page.tsx` - Budget management page (basic structure)
- `app/analytics/page.tsx` - Analytics page with category breakdown
- `app/settings/page.tsx` - Settings page (placeholder)
- `app/globals.css` - Global styles and Tailwind directives

#### Components
- `components/ui/Button.tsx` - Reusable button component
- `components/ui/Input.tsx` - Form input component
- `components/ui/Spinner.tsx` - Loading spinner
- `components/ui/Card.tsx` - Card container component
- `components/layout/Header.tsx` - Application header with navigation
- `components/modals/TransactionFormModal.tsx` - Transaction create/edit modal
- `components/modals/ConfirmDialog.tsx` - Confirmation dialog for destructive actions

#### State Management (Zustand Stores)
- `lib/stores/transactionStore.ts` - Transaction state and API calls
- `lib/stores/budgetStore.ts` - Budget state and API calls
- `lib/stores/tagStore.ts` - Tag state and API calls
- `lib/stores/sessionStore.ts` - Session preferences (theme, language)
- `lib/stores/uiStore.ts` - UI state (modals, dialogs, notifications)

#### API Client
- `lib/api/client.ts` - Base API client configuration
- `lib/api/transactions.ts` - Transaction API endpoints
- `lib/api/budgets.ts` - Budget API endpoints
- `lib/api/tags.ts` - Tag API endpoints
- `lib/api/analytics.ts` - Analytics API endpoints
- `lib/api/export.ts` - Export API endpoints
- `lib/api/session.ts` - Session API endpoints

#### Utilities
- `lib/i18n.ts` - Internationalization utilities
- `types/index.ts` - TypeScript type definitions

#### Configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration

#### Internationalization
- `messages/en.json` - English translations
- `messages/ko.json` - Korean translations

## Backend Code Structure (apps/backend)

### Existing Files Inventory

#### Controllers (REST API)
- `src/main/java/com/cashlog/controller/TransactionController.java` - Transaction endpoints
- `src/main/java/com/cashlog/controller/BudgetController.java` - Budget endpoints
- `src/main/java/com/cashlog/controller/TagController.java` - Tag endpoints
- `src/main/java/com/cashlog/controller/AnalyticsController.java` - Analytics endpoints
- `src/main/java/com/cashlog/controller/ExportController.java` - Export endpoints
- `src/main/java/com/cashlog/controller/SessionController.java` - Session endpoints

#### Services (Business Logic)
- `src/main/java/com/cashlog/service/TransactionService.java` - Transaction business logic
- `src/main/java/com/cashlog/service/BudgetService.java` - Budget business logic
- `src/main/java/com/cashlog/service/TagService.java` - Tag business logic
- `src/main/java/com/cashlog/service/AnalyticsService.java` - Analytics calculations
- `src/main/java/com/cashlog/service/ExportService.java` - Data export logic
- `src/main/java/com/cashlog/service/SessionService.java` - Session management

#### Repositories (Data Access)
- `src/main/java/com/cashlog/repository/TransactionRepository.java` - Transaction JPA repository
- `src/main/java/com/cashlog/repository/BudgetRepository.java` - Budget JPA repository
- `src/main/java/com/cashlog/repository/TagRepository.java` - Tag JPA repository
- `src/main/java/com/cashlog/repository/SessionRepository.java` - Session JPA repository

#### Entities (Domain Models)
- `src/main/java/com/cashlog/entity/Transaction.java` - Transaction entity
- `src/main/java/com/cashlog/entity/Budget.java` - Budget entity
- `src/main/java/com/cashlog/entity/Tag.java` - Tag entity
- `src/main/java/com/cashlog/entity/Session.java` - Session entity

#### DTOs (Data Transfer Objects)
- `src/main/java/com/cashlog/dto/TransactionDTO.java` - Transaction DTO
- `src/main/java/com/cashlog/dto/CreateTransactionRequest.java` - Transaction creation request
- `src/main/java/com/cashlog/dto/BudgetDTO.java` - Budget DTO
- `src/main/java/com/cashlog/dto/CreateBudgetRequest.java` - Budget creation request
- `src/main/java/com/cashlog/dto/TagDTO.java` - Tag DTO
- `src/main/java/com/cashlog/dto/CreateTagRequest.java` - Tag creation request
- `src/main/java/com/cashlog/dto/MonthlySummaryDTO.java` - Monthly summary DTO
- `src/main/java/com/cashlog/dto/CategoryDataDTO.java` - Category breakdown DTO

#### Mappers (Entity-DTO Conversion)
- `src/main/java/com/cashlog/mapper/TransactionMapper.java` - Transaction mapper
- `src/main/java/com/cashlog/mapper/BudgetMapper.java` - Budget mapper
- `src/main/java/com/cashlog/mapper/TagMapper.java` - Tag mapper

#### Configuration
- `src/main/java/com/cashlog/config/CorsConfig.java` - CORS configuration
- `src/main/java/com/cashlog/config/SwaggerConfig.java` - Swagger/OpenAPI configuration
- `src/main/resources/application.yml` - Application configuration

#### Database Migrations
- `src/main/resources/db/migration/V1__create_transactions_table.sql` - Transactions table
- `src/main/resources/db/migration/V2__create_budgets_table.sql` - Budgets table
- `src/main/resources/db/migration/V3__create_tags_table.sql` - Tags table
- `src/main/resources/db/migration/V4__create_session_table.sql` - Session table

#### Exception Handling
- `src/main/java/com/cashlog/exception/GlobalExceptionHandler.java` - Global exception handler
- `src/main/java/com/cashlog/exception/ResourceNotFoundException.java` - Custom exception

## Design Patterns

### Frontend Patterns

#### State Management Pattern
- **Location**: lib/stores/
- **Purpose**: Centralized state management using Zustand
- **Implementation**: Each domain (transactions, budgets, tags) has its own store with actions and state

#### Component Composition Pattern
- **Location**: components/
- **Purpose**: Reusable UI components
- **Implementation**: Small, focused components that can be composed together

#### API Client Pattern
- **Location**: lib/api/
- **Purpose**: Centralized API communication
- **Implementation**: Base client with domain-specific API modules

### Backend Patterns

#### Layered Architecture Pattern
- **Location**: Throughout backend
- **Purpose**: Separation of concerns
- **Implementation**: Controller → Service → Repository → Entity layers

#### DTO Pattern
- **Location**: dto/ package
- **Purpose**: Data transfer between layers
- **Implementation**: Separate DTOs for requests and responses

#### Repository Pattern
- **Location**: repository/ package
- **Purpose**: Data access abstraction
- **Implementation**: Spring Data JPA repositories

## Critical Dependencies

### Frontend Dependencies
- **next**: 14.x - React framework
- **react**: 18.x - UI library
- **zustand**: 4.x - State management
- **tailwindcss**: 3.x - CSS framework
- **react-hook-form**: 7.x - Form handling
- **chart.js**: 4.x - Data visualization
- **next-intl**: 3.x - Internationalization

### Backend Dependencies
- **spring-boot-starter-web**: 3.x - Web framework
- **spring-boot-starter-data-jpa**: 3.x - Data access
- **mysql-connector-j**: 8.x - MySQL driver
- **lombok**: 1.18.x - Boilerplate reduction
- **springdoc-openapi**: 2.x - API documentation
- **flyway-core**: 9.x - Database migrations
- **apache-poi**: 5.x - Excel export
- **itext**: 7.x - PDF generation
