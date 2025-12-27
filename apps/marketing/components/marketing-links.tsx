import * as React from 'react';
import {
  BookIcon,
  BookOpenIcon,
  BoxIcon,
  CircuitBoardIcon,
  CodeIcon,
  CuboidIcon,
  FileBarChartIcon,
  LayoutIcon,
  PlayIcon,
  SendHorizonalIcon
} from 'lucide-react';

import { baseUrl, routes } from '@workspace/routes';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  XIcon
} from '@workspace/ui/components/brand-icons';

// Function to get menu links with translations
export const getMenuLinks = (t: (key: string) => string) => [
  {
    title: t('product'),
    items: [
      {
        title: t('features.feature1.title'),
        description: t('features.feature1.description'),
        icon: <BoxIcon className="size-5 shrink-0" />,
        href: '#',
        external: false
      },
      {
        title: t('features.feature2.title'),
        description: t('features.feature2.description'),
        icon: <PlayIcon className="size-5 shrink-0" />,
        href: '#',
        external: false
      },
      {
        title: t('features.feature3.title'),
        description: t('features.feature3.description'),
        icon: <CircuitBoardIcon className="size-5 shrink-0" />,
        href: '#',
        external: false
      },
      {
        title: t('features.feature4.title'),
        description: t('features.feature4.description'),
        icon: <LayoutIcon className="size-5 shrink-0" />,
        href: '#',
        external: false
      },
      {
        title: t('features.feature5.title'),
        description: t('features.feature5.description'),
        icon: <FileBarChartIcon className="size-5 shrink-0" />,
        href: '#',
        external: false
      }
    ]
  },
  {
    title: t('resources'),
    items: [
      {
        title: t('links.contact.title'),
        description: t('links.contact.description'),
        icon: <SendHorizonalIcon className="size-5 shrink-0" />,
        href: routes.marketing.Contact,
        external: false
      },
      {
        title: t('links.roadmap.title'),
        description: t('links.roadmap.description'),
        icon: <LayoutIcon className="size-5 shrink-0" />,
        href: routes.marketing.Roadmap,
        external: true
      },
      {
        title: t('links.docs.title'),
        description: t('links.docs.description'),
        icon: <BookOpenIcon className="size-5 shrink-0" />,
        href: routes.marketing.Docs,
        external: false
      },
      {
        title: t('links.apiReference.title'),
        description: t('links.apiReference.description'),
        icon: <CodeIcon className="size-5 shrink-0" />,
        href: baseUrl.PublicApi,
        external: true
      }
    ]
  },
  {
    title: t('pricing'),
    href: routes.marketing.Pricing,
    external: false
  },
  {
    title: t('blog'),
    href: routes.marketing.Blog,
    external: false
  },
  {
    title: t('story'),
    href: routes.marketing.Story,
    external: false
  }
];

// For backward compatibility, keep a default export
export const MENU_LINKS = getMenuLinks((key) => key);

// Function to get footer links with translations
// Expects t to be scoped to 'footer' namespace
export const getFooterLinks = (t: (key: string) => string) => [
  {
    title: t('product'),
    links: [
      { name: t('features.feature1'), href: '#', external: false },
      { name: t('features.feature2'), href: '#', external: false },
      { name: t('features.feature3'), href: '#', external: false },
      { name: t('features.feature4'), href: '#', external: false },
      { name: t('features.feature5'), href: '#', external: false }
    ]
  },
  {
    title: t('resources'),
    links: [
      { name: t('links.contact'), href: routes.marketing.Contact, external: false },
      { name: t('links.roadmap'), href: routes.marketing.Roadmap, external: true },
      { name: t('links.docs'), href: routes.marketing.Docs, external: false },
      { name: t('links.apiReference'), href: baseUrl.PublicApi, external: true }
    ]
  },
  {
    title: t('about'),
    links: [
      { name: t('links.story'), href: routes.marketing.Story, external: false },
      { name: t('links.blog'), href: routes.marketing.Blog, external: false },
      { name: t('links.careers'), href: routes.marketing.Careers, external: false }
    ]
  },
  {
    title: t('legal'),
    links: [
      {
        name: t('links.termsOfUse'),
        href: routes.marketing.TermsOfUse,
        external: false
      },
      {
        name: t('links.privacyPolicy'),
        href: routes.marketing.PrivacyPolicy,
        external: false
      },
      {
        name: t('links.cookiePolicy'),
        href: routes.marketing.CookiePolicy,
        external: false
      }
    ]
  }
];

export const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { name: 'Feature 1', href: '#', external: false },
      { name: 'Feature 2', href: '#', external: false },
      { name: 'Feature 3', href: '#', external: false },
      { name: 'Feature 4', href: '#', external: false },
      { name: 'Feature 5', href: '#', external: false }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Contact', href: routes.marketing.Contact, external: false },
      { name: 'Roadmap', href: routes.marketing.Roadmap, external: true },
      { name: 'Docs', href: routes.marketing.Docs, external: false },
      { name: 'API Reference', href: baseUrl.PublicApi, external: true }
    ]
  },
  {
    title: 'About',
    links: [
      { name: 'Story', href: routes.marketing.Story, external: false },
      { name: 'Blog', href: routes.marketing.Blog, external: false },
      { name: 'Careers', href: routes.marketing.Careers, external: false }
    ]
  },
  {
    title: 'Legal',
    links: [
      {
        name: 'Terms of Use',
        href: routes.marketing.TermsOfUse,
        external: false
      },
      {
        name: 'Privacy Policy',
        href: routes.marketing.PrivacyPolicy,
        external: false
      },
      {
        name: 'Cookie Policy',
        href: routes.marketing.CookiePolicy,
        external: false
      }
    ]
  }
];

export const SOCIAL_LINKS = [
  {
    name: 'X (formerly Twitter)',
    href: '~/',
    icon: <XIcon className="size-4 shrink-0" />
  },
  {
    name: 'LinkedIn',
    href: '~/',
    icon: <LinkedInIcon className="size-4 shrink-0" />
  },
  {
    name: 'Facebook',
    href: '~/',
    icon: <FacebookIcon className="size-4 shrink-0" />
  },
  {
    name: 'Instagram',
    href: '~/',
    icon: <InstagramIcon className="size-4 shrink-0" />
  },
  {
    name: 'TikTok',
    href: '~/',
    icon: <TikTokIcon className="size-4 shrink-0" />
  }
];

export const DOCS_LINKS = [
  {
    title: 'Getting Started',
    icon: <CuboidIcon className="size-4 shrink-0 text-muted-foreground" />,
    items: [
      {
        title: 'Introduction',
        href: '/docs',
        items: []
      },
      {
        title: 'Dependencies',
        href: '/docs/dependencies',
        items: []
      }
    ]
  },
  {
    title: 'Guides',
    icon: <BookIcon className="size-4 shrink-0 text-muted-foreground" />,
    items: [
      {
        title: 'Using MDX',
        href: '/docs/using-mdx',
        items: []
      }
    ]
  }
];
