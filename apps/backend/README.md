# Cash Log Backend

Spring Boot backend API for Cash Log personal finance application.

## Prerequisites

- Java 21
- Maven 3.8+
- Docker (optional)

### IDE Setup for Lombok

**IntelliJ IDEA:**
1. Install Lombok plugin: `Settings` → `Plugins` → Search "Lombok" → Install
2. Enable annotation processing: `Settings` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors` → Check "Enable annotation processing"

**Eclipse:**
1. Download lombok.jar from https://projectlombok.org/download
2. Run: `java -jar lombok.jar`
3. Select Eclipse installation directory
4. Click "Install/Update"

**VS Code:**
1. Install "Language Support for Java" extension
2. Lombok support is included automatically

## Database

The backend uses an **embedded H2 database** — no separate database server is
required.

| Profile | Datasource | Lifetime |
|---------|-----------|----------|
| (default) | `jdbc:h2:file:${CASHLOG_DB_PATH:./data/cashlog}` | Persists across restarts |
| `demo` | `jdbc:h2:mem:cashlog` | Reset on every start |
| `test` | `jdbc:h2:mem:testdb` | Per test run |

Flyway owns the schema (`src/main/resources/db/migration`) and Hibernate runs
with `ddl-auto: validate`, so a mismatch between entities and migrations fails
at startup. The `dev` profile additionally exposes the H2 console at
`/h2-console`.

## Build and Run

### Using Maven

```bash
# Build
mvn clean package

# Run
mvn spring-boot:run

# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Note**: Lombok is configured as an annotation processor in Maven. No additional setup needed for command-line builds.

### Using Docker

```bash
# Build image
docker build -t cashlog-backend .

# Run container (H2 files kept on a volume)
docker run -p 8080:8080 \
  -v cashlog-data:/data \
  -e CASHLOG_DB_PATH=/data/cashlog \
  cashlog-backend

# Run a throwaway in-memory instance
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=demo cashlog-backend
```

## API Documentation

Once running, access Swagger UI at:
- http://localhost:8080/swagger-ui.html

API docs JSON:
- http://localhost:8080/api-docs

## Configuration

Environment variables:
- `CASHLOG_DB_PATH`: H2 database file prefix (default: `./data/cashlog`)
- `SPRING_PROFILES_ACTIVE`: `dev`, `demo` or empty
- `APP_CORS_ALLOWED_ORIGINS`: comma-separated origins allowed on `/api/**`

## Testing

```bash
mvn test
```

## Project Structure

```
src/
├── main/
│   ├── java/com/cashlog/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Exception handling
│   │   ├── mapper/          # Entity-DTO mappers
│   │   ├── repository/      # JPA repositories
│   │   └── service/         # Business logic
│   └── resources/
│       ├── db/migration/    # Flyway migrations
│       └── application.yml  # Configuration
└── test/                    # Unit and integration tests
```

## API Endpoints

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions?startDate=&endDate=` - Filter by date range
- `GET /api/transactions/{id}` - Get transaction by ID
- `DELETE /api/transactions/{id}` - Delete transaction

### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/{year}/{month}` - Get budget for month
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Analytics
- `GET /api/analytics/monthly-summary?year=&month=` - Monthly summary
- `GET /api/analytics/category-breakdown?startDate=&endDate=` - Category breakdown
- `GET /api/analytics/cumulative?startDate=&endDate=` - Cumulative profit/loss

### Tags
- `POST /api/tags` - Create tag
- `GET /api/tags` - Get all tags
- `DELETE /api/tags/{id}` - Delete tag

### Export
- `GET /api/export/csv?startDate=&endDate=` - Export to CSV
- `GET /api/export/excel?startDate=&endDate=` - Export to Excel
- `GET /api/export/pdf?startDate=&endDate=` - Export to PDF

### Session
- `GET /api/session/{sessionKey}` - Get session preferences
- `PUT /api/session/{sessionKey}` - Update session preferences
