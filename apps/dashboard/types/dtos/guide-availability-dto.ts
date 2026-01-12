import type { AvailabilityStatus } from '@workspace/database';

export type GuideAvailabilityDto = {
  id: string;
  date: string;
  status: AvailabilityStatus;
  notes: string | null;
};

export type GuideWithAvailabilityDto = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  availabilities: GuideAvailabilityDto[];
};
