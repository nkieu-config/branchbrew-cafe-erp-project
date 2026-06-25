import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('HrController branch scope', () => {
  const managerUser = {
    userId: 10,
    email: 'mgr@test.com',
    role: 'MANAGER' as const,
    branchId: 2,
  };

  async function createController(hrService: Partial<HrService>) {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrController],
      providers: [{ provide: HrService, useValue: hrService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    return module.get(HrController);
  }

  it('rejects clock-in to another branch', async () => {
    const controller = await createController({ clockIn: jest.fn() });

    expect(() =>
      controller.clockIn({ user: managerUser } as any, { branchId: 99 }),
    ).toThrow(ForbiddenException);
  });

  it('allows clock-in to own branch', async () => {
    const hrService = { clockIn: jest.fn().mockResolvedValue({ id: 1 }) };
    const controller = await createController(hrService);

    await controller.clockIn({ user: managerUser } as any, { branchId: 2 });

    expect(hrService.clockIn).toHaveBeenCalledWith(10, 2);
  });
});
