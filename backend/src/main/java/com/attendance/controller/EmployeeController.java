package com.attendance.controller;

import com.attendance.model.Employee;
import com.attendance.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @PostMapping("/add")
    public ResponseEntity<?> addEmployee(@RequestBody Map<String, String> data) {
        String name = data.get("name");
        String email = data.get("email");
        String department = data.get("department");
        
        Employee employee = new Employee(name, email, department);
        employeeRepository.save(employee);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Employee added successfully");
        response.put("employee", employee);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/list")
    public ResponseEntity<List<Employee>> listEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return ResponseEntity.ok(employees);
    }
}