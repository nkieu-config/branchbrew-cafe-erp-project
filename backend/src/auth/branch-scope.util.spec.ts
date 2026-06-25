import { ForbiddenException } from '@nestjs/common';
import {
  assertBranchAccess,
  resolveBranchId,
  resolveOptionalBranchId,
} from './branch-scope.util';

const manager = { userId: 1, role: 'MANAGER' as const, branchId: 2 };
const admin = { userId: 9, role: 'SUPER_ADMIN' as const, branchId: 1 };

describe('branch-scope.util', () => {
  describe('resolveBranchId', () => {
    it('returns own branch for non-admin when no branch requested', () => {
      expect(resolveBranchId(manager)).toBe(2);
    });

    it('throws when non-admin requests another branch', () => {
      expect(() => resolveBranchId(manager, 5)).toThrow(ForbiddenException);
    });

    it('allows super admin to request any branch', () => {
      expect(resolveBranchId(admin, 7)).toBe(7);
    });
  });

  describe('resolveOptionalBranchId', () => {
    it('returns undefined for super admin without branch filter', () => {
      expect(resolveOptionalBranchId(admin)).toBeUndefined();
    });

    it('scopes non-admin to own branch', () => {
      expect(resolveOptionalBranchId(manager)).toBe(2);
    });
  });

  describe('assertBranchAccess', () => {
    it('allows access to own branch', () => {
      expect(() => assertBranchAccess(manager, 2)).not.toThrow();
    });

    it('denies cross-branch access', () => {
      expect(() => assertBranchAccess(manager, 3)).toThrow(ForbiddenException);
    });
  });
});
