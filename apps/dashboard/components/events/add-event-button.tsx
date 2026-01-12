'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@workspace/ui/components/button';

export type AddEventButtonProps = {
  organizationSlug: string;
};

export function AddEventButton({
  organizationSlug
}: AddEventButtonProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events');
  const router = useRouter();

  const handleClick = (): void => {
    router.push(`/de/organizations/${organizationSlug}/events/create`);
  };

  return (
    <Button
      type="button"
      variant="default"
      size="default"
      className="whitespace-nowrap"
      onClick={handleClick}
    >
      {t('createEvent')}
    </Button>
  );
}
