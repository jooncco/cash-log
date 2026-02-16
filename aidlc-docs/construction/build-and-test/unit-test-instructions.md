# Unit Test Execution

## Overview
Execute unit tests for both backend and frontend components to verify individual component functionality.

## Backend Unit Tests

### Test Framework
- **JUnit 5**: Primary testing framework
- **Mockito**: Mocking framework
- **Spring Boot Test**: Integration with Spring context

### Run All Unit Tests
```bash
cd apps/backend

# Run all tests
./mvnw test

# Run with coverage report
./mvnw test jacoco:report
```

### Run Specific Test Classes
```bash
# Run specific test class
./mvnw test -Dtest=TransactionServiceTest

# Run specific test method
./mvnw test -Dtest=TransactionServiceTest#testCreateTransaction
```

### Expected Results
```
[INFO] Tests run: XX, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### Test Coverage
- **Target**: 80% code coverage
- **Report Location**: `target/site/jacoco/index.html`

### Key Test Suites

#### Service Layer Tests
- `TransactionServiceTest`: Transaction CRUD operations
- `BudgetServiceTest`: Budget management
- `TagServiceTest`: Tag operations
- `SessionServiceTest`: Session management

#### Repository Layer Tests
- `TransactionRepositoryTest`: Database operations
- `BudgetRepositoryTest`: Budget queries
- `TagRepositoryTest`: Tag queries

#### Controller Layer Tests
- `TransactionControllerTest`: API endpoints
- `BudgetControllerTest`: Budget endpoints
- `TagControllerTest`: Tag endpoints

## Frontend Unit Tests

### Test Framework
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation

### Run All Unit Tests
```bash
cd apps/frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

### Run Specific Tests
```bash
# Run tests matching pattern
npm test -- TransactionFormModal

# Run single test file
npm test -- app/transactions/page.test.tsx
```

### Expected Results
```
Test Suites: XX passed, XX total
Tests:       XX passed, XX total
Snapshots:   0 total
Time:        X.XXXs
```

### Test Coverage
- **Target**: 70% code coverage
- **Report Location**: `coverage/lcov-report/index.html`

### Key Test Suites

#### Component Tests
- `TransactionFormModal.test.tsx`: Transaction form validation
- `BudgetFormModal.test.tsx`: Budget form validation
- `TagFormModal.test.tsx`: Tag management
- `Header.test.tsx`: Navigation and theme switching

#### Page Tests
- `dashboard/page.test.tsx`: Dashboard rendering
- `transactions/page.test.tsx`: Transaction list and filters
- `budgets/page.test.tsx`: Budget overview
- `analytics/page.test.tsx`: Charts and analytics

#### Store Tests
- `transactionStore.test.ts`: Transaction state management
- `budgetStore.test.ts`: Budget state management
- `sessionStore.test.ts`: Session and preferences

#### Utility Tests
- `i18n.test.ts`: Translation functions
- `api/client.test.ts`: API client

## Test Execution Strategy

### 1. Quick Validation (< 1 minute)
```bash
# Backend: Run fast unit tests only
cd apps/backend
./mvnw test -Dgroups=unit

# Frontend: Run changed tests only
cd apps/frontend
npm test -- --onlyChanged
```

### 2. Full Test Suite (2-5 minutes)
```bash
# Backend: All unit tests
cd apps/backend
./mvnw test

# Frontend: All unit tests
cd apps/frontend
npm test -- --watchAll=false
```

### 3. Coverage Report (5-10 minutes)
```bash
# Backend with coverage
cd apps/backend
./mvnw clean test jacoco:report

# Frontend with coverage
cd apps/frontend
npm test -- --coverage --watchAll=false
```

## Troubleshooting

### Backend Test Failures

**Issue**: Database connection errors in tests
```bash
# Use H2 in-memory database for tests
# Add to src/test/resources/application-test.properties:
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

**Issue**: Test timeout
```bash
# Increase timeout in pom.xml
<configuration>
  <argLine>-Xmx1024m</argLine>
</configuration>
```

### Frontend Test Failures

**Issue**: Module not found errors
```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

**Issue**: Async test failures
```bash
# Ensure proper async handling
# Use waitFor, findBy queries from @testing-library/react
```

**Issue**: Environment variables not loaded
```bash
# Create .env.test file
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Test Quality Metrics

### Backend
- **Unit Tests**: ~50-100 tests
- **Execution Time**: 10-30 seconds
- **Coverage Target**: 80%

### Frontend
- **Unit Tests**: ~30-60 tests
- **Execution Time**: 5-15 seconds
- **Coverage Target**: 70%

## Continuous Testing

### Watch Mode (Development)
```bash
# Backend: Run tests on file change
cd apps/backend
./mvnw test -Dspring-boot.run.fork=false

# Frontend: Run tests on file change
cd apps/frontend
npm run test:watch
```

## Next Steps

After unit tests pass:
1. Review test coverage reports
2. Fix any failing tests
3. Proceed to Integration Testing
