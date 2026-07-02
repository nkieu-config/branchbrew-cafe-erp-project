export type LeaveFieldErrors = {
  type?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
};

export type LeaveFieldValues = {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
};

export function validateLeaveFields(values: LeaveFieldValues): LeaveFieldErrors {
  const errors: LeaveFieldErrors = {};

  if (!values.leaveType) {
    errors.type = "Leave type is required";
  }
  if (!values.startDate) {
    errors.startDate = "Start date is required";
  }
  if (!values.endDate) {
    errors.endDate = "End date is required";
  }
  if (!values.reason.trim()) {
    errors.reason = "Reason is required";
  }

  if (values.startDate && values.endDate && values.startDate > values.endDate) {
    errors.endDate = "End date must be on or after start date";
  }

  return errors;
}
