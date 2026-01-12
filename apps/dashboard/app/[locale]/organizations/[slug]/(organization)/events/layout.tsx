import * as React from 'react';

export default async function EventsLayout({
  children
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  return <>{children}</>;
}
