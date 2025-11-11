# Real-Time Attendance Logger

A complete web application for real-time attendance tracking with Spring Boot backend, responsive frontend, and MySQL database.

## Features

- **Authentication**: Login/Signup with role-based access (Admin/User)
- **Employee Management**: Add and manage employees (Admin only)
- **Attendance Logging**: Real-time check-in/check-out functionality
- **Live Dashboard**: Real-time updates using WebSocket
- **Responsive Design**: Modern UI with CSS Grid/Flexbox
- **Docker Deployment**: Complete containerized setup

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, WebSocket
- **Backend**: Spring Boot, JPA/Hibernate, WebSocket
- **Database**: MySQL 8.0
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 80, 8080, and 3306 available

### Run the Application

```bash
# Clone or download the project
cd attendance-logger

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080/api
```

## Default Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Sample Employees**: John Doe, Jane Smith, Mike Johnson

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

### Employee Management
- `POST /api/employee/add` - Add new employee (Admin only)
- `GET /api/employee/list` - List all employees

### Attendance
- `POST /api/attendance/log` - Log attendance (check-in/out)
- `GET /api/attendance/view` - View attendance records

## Database Schema

### Tables
- **users**: User authentication and roles
- **employees**: Employee information
- **attendance**: Attendance records with timestamps

## Project Structure

```
attendance-logger/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── Dockerfile
├── backend/
│   ├── src/main/java/com/attendance/
│   │   ├── AttendanceApplication.java
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   └── config/
│   ├── pom.xml
│   └── Dockerfile
├── database/
│   └── init.sql
├── docker-compose.yml
└── README.md
```

## Features Overview

### User Roles
- **Admin**: Full access to all features including employee management and viewing all records
- **User**: Can log attendance for employees

### Real-time Updates
- WebSocket connection provides live updates to the dashboard
- Attendance records appear instantly across all connected clients

### Responsive Design
- Mobile-friendly interface
- CSS Grid and Flexbox for modern layouts
- Clean, professional styling

## Development

### Local Development Setup

1. **Database**: Start MySQL locally or use Docker
2. **Backend**: Run Spring Boot application
3. **Frontend**: Serve static files or use live server

### Environment Variables

Backend configuration in `application.properties`:
- Database URL, username, password
- Server port
- JWT secret key

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 80, 8080, 3306 are available
2. **Database Connection**: Wait for MySQL container to fully start
3. **CORS Issues**: Backend configured to allow all origins for development

### Logs

```bash
# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

## Future Enhancements

- CSV export functionality
- Advanced reporting and analytics
- Email notifications
- Mobile app integration
- Biometric authentication support

## License

This project is open source and available under the MIT License.