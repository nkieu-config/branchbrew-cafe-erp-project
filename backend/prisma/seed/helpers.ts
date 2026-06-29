export function dateMinutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

export function dateDaysAgo(days: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

export function dateAtDayOffset(dayOffset: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

export function shiftWindow(dayOffset: number, startHour: number, endHour: number) {
  return {
    startTime: dateAtDayOffset(dayOffset, startHour),
    endTime: dateAtDayOffset(dayOffset, endHour),
  };
}

export function settlementDifference(
  expected: { cash: number; card: number; qr: number },
  actual: { cash: number; card: number; qr: number },
): number {
  const totalExpected = expected.cash + expected.card + expected.qr;
  const totalActual = actual.cash + actual.card + actual.qr;
  return Math.round((totalActual - totalExpected) * 100) / 100;
}
