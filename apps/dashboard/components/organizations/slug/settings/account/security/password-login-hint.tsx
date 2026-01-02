import * as React from 'react';
import { InfoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';

export function PasswordLoginHint({
  className,
  ...other
}: React.HtmlHTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const t = useTranslations('account.security');

  return (
    <div
      className={cn('max-w-4xl px-6', className)}
      {...other}
    >
      <Alert>
        <InfoIcon className="size-[18px] shrink-0" />
        <AlertDescription className="inline">
          {t('passwordLoginHint')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
