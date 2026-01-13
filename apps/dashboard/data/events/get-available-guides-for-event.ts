import 'server-only';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { isOrganizationAdminOrAbove } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { AvailabilityStatus, Role } from '@workspace/database';
import { prisma } from '@workspace/database/client';
import { startOfDay } from 'date-fns';

export interface GuideForAssignment {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAvailable: boolean;
  availabilityNote: string | null;
}

export async function getAvailableGuidesForEvent(
  eventId: string
): Promise<GuideForAssignment[]> {
  const ctx = await getAuthOrganizationContext();

  // Only admins can view available guides for assignment
  const canAccess = await isOrganizationAdminOrAbove(
    ctx.session.user.id,
    ctx.organization.id
  );
  if (!canAccess) {
    throw new ForbiddenError('Only admins can assign guides to events.');
  }

  // Get event details
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizationId: ctx.organization.id,
    },
  });

  if (!event) {
    throw new NotFoundError('Event not found');
  }

  const eventDate = startOfDay(event.startTime);

  // Get all guides in the organization with their availability for the event date
  const guides = await prisma.membership.findMany({
    where: {
      organizationId: ctx.organization.id,
      role: Role.GUIDE,
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          guideAvailabilities: {
            where: {
              organizationId: ctx.organization.id,
              date: eventDate,
            },
            select: {
              status: true,
              notes: true,
            },
          },
        },
      },
    },
  });

  return guides.map((g) => {
    const availability = g.user.guideAvailabilities[0];
    // If no availability set, consider them NOT available (they need to set their availability first)
    const isAvailable = availability?.status === AvailabilityStatus.AVAILABLE;

    return {
      id: g.user.id,
      name: g.user.name,
      email: g.user.email,
      image: g.user.image,
      isAvailable,
      availabilityNote: availability?.notes ?? null,
    };
  });
}
