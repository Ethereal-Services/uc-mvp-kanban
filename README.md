# Kanban Board System - Angular + Python + MySQL

A complete full-stack Kanban board application with user authentication, built with Angular frontend, Python Flask backend, and MySQL database.

## Features

- **User Authentication** with registration and login
- **Kanban Board** with drag-and-drop functionality
- **Ticket Management** (Create, Read, Update, Delete)
- **Three Column Layout** (To Do, In Progress, Done)
- **Ticket Properties** (Title, Description, Priority, Labels)
- **Drag & Drop** to move tickets between columns
- **JWT Token Authentication** for secure API access
- **Password Hashing** using bcrypt
- **Modern UI** with responsive design
- **Real-time Updates** with automatic refresh
- **Input Validation** on both frontend and backend
- **Error Handling** with user-friendly messages

## Project Structure

```
uc-mvp/
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── kanban-board/
│   │   │   │   ├── kanban-column/
│   │   │   │   ├── kanban-ticket/
│   │   │   │   ├── create-ticket-modal/
│   │   │   │   └── edit-ticket-modal/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── kanban.service.ts
│   │   │   ├── models/
│   │   │   │   └── kanban.model.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts
│   │   └── ...
├── backend/                # Python Flask API
│   ├── app.py
│   ├── requirements.txt
│   └── .env
└── database/              # MySQL schema
    └── schema.sql
```

## Database Schema

The application uses a simple but effective database schema with two main entities:

```mermaid
erDiagram
    User {
        int id PK
        string username UK
        string email UK
        string password_hash
        datetime created_at
    }
    
    Ticket {
        string id PK
        string title
        text description
        string priority
        string status
        text labels
        int user_id FK
        datetime created_at
        datetime updated_at
    }
    
    User ||--o{ Ticket : creates
```

### Entity Descriptions

#### User Entity
- **id**: Primary key, auto-incrementing integer
- **username**: Unique username for authentication
- **email**: Unique email address for authentication
- **password_hash**: Bcrypt-hashed password for security
- **created_at**: Timestamp when user account was created

#### Ticket Entity
- **id**: Primary key, UUID string for unique identification
- **title**: Short descriptive title of the ticket
- **description**: Detailed description of the ticket content
- **priority**: Priority level (low, medium, high)
- **status**: Current status (todo, in-progress, done)
- **labels**: JSON string array of labels/tags
- **user_id**: Foreign key reference to User who created the ticket
- **created_at**: Timestamp when ticket was created
- **updated_at**: Timestamp when ticket was last modified

#### Relationships
- **One-to-Many**: User → Ticket (One user can create many tickets)
- **Foreign Key**: Ticket.user_id references User.id

### Database Features

- **Authentication**: Secure user registration and login
- **Data Integrity**: Foreign key constraints ensure referential integrity
- **Indexing**: Unique constraints on username and email for fast lookups
- **Timestamps**: Automatic tracking of creation and modification times
- **UUID Primary Keys**: Tickets use UUIDs for better security and distribution

## Application Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

```mermaid
graph TB
    subgraph "Frontend (Angular)"
        A[User Interface] --> B[Angular Components]
        B --> C[Services & Guards]
        C --> D[HTTP Interceptors]
        
        subgraph "Components"
            B1[Login/Register]
            B2[Dashboard]
            B3[Kanban Board]
            B4[Kanban Column]
            B5[Kanban Ticket]
            B6[Create/Edit Modals]
        end
        
        subgraph "Services"
            C1[Auth Service]
            C2[Kanban Service]
            C3[Auth Guard]
            C4[Auth Interceptor]
        end
        
        B --> B1
        B --> B2
        B --> B3
        B --> B4
        B --> B5
        B --> B6
        
        C --> C1
        C --> C2
        C --> C3
        C --> C4
    end
    
    subgraph "Backend (Flask)"
        E[Flask API] --> F[Authentication]
        E --> G[Ticket Management]
        F --> H[JWT Manager]
        G --> I[SQLAlchemy ORM]
        
        subgraph "API Endpoints"
            F1[POST /api/register]
            F2[POST /api/login]
            F3[GET /api/profile]
            G1[GET /api/tickets]
            G2[POST /api/tickets]
            G3[PUT /api/tickets/:id]
            G4[DELETE /api/tickets/:id]
        end
        
        F --> F1
        F --> F2
        F --> F3
        G --> G1
        G --> G2
        G --> G3
        G --> G4
    end
    
    subgraph "Database (MySQL)"
        J[(User Table)]
        K[(Ticket Table)]
        J --> K
    end
    
    subgraph "Security Layer"
        L[JWT Tokens]
        M[Bcrypt Password Hashing]
        N[CORS Configuration]
        O[Input Validation]
    end
    
    %% Data Flow
    A -->|HTTP Requests| D
    D -->|Authenticated Requests| E
    E -->|Database Operations| I
    I -->|SQL Queries| J
    I -->|SQL Queries| K
    
    %% Security Flow
    F -->|Generate| L
    F -->|Hash Passwords| M
    E -->|Enable| N
    E -->|Validate| O
    
    %% Response Flow
    E -->|JSON Response| D
    D -->|Update UI| A
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef security fill:#fff3e0
    
    class A,B,C,D,B1,B2,B3,B4,B5,B6,C1,C2,C3,C4 frontend
    class E,F,G,H,I,F1,F2,F3,G1,G2,G3,G4 backend
    class J,K database
    class L,M,N,O security
```

### Architecture Components

#### **Frontend Layer (Angular)**
- **User Interface**: Modern, responsive UI with drag-and-drop functionality
- **Components**: Modular components for authentication, dashboard, and Kanban board
- **Services**: HTTP services for API communication and state management
- **Guards**: Route protection ensuring authenticated access
- **Interceptors**: Automatic JWT token attachment and error handling

#### **Backend Layer (Flask)**
- **REST API**: RESTful endpoints for user management and ticket operations
- **Authentication**: JWT-based stateless authentication system
- **ORM**: SQLAlchemy for database abstraction and operations
- **Validation**: Input validation and sanitization
- **Security**: Password hashing, CORS configuration, and JWT management

#### **Database Layer (MySQL)**
- **Relational Database**: Structured data storage with referential integrity
- **User Management**: Secure user accounts with hashed passwords
- **Ticket Storage**: Kanban tickets with full CRUD operations
- **Relationships**: Foreign key constraints ensuring data consistency

#### **Security Layer**
- **JWT Tokens**: Secure, stateless authentication tokens
- **Password Hashing**: Bcrypt for secure password storage
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Frontend and backend validation layers

### Data Flow

1. **User Authentication**:
   - User submits credentials via Angular form
   - Frontend validates input and sends to Flask API
   - Backend validates credentials and generates JWT token
   - Token stored in frontend for subsequent requests

2. **Ticket Operations**:
   - User interacts with Kanban board (create/edit/move tickets)
   - Angular services make authenticated API calls
   - Flask processes requests and updates MySQL database
   - Real-time UI updates reflect database changes

3. **Security**:
   - All API requests include JWT tokens via interceptors
   - Backend validates tokens and user permissions
   - Database operations are protected by authentication
   - Input validation prevents malicious data injection

## Prerequisites

- **Node.js** (v20.19.0 or higher)
- **Angular CLI** (v20.x or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **pip** (Python package manager)

## Setup Instructions

### 1. Database Setup

1. **Install MySQL** (if not already installed):
   ```bash
   # macOS
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   ```

2. **Create Database**:
   ```bash
   mysql -u root -p
   ```
   
   Then run the schema:
   ```sql
   source database/schema.sql
   ```

3. **Configure Database Connection**:
   Update the `.env` file in the backend folder with your MySQL credentials:
   ```
   DATABASE_URL=mysql+pymysql://username:password@localhost/auth_db
   ```

### 2. Backend Setup (Python Flask)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   # or
   venv\Scripts\activate     # On Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create or update `.env` file:
   ```
   DATABASE_URL=mysql+pymysql://root:password@localhost/auth_db
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

5. **Run the Flask application**:
   ```bash
   python app.py
   ```
   
   The backend will run on `http://localhost:5000`

### 3. Frontend Setup (Angular)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Angular application**:
   ```bash
   ng serve
   ```
   
   The frontend will run on `http://localhost:4200`

## API Endpoints

### Authentication Routes

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (requires authentication)
- `GET /api/health` - Health check endpoint

### Request/Response Examples

#### Register
```json
POST /api/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-01T12:00:00"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Login
```json
POST /api/login
{
  "username": "johndoe",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-01T12:00:00"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Usage

1. **Start the backend server** (Flask API on port 5000)
2. **Start the frontend application** (Angular on port 4200)
3. **Open your browser** and navigate to `http://localhost:4200`
4. **Register a new account** or login with existing credentials
5. **Access the protected dashboard** after successful authentication

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Tokens**: Stateless authentication with JWT
- **Input Validation**: Both frontend and backend validation
- **CORS Configuration**: Properly configured for cross-origin requests
- **HTTP Interceptors**: Automatic token attachment to requests
- **Route Guards**: Protect routes that require authentication

## Development Notes

- The backend uses SQLAlchemy ORM for database operations
- The frontend uses reactive forms for input validation
- JWT tokens expire after 1 hour (configurable)
- CORS is enabled for local development
- All passwords are hashed before storage

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check MySQL service is running
   - Verify credentials in `.env` file
   - Ensure database `auth_db` exists

2. **CORS Error**:
   - Ensure Flask-CORS is installed
   - Check that backend is running on port 5000

3. **JWT Token Error**:
   - Verify JWT_SECRET_KEY is set in `.env`
   - Check token expiration settings

4. **Angular Build Error**:
   - Clear node_modules and reinstall
   - Check Angular CLI version compatibility

## Production Deployment

For production deployment:

1. **Update environment variables**:
   - Set strong JWT_SECRET_KEY
   - Configure production database URL
   - Set FLASK_ENV=production

2. **Build Angular for production**:
   ```bash
   ng build --prod
   ```

3. **Use production WSGI server**:
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```

4. **Configure reverse proxy** (nginx recommended)

## License

This project is open source and available under the MIT License.
