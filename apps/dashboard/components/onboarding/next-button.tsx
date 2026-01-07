import * as React from 'react';
import { useTranslations } from 'next-intl';

import { Button, type ButtonProps } from '@workspace/ui/components/button';

export type NextButtonProps = ButtonProps & {
  isLastStep: boolean;
};

export function NextButton({
  isLastStep,
  ...rest
}: NextButtonProps): React.JSX.Element {
  const t = useTranslations('onboarding.navigation');

  return (
    <div>
      <Button
        type="button"
        variant="default"
        className="mt-4"
        {...rest}
      >
        {isLastStep ? t('finish') : t('nextStep')}
      </Button>
    </div>
  );
}
