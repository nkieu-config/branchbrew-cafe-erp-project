export type ShiftFieldErrors = {
  employee?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
};

export type ShiftFieldValues = {
  userId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  hasStaffOptions: boolean;
};

export function validateShiftFields(values: ShiftFieldValues): ShiftFieldErrors {
  const errors: ShiftFieldErrors = {};

  if (values.hasStaffOptions && !values.userId) {
    errors.employee = "Employee is required";
  }
  if (!values.shiftDate) {
    errors.date = "Date is required";
  }
  if (!values.startTime) {
    errors.startTime = "Start time is required";
  }
  if (!values.endTime) {
    errors.endTime = "End time is required";
  }

  if (values.shiftDate && values.startTime && values.endTime) {
    const start = new Date(`${values.shiftDate}T${values.startTime}:00`);
    const end = new Date(`${values.shiftDate}T${values.endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      errors.date = errors.date ?? "Invalid date or time";
    } else if (end <= start) {
      errors.endTime = "End time must be after start time";
    }
  }

  return errors;
}
