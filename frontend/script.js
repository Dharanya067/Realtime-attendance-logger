const API_BASE = 'http://localhost:8080/api';
let currentUser = null;
let stompClient = null;

// Page Navigation
function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('signupPage').classList.remove('active');
}

function showSignup() {
    document.getElementById('signupPage').classList.add('active');
    document.getElementById('loginPage').classList.remove('active');
}

function showDashboard() {
    document.getElementById('dashboardPage').classList.add('active');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('signupPage').classList.remove('active');
    loadEmployees();
    loadAttendanceRecords();
    connectWebSocket();
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(section + 'Section').classList.add('active');
    event.target.classList.add('active');
}

// Authentication
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.success) {
            currentUser = data;
            document.getElementById('userInfo').textContent = `Welcome, ${data.username} (${data.role})`;
            
            // Show/hide admin features
            if (data.role === 'ADMIN') {
                document.getElementById('employeeBtn').style.display = 'block';
                document.getElementById('recordsBtn').style.display = 'block';
            } else {
                document.getElementById('employeeBtn').style.display = 'none';
                document.getElementById('recordsBtn').style.display = 'none';
            }
            
            showDashboard();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Login failed');
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    
    try {
        const response = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });
        
        const data = await response.json();
        alert(data.message);
        if (data.success) {
            showLogin();
        }
    } catch (error) {
        alert('Signup failed');
    }
});

function logout() {
    currentUser = null;
    if (stompClient) {
        stompClient.disconnect();
    }
    document.getElementById('dashboardPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
}

// Employee Management
document.getElementById('employeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('employeeName').value;
    const email = document.getElementById('employeeEmail').value;
    const department = document.getElementById('employeeDepartment').value;
    
    try {
        const response = await fetch(`${API_BASE}/employee/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, department })
        });
        
        const data = await response.json();
        alert(data.message);
        if (data.success) {
            document.getElementById('employeeForm').reset();
            loadEmployees();
        }
    } catch (error) {
        alert('Failed to add employee');
    }
});

async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/employee/list`);
        const employees = await response.json();
        
        const select = document.getElementById('employeeSelect');
        select.innerHTML = '<option value="">Select Employee</option>';
        
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.name} - ${emp.department}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load employees');
    }
}

// Attendance Management
async function logAttendance(status) {
    const employeeId = document.getElementById('employeeSelect').value;
    if (!employeeId) {
        alert('Please select an employee');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/attendance/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, status })
        });
        
        const data = await response.json();
        alert(data.message);
        if (data.success) {
            loadAttendanceRecords();
        }
    } catch (error) {
        alert('Failed to log attendance');
    }
}

async function loadAttendanceRecords() {
    try {
        const response = await fetch(`${API_BASE}/attendance/view`);
        const records = await response.json();
        
        const container = document.getElementById('attendanceRecords');
        container.innerHTML = '';
        
        records.forEach(record => {
            const div = document.createElement('div');
            div.className = `record ${record.status.toLowerCase()}`;
            div.innerHTML = `
                <strong>${record.employee.name}</strong> - ${record.employee.department}<br>
                Status: ${record.status}<br>
                Time: ${new Date(record.timestamp).toLocaleString()}
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Failed to load records');
    }
}

// WebSocket for real-time updates
function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, function(frame) {
        stompClient.subscribe('/topic/attendance', function(message) {
            loadAttendanceRecords();
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showLogin();
});