// ShiftService.java
package com.taptrack.service;

import com.taptrack.dto.request.ShiftAssignmentRequest;
import com.taptrack.dto.request.ShiftTemplateRequest;
import com.taptrack.entity.Employee;
import com.taptrack.entity.ShiftAssignment;
import com.taptrack.entity.ShiftTemplate;
import com.taptrack.enums.EmploymentStatus;
import com.taptrack.exception.AppException;
import com.taptrack.exception.ErrorCode;
import com.taptrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftTemplateRepository shiftTemplateRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    @Transactional
    public ShiftTemplate createTemplate(ShiftTemplateRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new AppException(ErrorCode.INVALID_SHIFT_CONFIG, "Giờ kết thúc phải sau giờ bắt đầu");
        }

        ShiftTemplate template = ShiftTemplate.builder()
                .name(request.getName().trim())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        return shiftTemplateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        if (shiftAssignmentRepository.existsByShiftTemplateId(id)) {
            throw new AppException(ErrorCode.SHIFT_TEMPLATE_IN_USE);
        }
        shiftTemplateRepository.deleteById(id);
    }

    @Transactional
    public ShiftAssignment assignShift(ShiftAssignmentRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        if (employee.getEmploymentStatus() == EmploymentStatus.INACTIVE) {
            throw new AppException(ErrorCode.EMPLOYEE_INACTIVE, "Không thể phân ca cho nhân viên INACTIVE");
        }

        // Validate: Hoặc dùng Template, hoặc dùng Custom Time
        boolean hasTemplate = request.getShiftTemplateId() != null;
        boolean hasCustomTime = request.getCustomStartTime() != null && request.getCustomEndTime() != null;

        if ((hasTemplate && hasCustomTime) || (!hasTemplate && !hasCustomTime)) {
            throw new AppException(ErrorCode.INVALID_SHIFT_CONFIG);
        }

        if (hasCustomTime && (request.getCustomEndTime().isBefore(request.getCustomStartTime()))) {
            throw new AppException(ErrorCode.INVALID_SHIFT_CONFIG, "Giờ kết thúc phải sau giờ bắt đầu");
        }

        // Chặn sửa/xóa phân ca nếu ngày đó đã phát sinh chấm công
        if (attendanceRecordRepository.existsByEmployeeIdAndWorkDate(employee.getId(), request.getWorkDate())) {
            throw new AppException(ErrorCode.SHIFT_ASSIGNMENT_LOCKED);
        }

        ShiftTemplate template = hasTemplate ?
                shiftTemplateRepository.findById(request.getShiftTemplateId())
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_TEMPLATE_NOT_FOUND)) : null;

        ShiftAssignment assignment = shiftAssignmentRepository.findByEmployeeIdAndWorkDate(employee.getId(), request.getWorkDate())
                .orElse(ShiftAssignment.builder()
                        .employee(employee)
                        .workDate(request.getWorkDate())
                        .build());

        assignment.setShiftTemplate(template);
        assignment.setCustomStartTime(request.getCustomStartTime());
        assignment.setCustomEndTime(request.getCustomEndTime());

        return shiftAssignmentRepository.save(assignment);
    }
}