CREATE DATABASE IF NOT EXISTS attendance_db;
USE attendance_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER'
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    timestamp DATETIME NOT NULL,
    status VARCHAR(10) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Insert default admin user
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'ADMIN');

-- Insert sample employees
INSERT INTO employees (name, email, department) VALUES 
('John Doe', 'john@company.com', 'IT'),
('Jane Smith', 'jane@company.com', 'HR'),
('Mike Johnson', 'mike@company.com', 'Finance');