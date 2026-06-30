import { dateAtDayOffset, dateDaysAgo, shiftWindow } from '../helpers';
import type { SeedContext } from '../types';

export async function seedHrAssetsDemo(ctx: SeedContext): Promise<void> {
  const { prisma, mainBranch, secondBranch, manager, staff } = ctx;

  console.log('Seeding HR & assets demo...');

  const staffMorningTomorrow = shiftWindow(1, 8, 16);
  const staffAfternoonLater = shiftWindow(2, 12, 20);
  const staffYesterdayShift = shiftWindow(-1, 8, 16);
  const managerTomorrowShift = shiftWindow(1, 10, 18);
  const asokAbsentShift = shiftWindow(0, 9, 17);

  await prisma.shift.createMany({
    data: [
      {
        userId: staff.id,
        branchId: mainBranch.id,
        startTime: staffMorningTomorrow.startTime,
        endTime: staffMorningTomorrow.endTime,
        status: 'SCHEDULED',
      },
      {
        userId: staff.id,
        branchId: mainBranch.id,
        startTime: staffAfternoonLater.startTime,
        endTime: staffAfternoonLater.endTime,
        status: 'SCHEDULED',
      },
      {
        userId: staff.id,
        branchId: mainBranch.id,
        startTime: staffYesterdayShift.startTime,
        endTime: staffYesterdayShift.endTime,
        status: 'COMPLETED',
      },
      {
        userId: manager.id,
        branchId: mainBranch.id,
        startTime: managerTomorrowShift.startTime,
        endTime: managerTomorrowShift.endTime,
        status: 'SCHEDULED',
      },
      {
        userId: manager.id,
        branchId: secondBranch.id,
        startTime: asokAbsentShift.startTime,
        endTime: asokAbsentShift.endTime,
        status: 'ABSENT',
      },
    ],
  });

  const staffYesterdayClockIn = dateAtDayOffset(-1, 8, 2);
  const staffYesterdayClockOut = dateAtDayOffset(-1, 16, 5);
  const staffTwoDaysClockIn = dateAtDayOffset(-2, 8, 0);
  const staffTwoDaysClockOut = dateAtDayOffset(-2, 15, 55);
  const managerActiveClockIn = dateAtDayOffset(0, 9, 15);

  await prisma.attendanceRecord.createMany({
    data: [
      {
        userId: staff.id,
        branchId: mainBranch.id,
        clockIn: staffYesterdayClockIn,
        clockOut: staffYesterdayClockOut,
        totalHours: 8,
      },
      {
        userId: staff.id,
        branchId: mainBranch.id,
        clockIn: staffTwoDaysClockIn,
        clockOut: staffTwoDaysClockOut,
        totalHours: 7.9,
      },
      {
        userId: manager.id,
        branchId: mainBranch.id,
        clockIn: managerActiveClockIn,
        clockOut: null,
        totalHours: null,
      },
    ],
  });

  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: staff.id,
        type: 'ANNUAL',
        startDate: dateDaysAgo(-5),
        endDate: dateDaysAgo(-3),
        reason: 'Family trip to Chiang Mai',
        status: 'PENDING',
      },
      {
        userId: manager.id,
        type: 'SICK',
        startDate: dateDaysAgo(4),
        endDate: dateDaysAgo(3),
        reason: 'Flu recovery day',
        status: 'APPROVED',
      },
    ],
  });

  const espressoMachine = await prisma.equipment.create({
    data: {
      branchId: mainBranch.id,
      name: 'La Marzocco Linea PB',
      type: 'ESPRESSO_MACHINE',
      serialNumber: 'LM-SIAM-001',
      status: 'ACTIVE',
      purchaseDate: dateDaysAgo(400),
      warrantyExpiry: dateDaysAgo(-180),
      nextMaintenanceDate: dateDaysAgo(-14),
    },
  });

  await prisma.equipment.createMany({
    data: [
      {
        branchId: mainBranch.id,
        name: 'Mazzer Major V Grinder',
        type: 'GRINDER',
        serialNumber: 'MZ-SIAM-002',
        status: 'ACTIVE',
        purchaseDate: dateDaysAgo(380),
        warrantyExpiry: dateDaysAgo(-120),
      },
      {
        branchId: mainBranch.id,
        name: 'Front Counter POS Terminal',
        type: 'POS_SYSTEM',
        serialNumber: 'POS-SIAM-01',
        status: 'MAINTENANCE',
        purchaseDate: dateDaysAgo(200),
        nextMaintenanceDate: dateDaysAgo(0),
      },
    ],
  });

  await prisma.maintenanceLog.createMany({
    data: [
      {
        equipmentId: espressoMachine.id,
        description: 'Group head gasket replacement and backflush',
        cost: 2800,
        performedBy: 'La Marzocco service partner',
        date: dateDaysAgo(45),
      },
      {
        equipmentId: espressoMachine.id,
        description: 'Quarterly boiler inspection',
        cost: 1500,
        performedBy: 'Downtown Manager',
        date: dateDaysAgo(10),
      },
    ],
  });
}
