# Integration Test Instructions

## Purpose
Test interactions between components, services, and external systems to ensure they work together correctly.

## Test Scenarios

### Scenario 1: Frontend → Backend → Database Integration

**Description**: Test complete data flow from UI to database

**Setup**:
```bash
# 1. Start MySQL
docker run -d --name cashlog-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cashlog \
  -p 3306:3306 \
  mysql:8.0

# 2. Start Backend
cd apps/backend
./mvnw spring-boot:run

# 3. Start Frontend
cd apps/frontend
npm run dev
```

**Test Steps**:
1. Open browser: http://localhost:3000
2. Navigate to Transactions page
3. Click "Add Transaction" button
4. Fill form:
   - Date: Today's date
   - Type: EXPENSE
   - Amount: 50000
   - Currency: KRW
   - Description: "Test transaction"
5. Submit form
6. Verify transaction appears in list
7. Verify data in database:
   ```bash
   mysql -u root -p cashlog
   SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1;
   ```

**Expected Results**:
- Transaction saved successfully
- UI updates with new transaction
- Database contains correct data
- No console errors

---

### Scenario 2: Budget Alert Integration

**Description**: Test budget threshold alerts

**Setup**: Backend and Frontend running

**Test Steps**:
1. Create budget: Category "Food", Amount 100000, Period "2026-02"
2. Add expense: Category "Food", Amount 85000
3. Verify budget shows 85% used (warning state)
4. Add another expense: Category "Food", Amount 20000
5. Verify budget shows 105% used (exceeded state)

**Expected Results**:
- Budget calculations correct
- Visual indicators show warning/exceeded states
- Real-time updates work

---

### Scenario 3: Tag Management Integration

**Description**: Test tag creation and assignment

**Setup**: Backend and Frontend running

**Test Steps**:
1. Navigate to Transactions page
2. Click "Manage Tags"
3. Create new tag: "Groceries"
4. Create transaction with tag "Groceries"
5. Filter transactions by tag "Groceries"
6. Verify only tagged transactions appear

**Expected Results**:
- Tag created successfully
- Tag assigned to transaction
- Filter works correctly

---

### Scenario 4: Session Persistence Integration

**Description**: Test session and preferences persistence

**Setup**: Backend and Frontend running

**Test Steps**:
1. Change theme to Dark mode
2. Change language to English
3. Refresh browser
4. Verify theme and language persist
5. Check backend session:
   ```bash
   curl http://localhost:8080/api/session/preferences
   ```

**Expected Results**:
- Preferences saved to backend
- Preferences restored on page reload
- Session maintained across requests

---

### Scenario 5: Analytics Data Integration

**Description**: Test analytics calculations and charts

**Setup**: Backend and Frontend running with sample data

**Test Steps**:
1. Create multiple transactions across different months
2. Navigate to Analytics page
3. Select month filter
4. Verify chart displays correct data
5. Verify category breakdown matches transactions

**Expected Results**:
- Charts render correctly
- Data calculations accurate
- Filters work properly

---

### Scenario 6: Export Functionality Integration

**Description**: Test data export to CSV/Excel/PDF

**Setup**: Backend and Frontend running with sample data

**Test Steps**:
1. Navigate to Transactions page
2. Click "Export" button
3. Select format: CSV
4. Select date range
5. Click "Export"
6. Verify file downloads
7. Open file and verify data

**Expected Results**:
- File downloads successfully
- Data format correct
- All transactions in range included

---

## Setup Integration Test Environment

### 1. Start All Services
```bash
# Terminal 1: Database
docker run -d --name cashlog-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cashlog \
  -p 3306:3306 \
  mysql:8.0

# Terminal 2: Backend
cd apps/backend
./mvnw spring-boot:run

# Terminal 3: Frontend
cd apps/frontend
npm run dev
```

### 2. Verify Services Running
```bash
# Check backend
curl http://localhost:8080/actuator/health

# Check frontend
curl http://localhost:3000

# Check database
mysql -u root -p -e "SHOW DATABASES;"
```

### 3. Load Test Data (Optional)
```bash
# Run SQL script to populate test data
mysql -u root -p cashlog < test-data.sql
```

## Integration Test Execution

### Manual Testing Checklist
- [ ] Scenario 1: Frontend → Backend → Database
- [ ] Scenario 2: Budget Alert Integration
- [ ] Scenario 3: Tag Management Integration
- [ ] Scenario 4: Session Persistence Integration
- [ ] Scenario 5: Analytics Data Integration
- [ ] Scenario 6: Export Functionality Integration

### Automated Integration Tests (Future)
```bash
# Backend integration tests
cd apps/backend
./mvnw verify -P integration-tests

# Frontend E2E tests (if implemented)
cd apps/frontend
npm run test:e2e
```

## Troubleshooting

### Service Connection Issues

**Backend cannot connect to database**:
```bash
# Check MySQL is running
docker ps | grep cashlog-mysql

# Check connection
mysql -u root -p -h localhost -P 3306
```

**Frontend cannot connect to backend**:
```bash
# Verify backend is running
curl http://localhost:8080/actuator/health

# Check CORS configuration in backend
# Ensure frontend URL is allowed
```

### Data Inconsistency Issues

**Transaction not appearing in UI**:
1. Check browser console for errors
2. Verify API response in Network tab
3. Check backend logs for errors
4. Verify database contains data

**Budget calculations incorrect**:
1. Verify transaction dates match budget period
2. Check category matching
3. Verify transaction type (INCOME vs EXPENSE)

### Session Issues

**Preferences not persisting**:
1. Check browser localStorage
2. Verify backend session API working
3. Check CORS and credentials settings

## Cleanup

### Stop Services
```bash
# Stop frontend (Ctrl+C in terminal)

# Stop backend (Ctrl+C in terminal)

# Stop and remove database
docker stop cashlog-mysql
docker rm cashlog-mysql
```

### Clear Test Data
```bash
# Reset database
mysql -u root -p -e "DROP DATABASE cashlog; CREATE DATABASE cashlog;"
```

## Integration Test Metrics

### Expected Results
- **All scenarios**: Pass
- **API response time**: < 500ms
- **Page load time**: < 2s
- **No console errors**: 0 errors
- **No backend errors**: 0 errors

## Next Steps

After integration tests pass:
1. Document any issues found
2. Fix integration bugs
3. Proceed to Performance Testing (if applicable)
4. Proceed to Build and Test Summary
