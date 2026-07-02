import { Prisma } from '@prisma/client';
import {
  allocatePoNumber,
  formatPoNumber,
  isPoNumberConflict,
} from './po-number.helper';

describe('po-number.helper', () => {
  describe('formatPoNumber', () => {
    it('zero-pads the sequence', () => {
      expect(formatPoNumber(42)).toBe('PO-000042');
      expect(formatPoNumber(42, 'PO-AUTO')).toBe('PO-AUTO-000042');
    });
  });

  describe('allocatePoNumber', () => {
    it('reads the next sequence value inside a transaction', async () => {
      const tx = {
        $queryRaw: jest
          .fn()
          .mockResolvedValue([{ nextval: BigInt(7) }]),
      };

      await expect(allocatePoNumber(tx, 'PO')).resolves.toBe('PO-000007');
      expect(tx.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('isPoNumberConflict', () => {
    it('detects unique violations on poNumber', () => {
      const err = new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['poNumber'] },
      });
      expect(isPoNumberConflict(err)).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(isPoNumberConflict(new Error('nope'))).toBe(false);
    });
  });
});
