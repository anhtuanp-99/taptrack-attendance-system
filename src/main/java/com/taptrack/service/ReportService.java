package com.taptrack.service;

import com.taptrack.config.AttendanceProperties;
import com.taptrack.dto.response.*;
import com.taptrack.entity.*;
import com.taptrack.enums.*;
import com.taptrack.repository.*;
import com.taptrack.util.TimeProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ShiftAssignmentRepository assignmentRepo;
    private final AttendanceRecordRepository attendanceRepo;
    private final EmployeeRepository employeeRepo;
    private final AttendanceProperties props;
    private final TimeProvider time;

    @Transactional(readOnly = true)
    public DashboardTodayResponse dashboard(Long departmentId) {
        LocalDate today = time.today();
        LocalDateTime now = time.now();

        List<ShiftAssignment> assignments = assignmentRepo.findByWorkDate(today).stream()
                .filter(a -> departmentId == null
                        || a.getEmployee().getDepartment().getId().equals(departmentId))
                .toList();

        Set<Long> assignedEmpIds = new HashSet<>();
        for (var a : assignments) assignedEmpIds.add(a.getEmployee().getId());

        List<AttendanceRecord> records = attendanceRepo.findByWorkDate(today);
        Set<Long> checkedIds = new HashSet<>();
        long late = 0;
        for (var r : records) {
            if (!assignedEmpIds.contains(r.getEmployee().getId())) continue;
            checkedIds.add(r.getEmployee().getId());
            if (r.getCheckInStatus() == CheckInStatus.LATE) late++;
        }

        long absent = 0;
        for (var a : assignments) {
            if (checkedIds.contains(a.getEmployee().getId())) continue;
            LocalDateTime start = LocalDateTime.of(today, a.getShiftTemplate().getStartTime());
            if (now.isAfter(start.plusMinutes(props.getGracePeriodMinutes()))) absent++;
        }

        return new DashboardTodayResponse(checkedIds.size(), assignedEmpIds.size(), late, absent);
    }

    @Transactional(readOnly = true)
    public List<MonthlyReportResponse> monthly(int year, int month, Long departmentId) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        LocalDate today = time.today();

        List<Employee> employees = employeeRepo.findAll().stream()
                .filter(e -> departmentId == null
                        || e.getDepartment().getId().equals(departmentId))
                .toList();

        List<MonthlyReportResponse> out = new ArrayList<>();
        for (Employee e : employees) {
            var assignments = assignmentRepo.findByEmployeeIdAndWorkDateBetween(e.getId(), from, to);
            var records = attendanceRepo.findByEmployeeIdAndWorkDateBetween(e.getId(), from, to);

            Map<LocalDate, AttendanceRecord> byDate = new HashMap<>();
            for (var r : records) byDate.put(r.getWorkDate(), r);

            int onTime = 0, late = 0, early = 0, absent = 0, missing = 0;
            for (var a : assignments) {
                AttendanceRecord r = byDate.get(a.getWorkDate());
                if (r == null) {
                    if (a.getWorkDate().isBefore(today)) absent++;
                    continue;
                }
                if (r.getCheckInStatus() == CheckInStatus.LATE) late++; else onTime++;
                if (r.getCheckOutStatus() == CheckOutStatus.EARLY_LEAVE) early++;
                if (r.getCheckOutTime() == null && a.getWorkDate().isBefore(today)) missing++;
            }
            out.add(new MonthlyReportResponse(
                    e.getId(), e.getAccount().getFullName(), e.getDepartment().getName(),
                    onTime, late, early, absent, missing));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<AbsentEmployeeResponse> absentToday(Long departmentId) {
        LocalDate today = time.today();
        LocalDateTime now = time.now();
        List<AbsentEmployeeResponse> out = new ArrayList<>();

        List<ShiftAssignment> assignments = assignmentRepo.findByWorkDate(today).stream()
                .filter(a -> departmentId == null
                        || a.getEmployee().getDepartment().getId().equals(departmentId))
                .toList();

        for (var a : assignments) {
            LocalDateTime start = LocalDateTime.of(today, a.getShiftTemplate().getStartTime());
            if (!now.isAfter(start.plusMinutes(props.getGracePeriodMinutes()))) continue;
            if (attendanceRepo.existsByEmployeeIdAndWorkDate(a.getEmployee().getId(), today)) continue;
            out.add(new AbsentEmployeeResponse(
                    a.getEmployee().getId(),
                    a.getEmployee().getAccount().getFullName(),
                    a.getEmployee().getDepartment().getId(),
                    a.getEmployee().getDepartment().getName(),
                    a.getShiftTemplate().getName()));
        }
        return out;
    }
}