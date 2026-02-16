# System Architecture

## System Overview

Cash Log is a modern web application built with a microservices architecture, separating frontend and backend concerns. The system uses a RESTful API for communication between the Next.js frontend and Spring Boot backend, with MySQL as the persistent data store.

## Architecture Diagram

```mermaid
graph TB
    User[User Browser]
    
    subgraph Frontend[Frontend Layer - Next.js]
        Pages[Pages/Routes]
        Components[React Components]
        Stores[Zustand Stores]
        API[API Client]
    end
    
    subgraph Backend[Backend Layer - Spring Boot]
        Controllers[REST Controllers]
        Services[Business Services]
        Repositories[JPA Repositories]
        Entities[Domain Entities]
    end
    
    subgraph Data[Data Layer]
        MySQL[(MySQL Database)]
    end
    
    User --> Pages
    Pages --> Components
    Components --> Stores
    Stores --> API
    API -->|HTTP/REST| Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> Entities
    Entities --> MySQL
    
    style Frontend fill:#BBDEFB
    style Backend fill:#C8E6C9
    style Data fill:#FFF59D
```

## Component Descriptions

### Frontend Application (apps/frontend)
- **Purpose**: Provides the user interface for personal finance management
- **Responsibilities**:
  - Render pages and components using React
  - Manage client-side state with Zustand
  - Handle routing with Next.js App Router
  - Make API calls to backend services
  - Support internationalization (i18n)
  - Implement responsive design with Tailwind CSS
- **Dependencies**: Backend API
- **Type**: Next.js 14 Application (TypeScript)

### Backend API (apps/backend)
- **Purpose**: Provides RESTful API for business logic and data management
- **Responsibilities**:
  - Handle HTTP requests and responses
  - Implement business logic for transactions, budgets, tags
  - Perform data validation and error handling
  - Generate analytics and reports
  - Export data in multiple formats (CSV, Excel, PDF)
  - Manage database operations through JPA
- **Dependencies**: MySQL Database
- **Type**: Spring Boot Application (Java 21)

### Database (MySQL)
- **Purpose**: Persistent storage for application data
- **Responsibilities**:
  - Store transactions, budgets, tags, and session data
  - Maintain data integrity with constraints
  - Support efficient querying with indexes
- **Type**: MySQL 8.0

## Data Flow

### Transaction Creation Flow
```mermaid
sequenceDiagram
    participant User
    participant UI as Frontend UI
    participant Store as Transaction Store
    participant API as API Client
    participant Controller as Transaction Controller
    participant Service as Transaction Service
    participant Repo as Transaction Repository
    participant DB as MySQL Database
    
    User->>UI: Fill transaction form
    User->>UI: Click "Save"
    UI->>Store: addTransaction(data)
    Store->>API: POST /api/transactions
    API->>Controller: createTransaction(request)
    Controller->>Service: createTransaction(dto)
    Service->>Repo: save(entity)
    Repo->>DB: INSERT INTO transactions
    DB-->>Repo: Transaction saved
    Repo-->>Service: Transaction entity
    Service-->>Controller: Transaction DTO
    Controller-->>API: 201 Created
    API-->>Store: Transaction data
    Store-->>UI: Update state
    UI-->>User: Show success message
```

## Integration Points

### External APIs
- None (self-contained application)

### Databases
- **MySQL**: Primary data store for all application data
  - Transactions table
  - Budgets table
  - Tags table
  - Session preferences table

### Third-party Services
- None currently integrated

## Infrastructure Components

### Development Environment
- **Frontend**: Node.js 20.x, npm
- **Backend**: Java 21, Maven 3.8+
- **Database**: MySQL 8.0 (Docker container)

### Deployment Model
- **Frontend**: Next.js application (can be deployed to Vercel, AWS, etc.)
- **Backend**: Spring Boot JAR (can be deployed to AWS ECS, EC2, etc.)
- **Database**: MySQL instance (AWS RDS, Docker, etc.)

### Networking
- Frontend communicates with backend via HTTP REST API
- Backend connects to MySQL via JDBC
- CORS configured to allow frontend origin

### Monitoring
- Spring Boot Actuator endpoints available
- Swagger UI for API documentation at /swagger-ui.html
