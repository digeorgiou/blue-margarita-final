# BlueMargarita - Jewelry Business Management System

A comprehensive full-stack web application for managing jewelry business operations, 
including inventory management, sales tracking, customer management, and financial reporting.

## 🚀 Features

### Core Business Management
- **Product Management**: Complete jewelry catalog with materials, procedures, and automatic pricing calculations
- **Inventory & Stock Control**: Real-time stock tracking with low-stock alerts
- **Customer Management**: Customer profiles, purchase history, and analytics
- **Supplier Management**: Vendor information and purchase tracking
- **Sales Management**: Complete sales recording, tracking, and analytics
- **Purchase Management**: Material purchases and expense tracking
- **Financial Reporting**: Profit/loss analysis and comprehensive business insights

### Advanced Features
- **Automated Pricing**: Smart pricing calculations based on materials, procedures, and markup factors
- **Material & Procedure Tracking**: Detailed cost tracking for jewelry production processes
- **Multi-location Support**: Manage multiple business locations
- **Role-based Access Control**: Admin and user roles with appropriate permissions
- **Real-time Analytics**: Sales trends, popular products, and business performance metrics
- **Expense Management**: Comprehensive business expense tracking and categorization

### Technical Features
- **JWT Authentication**: Secure token-based authentication system
- **RESTful API**: Well-documented API with OpenAPI/Swagger documentation
- **Responsive Design**: Modern React frontend with Tailwind CSS
- **Data Validation**: Comprehensive input validation on both frontend and backend
- **Pagination & Filtering**: Efficient data handling for large datasets

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.4.7 with Java 17
- **Database**: MySQL with JPA/Hibernate
- **Security**: Spring Security with JWT tokens
- **API Documentation**: SpringDoc OpenAPI (Swagger UI)
- **Build Tool**: Gradle

### Frontend (React + Vite)
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Yup validation
- **Icons**: Lucide React & React Icons
- **HTTP Client**: Axios

## 📋 Prerequisites

### Required Software
- **Java 17** or higher
- **Node.js 18** or higher
- **MySQL 8.0** or higher
- **Git**

### Development Tools (Recommended)
- **IntelliJ IDEA** or **Eclipse** for backend development
- **VS Code** for frontend development
- **MySQL Workbench** for database management

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/digeorgiou/bluemargarita-spring.git
cd bluemargarita
```

### 2. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE bluemargaritadb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'springuser'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON bluemargaritadb.* TO 'springuser'@'localhost';
FLUSH PRIVILEGES;
```

#### Environment Variables (Optional)
The application works with default values, but you can optionally create a `.env` file to override them:
```env
# Optional - these are the default values used if not specified
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=bluemargaritadb
MYSQL_USER=springuser
MYSQL_PASSWORD=12345
JWT_SECRET_KEY=your-secret-key-here
```

**Note**: The application will run perfectly without any environment variables using the built-in defaults.

### 3. Backend Setup

#### Navigate to Backend Directory
```bash
cd backend
```

#### Build and Run
```bash
# Using Gradle Wrapper (Recommended)
./gradlew clean build
./gradlew bootRun

# Or using system Gradle
gradle build
gradle bootRun
```

The backend will start on `http://localhost:8080`

## 🗄️ Database Initialization

### First-Time Setup
On the first run, uncomment the following lines in `backend/src/main/resources/application-test.properties`:

```properties
# Uncomment these lines in application-test.properties for initial setup
spring.jpa.hibernate.ddl-auto=update
spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:sql/delete.sql,classpath:sql/01users.sql,classpath:sql/02locations.sql,\
  classpath:sql/03categories.sql,classpath:sql/04procedures.sql,classpath:sql/05materials.sql,\
  classpath:sql/06suppliers.sql,classpath:sql/07customers.sql,classpath:sql/08products.sql,\
  classpath:sql/09product_material.sql,classpath:sql/10procedure_product.sql, classpath:sql/11sales.sql,\
  classpath:sql/12purchases.sql,classpath:sql/13expenses.sql,classpath:sql/14purchase_material.sql,classpath:sql/15sale_product.sql
spring.sql.init.encoding=UTF-8
spring.sql.init.platform=mysql
spring.sql.init.continue-on-error=false
```

After the initial setup with sample data, **comment out these lines again** and use:
```properties
spring.jpa.hibernate.ddl-auto=update
spring.sql.init.mode=never
```

### Default Users
The system comes with pre-configured users:
- **Admin**: `admin` / `12345`
- **Users**: `maria` / `12345`, `john` / `12345`, `anna` / `12345`

#### API Documentation
Once running, access Swagger UI at: `http://localhost:8080/swagger-ui.html`

### 4. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Install Dependencies and Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# For production build
npm run build
npm run preview
```

The frontend will start on `http://localhost:5173`

## 📚 API Documentation

### Authentication
All API endpoints (except authentication) require JWT token:
```http
Authorization: Bearer <your-jwt-token>
```

### Key API Endpoints
- **Authentication**: `POST /api/auth/authenticate`
- **Products**: `GET/POST/PUT/DELETE /api/products/**`
- **Sales**: `GET/POST /api/sales/**`
- **Customers**: `GET/POST/PUT/DELETE /api/customers/**`
- **Inventory**: `GET/PUT /api/stock-management/**`

## 📁 Project Structure

```
bluemargarita/
├── backend/                 # Spring Boot Application
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration & SQL files
│   ├── build.gradle        # Build configuration
│   └── gradlew            # Gradle wrapper
├── frontend/               # React Application
│   ├── src/               # TypeScript/React source
│   ├── public/            # Static assets
│   ├── package.json       # Dependencies
│   └── vite.config.ts     # Build configuration
├── .gitignore             # Git ignore rules
└── README.md             # This file
```

## 🤝 Development Guidelines

### Code Style
- **Backend**: Follow Java conventions with Lombok for boilerplate reduction
- **Frontend**: TypeScript strict mode with ESLint configuration
- **Database**: Use snake_case for table/column names

### Security Considerations
- JWT tokens expire after 3 hours (configurable)
- Passwords are encrypted with BCrypt
- Input validation on both frontend and backend
- CORS properly configured for allowed origins
