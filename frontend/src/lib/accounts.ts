import type { Account, AccountTreeGroup } from '@/types/api';

export function groupAccountsByType(accounts: Account[]): AccountTreeGroup[] {
  const grouped = accounts.reduce<Record<string, AccountTreeGroup>>((acc, account) => {
    const type = account.type;
    if (!acc[type]) {
      acc[type] = {
        id: `GROUP_${type}`,
        code: '',
        name: type.charAt(0) + type.slice(1).toLowerCase() + 's',
        type,
        isGroup: true,
        children: [],
      };
    }
    acc[type].children.push(account);
    return acc;
  }, {});

  return Object.values(grouped).map((group) => {
    group.children.sort((a, b) => a.code.localeCompare(b.code));
    return group;
  });
}
