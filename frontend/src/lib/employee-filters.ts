import type { EmploymentType, Role, User } from "@/types/api";

export type EmployeeRoleFilter = "ALL" | Role;
export type EmploymentTypeFilter = "ALL" | EmploymentType;
export type EmployeeRateFilter = "ALL" | "missing-rate";

export function employeeHasMissingRate(user: User): boolean {
  return user.hourlyRate == null || Number(user.hourlyRate) <= 0;
}

export function summarizeEmployees(users: User[]) {
  let managers = 0;
  let staff = 0;
  let superAdmins = 0;
  let missingRate = 0;
  let fullTime = 0;
  let partTime = 0;

  for (const user of users) {
    switch (user.role) {
      case "SUPER_ADMIN":
        superAdmins += 1;
        break;
      case "MANAGER":
        managers += 1;
        break;
      case "STAFF":
        staff += 1;
        break;
    }
    if (employeeHasMissingRate(user)) missingRate += 1;
    if (user.employmentType === "FULL_TIME") fullTime += 1;
    if (user.employmentType === "PART_TIME") partTime += 1;
  }

  return {
    total: users.length,
    superAdmins,
    managers,
    staff,
    missingRate,
    fullTime,
    partTime,
  };
}

export function matchesEmployeeRoleFilter(user: User, filter: EmployeeRoleFilter): boolean {
  return filter === "ALL" || user.role === filter;
}

export function matchesEmploymentTypeFilter(
  user: User,
  filter: EmploymentTypeFilter,
): boolean {
  return filter === "ALL" || user.employmentType === filter;
}

export function matchesEmployeeRateFilter(user: User, filter: EmployeeRateFilter): boolean {
  if (filter === "ALL") return true;
  return employeeHasMissingRate(user);
}

export function matchesEmployeeSearch(user: User, search: string): boolean {
  if (!search) return true;
  const haystack = [
    user.name ?? "",
    user.email,
    user.role,
    user.employmentType ?? "",
    user.branch?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterEmployees(
  users: User[],
  options: {
    search: string;
    roleFilter: EmployeeRoleFilter;
    employmentTypeFilter: EmploymentTypeFilter;
    rateFilter: EmployeeRateFilter;
  },
): User[] {
  return users.filter(
    (user) =>
      matchesEmployeeSearch(user, options.search) &&
      matchesEmployeeRoleFilter(user, options.roleFilter) &&
      matchesEmploymentTypeFilter(user, options.employmentTypeFilter) &&
      matchesEmployeeRateFilter(user, options.rateFilter),
  );
}
