import * as React from 'react';

// Minimal root layout - actual layout logic is in [locale]/layout.tsx
export default function RootLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return <>{children}</>;
}
