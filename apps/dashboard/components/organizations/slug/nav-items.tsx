'use client';

import {
  BellIcon,
  CalendarIcon,
  CalendarDaysIcon,
  CodeIcon,
  CreditCardIcon,
  HomeIcon,
  LockKeyholeIcon,
  MapPinIcon,
  ReceiptIcon,
  SettingsIcon,
  StoreIcon,
  TicketIcon,
  UserIcon,
  UserPlus2Icon,
  UsersIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { replaceOrgSlug, routes } from '@workspace/routes';

type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon: LucideIcon;
};

export function createMainNavItems(slug: string): NavItem[] {
  const t = useTranslations('navigation');

  return [
    {
      title: t('home'),
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Home, slug),
      icon: HomeIcon
    },
    {
      title: t('events'),
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Events, slug),
      icon: CalendarIcon
    },
    {
      title: t('contacts'),
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Contacts, slug),
      icon: UsersIcon
    },
    {
      title: t('purchases'),
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Purchases, slug),
      icon: ReceiptIcon
    },
    {
      title: t('myAvailability'),
      href: replaceOrgSlug(routes.dashboard.organizations.slug.MyAvailability, slug),
      icon: CalendarDaysIcon
    },
    {
      title: t('settings'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.Index,
        slug
      ),
      icon: SettingsIcon
    }
  ];
}

export function createAccountNavItems(slug: string): NavItem[] {
  const t = useTranslations('navigation.account');

  return [
    {
      title: t('profile'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Profile,
        slug
      ),
      icon: UserIcon
    },
    {
      title: t('security'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Security,
        slug
      ),
      icon: LockKeyholeIcon
    },
    {
      title: t('notifications'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Notifications,
        slug
      ),
      icon: BellIcon
    }
  ];
}

export function createOrganizationNavItems(slug: string): NavItem[] {
  const t = useTranslations('navigation.organization');

  return [
    {
      title: t('general'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.General,
        slug
      ),
      icon: StoreIcon
    },
    {
      title: t('members'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Members,
        slug
      ),
      icon: UserPlus2Icon
    },
    {
      title: t('billing'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Billing,
        slug
      ),
      icon: CreditCardIcon
    },
    {
      title: t('tickets'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Tickets,
        slug
      ),
      icon: TicketIcon
    },
    {
      title: t('purchases'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Purchases,
        slug
      ),
      icon: ReceiptIcon
    },
    {
      title: t('locations'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Locations,
        slug
      ),
      icon: MapPinIcon
    },
    {
      title: t('guides'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Guides,
        slug
      ),
      icon: CalendarDaysIcon
    },
    {
      title: t('developers'),
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Developers,
        slug
      ),
      icon: CodeIcon
    }
  ];
}
