import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';
import { createE2eApp } from './e2e-app.util';
import { E2E_PASSWORD } from './e2e-fixtures.util';

const describeIfDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabase('HR user responses never expose credentials (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const adminEmail = 'hr-admin@e2e.test';
  const staffEmail = 'hr-staff@e2e.test';
  let branchId: number;
  let staffId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    prisma = app.get(PrismaService);

    const branch = await prisma.branch.create({
      data: { name: 'E2E HR Branch', location: 'Metro City' },
    });
    branchId = branch.id;

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'HR Admin',
        password: await bcrypt.hash(E2E_PASSWORD, 10),
        role: 'SUPER_ADMIN',
        branchId,
      },
    });

    const staff = await prisma.user.create({
      data: {
        email: staffEmail,
        name: 'HR Staff',
        password: await bcrypt.hash(E2E_PASSWORD, 10),
        role: 'STAFF',
        branchId,
      },
    });
    staffId = staff.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, staffEmail] } },
    });
    await prisma.branch.deleteMany({ where: { name: 'E2E HR Branch' } });
    await app?.close();
  });

  it('logs in through the real chain, proving the password stays readable server-side', async () => {
    const agent = request.agent(app.getHttpServer());

    const res = await agent
      .post('/auth/login')
      .send({ email: adminEmail, password: E2E_PASSWORD })
      .expect(200);

    expect(res.body.user).not.toHaveProperty('password');
  });

  it('updates an hourly rate without leaking the password hash or token version', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({ email: adminEmail, password: E2E_PASSWORD })
      .expect(200);

    const res = await agent
      .patch(`/hr/users/${staffId}/rate`)
      .send({ hourlyRate: 120 })
      .expect(200);

    expect(res.body.id).toBe(staffId);
    expect(Number(res.body.hourlyRate)).toBe(120);
    expect(res.body).not.toHaveProperty('password');
    expect(res.body).not.toHaveProperty('tokenVersion');
  });
});
