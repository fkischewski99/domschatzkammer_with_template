'use client';

import * as React from 'react';

import { LanguageSwitcher as LanguageSwitcherUI } from '@workspace/ui/components/language-switcher';

import { Link } from '~/src/i18n/navigation';
import { routing } from '~/src/i18n/routing';

export function LanguageSwitcher(): React.JSX.Element {
  return (
    <LanguageSwitcherUI
      locales={routing.locales}
      Link={Link}
    />
  );
}
