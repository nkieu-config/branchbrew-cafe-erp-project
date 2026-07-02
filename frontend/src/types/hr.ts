import type { components } from './generated/api';

export type AttendanceRecord =
  components['schemas']['AttendanceRecordResponseDto'];

export type Shift = components['schemas']['ShiftResponseDto'];

export type LeaveRequest = components['schemas']['LeaveRequestResponseDto'];

export type Payslip = components['schemas']['PayslipResponseDto'];

export type PayrollRun = components['schemas']['PayrollRunResponseDto'];

export type HrUser = components['schemas']['HrUserResponseDto'];

/** Organization / HR user list item (same shape as HrUserResponseDto). */
export type User = HrUser;

export type HrUserSummary = components['schemas']['HrUserSummaryDto'];

export type LeaveRequestUserSummary =
  components['schemas']['LeaveRequestUserSummaryDto'];
