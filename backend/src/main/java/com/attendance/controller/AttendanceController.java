package com.attendance.controller;

import com.attendance.model.Attendance;
import com.attendance.model.Employee;
import com.attendance.repository.AttendanceRepository;
import com.attendance.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @PostMapping("/log")
    public ResponseEntity<?> logAttendance(@RequestBody Map<String, Object> data) {
        Long employeeId = Long.valueOf(data.get("employeeId").toString());
        String status = data.get("status").toString();
        
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Employee not found");
            return ResponseEntity.badRequest().body(response);
        }
        
        Attendance attendance = new Attendance(employee, LocalDateTime.now(), status);
        attendanceRepository.save(attendance);
        
        // Send real-time update
        messagingTemplate.convertAndSend("/topic/attendance", attendance);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Attendance logged successfully");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/view")
    public ResponseEntity<List<Attendance>> viewAttendance() {
        List<Attendance> records = attendanceRepository.findByOrderByTimestampDesc();
        return ResponseEntity.ok(records);
    }
}