package com.taptrack.service;

import com.taptrack.dto.request.*;
import com.taptrack.dto.response.*;
import com.taptrack.entity.*;
import com.taptrack.enums.*;
import com.taptrack.exception.*;
import com.taptrack.mapper.ShiftMapper;
import com.taptrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftTemplateRepository templateRepo;
    private final ShiftAssignmentRepository assignmentRepo;
    private final EmployeeRepository employeeRepo;
    private final AttendanceRecordRepository attendanceRepo;
    private final ShiftMapper mapper;

    // ---------------- Template ----------------

    @Transactional
    public ShiftTemplateResponse createTemplate(ShiftTemplateRequest req) {
        if (!req.endTime().isAfter(req.startTime())) {
            throw new AppException(ErrorCode.SHIFT_TIME_INVALID);
        }
        ShiftTemplate t = templateRepo.save(ShiftTemplate.builder()
                .name(req.name())
                .startTime(req.startTime())
                .endTime(req.endTime())
                .build());
        return mapper.toTemplate(t);
    }

    @Transactional(readOnly = true)
    public List<ShiftTemplateResponse> listTemplates() {
        return templateRepo.findAll().stream().map(mapper::toTemplate).toList();
    }

    @Transactional
    public void deleteTemplate(Long id) {
        ShiftTemplate t = templateRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_TEMPLATE_NOT_FOUND));
        if (assignmentRepo.existsByShiftTemplateId(id)) {
            throw new AppException(ErrorCode.SHIFT_TEMPLATE_IN_USE);
        }
        templateRepo.delete(t);
    }

    // ---------------- Assignment ----------------

    @Transactional
    public ShiftAssignmentResponse createAssignment(ShiftAssignmentRequest req) {
        Employee emp = employeeRepo.findById(req.employeeId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));
        if (emp.getEmploymentStatus() == EmploymentStatus.INACTIVE) {
            throw new AppException(ErrorCode.EMPLOYEE_INACTIVE);
        }
        ShiftTemplate tpl = templateRepo.findById(req.shiftTemplateId())
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_TEMPLATE_NOT_FOUND));
        if (assignmentRepo.existsByEmployeeIdAndWorkDate(req.employeeId(), req.workDate())) {
            throw new AppException(ErrorCode.SHIFT_ASSIGNMENT_DUPLICATE);
        }
        ShiftAssignment a = assignmentRepo.save(ShiftAssignment.builder()
                .employee(emp).shiftTemplate(tpl).workDate(req.workDate()).build());
        return mapper.toAssignment(a);
    }

    @Transactional
    public ShiftAssignmentResponse updateAssignment(Long id, ShiftAssignmentRequest req) {
        ShiftAssignment a = assignmentRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_ASSIGNMENT_NOT_FOUND));
        if (attendanceRepo.existsByEmployeeIdAndWorkDate(
                a.getEmployee().getId(), a.getWorkDate())) {
            throw new AppException(ErrorCode.SHIFT_ASSIGNMENT_LOCKED);
        }
        Employee emp = employeeRepo.findById(req.employeeId())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));
        ShiftTemplate tpl = templateRepo.findById(req.shiftTemplateId())
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_TEMPLATE_NOT_FOUND));
        a.setEmployee(emp);
        a.setShiftTemplate(tpl);
        a.setWorkDate(req.workDate());
        return mapper.toAssignment(assignmentRepo.save(a));
    }

    @Transactional
    public void deleteAssignment(Long id) {
        ShiftAssignment a = assignmentRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_ASSIGNMENT_NOT_FOUND));
        if (attendanceRepo.existsByEmployeeIdAndWorkDate(
                a.getEmployee().getId(), a.getWorkDate())) {
            throw new AppException(ErrorCode.SHIFT_ASSIGNMENT_LOCKED);
        }
        assignmentRepo.delete(a);
    }

    // ---------------- Weekly schedule ----------------

    @Transactional(readOnly = true)
    public WeeklyScheduleResponse weeklySchedule(Long employeeId, LocalDate weekStart) {
        if (!employeeRepo.existsById(employeeId)) {
            throw new AppException(ErrorCode.EMPLOYEE_NOT_FOUND);
        }
        LocalDate monday = weekStart.with(DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);
        var assignments = assignmentRepo.findByEmployeeIdAndWorkDateBetween(employeeId, monday, sunday);

        Map<LocalDate, ShiftAssignment> byDate = new HashMap<>();
        for (ShiftAssignment a : assignments) byDate.put(a.getWorkDate(), a);

        List<DayScheduleItem> days = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            ShiftAssignment a = byDate.get(d);
            if (a == null) {
                days.add(new DayScheduleItem(d, DayScheduleStatus.OFF, null, null, null));
            } else {
                days.add(new DayScheduleItem(d, DayScheduleStatus.SHIFT,
                        a.getShiftTemplate().getName(),
                        a.getShiftTemplate().getStartTime(),
                        a.getShiftTemplate().getEndTime()));
            }
        }
        return new WeeklyScheduleResponse(monday, days);
    }
}