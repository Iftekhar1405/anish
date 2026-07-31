import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../prisma/prisma.service';

interface FakeUser {
  id: string;
  phone: string;
  role: Role;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `id_${idCounter}`;
}

function createFakePrisma() {
  const users: FakeUser[] = [];

  function matchesWhere(user: FakeUser, where: any): boolean {
    if (where.role !== undefined && user.role !== where.role) return false;
    if (where.id !== undefined && user.id !== where.id) return false;
    if (where.OR) {
      const matchesAny = where.OR.some((clause: any) => {
        if (clause.name?.contains !== undefined) {
          return user.name?.toLowerCase().includes(clause.name.contains.toLowerCase()) ?? false;
        }
        if (clause.phone?.contains !== undefined) {
          return user.phone.toLowerCase().includes(clause.phone.contains.toLowerCase());
        }
        return false;
      });
      if (!matchesAny) return false;
    }
    return true;
  }

  return {
    user: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.phone_role) {
          return (
            users.find(
              (u) => u.phone === where.phone_role.phone && u.role === where.phone_role.role,
            ) ?? null
          );
        }
        if (where.id) return users.find((u) => u.id === where.id) ?? null;
        return null;
      }),
      findFirst: jest.fn(async ({ where }: any) => {
        return users.find((u) => matchesWhere(u, where)) ?? null;
      }),
      findMany: jest.fn(async ({ where, orderBy, skip = 0, take }: any) => {
        let rows = users.filter((u) => matchesWhere(u, where));
        const [sortKey] = Object.keys(orderBy);
        const dir = orderBy[sortKey];
        rows = [...rows].sort((a, b) => {
          const av = (a as any)[sortKey];
          const bv = (b as any)[sortKey];
          if (av < bv) return dir === 'asc' ? -1 : 1;
          if (av > bv) return dir === 'asc' ? 1 : -1;
          return 0;
        });
        return rows.slice(skip, take ? skip + take : undefined);
      }),
      count: jest.fn(async ({ where }: any) => {
        return users.filter((u) => matchesWhere(u, where)).length;
      }),
      create: jest.fn(async ({ data }: any) => {
        const user: FakeUser = {
          id: nextId(),
          phone: data.phone,
          role: data.role,
          name: data.name ?? null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        users.push(user);
        return user;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const user = users.find((u) => u.id === where.id);
        if (!user) throw new Error('user not found');
        if (data.name !== undefined) user.name = data.name;
        if (data.isActive !== undefined) user.isActive = data.isActive;
        return user;
      }),
    },
  };
}

describe('AdminUsersService', () => {
  let service: AdminUsersService;

  beforeEach(() => {
    service = new AdminUsersService(createFakePrisma() as unknown as PrismaService);
  });

  it('scopes list() to the given role only', async () => {
    await service.create(Role.FARMER, { phone: '+911111111111', name: 'Farmer One' });
    await service.create(Role.FARMER, { phone: '+912222222222', name: 'Farmer Two' });
    await service.create(Role.TECHNICIAN, { phone: '+913333333333', name: 'Tech One' });

    const result = await service.list(Role.FARMER, {});
    expect(result.total).toBe(2);
    expect(result.items.every((item) => item.role === Role.FARMER)).toBe(true);
  });

  it('filters by search across name and phone', async () => {
    await service.create(Role.FARMER, { phone: '+911111111111', name: 'Ramesh Kumar' });
    await service.create(Role.FARMER, { phone: '+912222222222', name: 'Suresh Patel' });

    const byName = await service.list(Role.FARMER, { search: 'ramesh' });
    expect(byName.total).toBe(1);
    expect(byName.items[0].name).toBe('Ramesh Kumar');

    const byPhone = await service.list(Role.FARMER, { search: '2222222222' });
    expect(byPhone.total).toBe(1);
    expect(byPhone.items[0].name).toBe('Suresh Patel');
  });

  it('paginates and reports pageCount correctly', async () => {
    for (let i = 0; i < 5; i += 1) {
      await service.create(Role.FARMER, { phone: `+9111111111${i}`, name: `Farmer ${i}` });
    }
    const page1 = await service.list(Role.FARMER, { page: 1, pageSize: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.pageCount).toBe(3);
    expect(page1.total).toBe(5);
  });

  it('sorts by name in the requested direction', async () => {
    await service.create(Role.FARMER, { phone: '+911111111111', name: 'Zed' });
    await service.create(Role.FARMER, { phone: '+912222222222', name: 'Amit' });

    const asc = await service.list(Role.FARMER, { sortBy: 'name', sortDir: 'asc' });
    expect(asc.items.map((item) => item.name)).toEqual(['Amit', 'Zed']);
  });

  it('rejects creating a duplicate phone+role account', async () => {
    await service.create(Role.FARMER, { phone: '+911111111111', name: 'Farmer One' });
    await expect(
      service.create(Role.FARMER, { phone: '+911111111111', name: 'Duplicate' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows the same phone for different roles', async () => {
    await service.create(Role.FARMER, { phone: '+911111111111', name: 'Farmer One' });
    await expect(
      service.create(Role.TECHNICIAN, { phone: '+911111111111', name: 'Tech One' }),
    ).resolves.toMatchObject({ role: Role.TECHNICIAN });
  });

  it('updates name and deactivates/reactivates', async () => {
    const created = await service.create(Role.FARMER, {
      phone: '+911111111111',
      name: 'Farmer One',
    });

    const renamed = await service.update(Role.FARMER, created.id, { name: 'Renamed Farmer' });
    expect(renamed.name).toBe('Renamed Farmer');

    const deactivated = await service.update(Role.FARMER, created.id, { isActive: false });
    expect(deactivated.isActive).toBe(false);

    const reactivated = await service.update(Role.FARMER, created.id, { isActive: true });
    expect(reactivated.isActive).toBe(true);
  });

  it('throws NotFoundException for an unknown id', async () => {
    await expect(
      service.update(Role.FARMER, 'does-not-exist', { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not allow updating a user through the wrong role scope', async () => {
    const technician = await service.create(Role.TECHNICIAN, {
      phone: '+913333333333',
      name: 'Tech One',
    });
    await expect(
      service.update(Role.FARMER, technician.id, { name: 'Hijacked' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
