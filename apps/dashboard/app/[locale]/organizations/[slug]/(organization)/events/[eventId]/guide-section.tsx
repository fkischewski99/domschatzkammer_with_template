'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UserPlus, X } from 'lucide-react';

import { AnnotatedSection } from '@workspace/ui/components/annotated';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';

import { AssignGuideModal } from '~/components/events/assign-guide-modal';
import { unassignGuideFromEvent } from '~/actions/events/admin/unassign-guide-from-event';
import type { GuideForAssignment } from '~/data/events/get-available-guides-for-event';

interface Guide {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface GuideSectionProps {
  eventId: string;
  eventName: string;
  guide: Guide | null;
  availableGuides: GuideForAssignment[];
  isCancelled: boolean;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function GuideSection({
  eventId,
  eventName,
  guide,
  availableGuides,
  isCancelled,
}: GuideSectionProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events.guide');
  const router = useRouter();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemoveGuide = async () => {
    setIsRemoving(true);
    try {
      await unassignGuideFromEvent({ eventId });
      router.refresh();
    } catch (error) {
      console.error('Failed to remove guide:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAssignSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <AnnotatedSection
        title={t('title')}
        description={t('description')}
      >
        {guide ? (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {guide.image && <AvatarImage src={guide.image} alt={guide.name || ''} />}
                  <AvatarFallback>{getInitials(guide.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{guide.name || guide.email}</p>
                  {guide.name && (
                    <p className="text-sm text-muted-foreground">{guide.email}</p>
                  )}
                </div>
              </div>
              {!isCancelled && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalOpen(true)}
                  >
                    {t('change')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveGuide}
                    disabled={isRemoving}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">{t('unassign')}</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <p className="text-muted-foreground">{t('noGuide')}</p>
              {!isCancelled && (
                <Button onClick={() => setModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('assign')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </AnnotatedSection>

      <AssignGuideModal
        eventId={eventId}
        eventName={eventName}
        guides={availableGuides}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleAssignSuccess}
      />
    </>
  );
}
