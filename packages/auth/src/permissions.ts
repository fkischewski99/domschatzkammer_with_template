import { NotFoundError } from '@workspace/common/errors';
import { Role } from '@workspace/database';
import { prisma } from '@workspace/database/client';

export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { isOwner: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.isOwner;
}

export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { role: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.role === Role.ADMIN;
}

export async function isOrganizationMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { role: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.role === Role.MEMBER;
}

export async function isOrganizationGuide(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { role: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.role === Role.GUIDE;
}

export async function isOrganizationGuideOrAbove(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { role: true, isOwner: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return (
    membership.isOwner ||
    membership.role === Role.ADMIN ||
    membership.role === Role.GUIDE
  );
}

export async function isOrganizationAdminOrAbove(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { role: true, isOwner: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.isOwner || membership.role === Role.ADMIN;
}
