import * as React from 'react';

import { TicketManagement } from '~/components/organizations/slug/settings/organization/tickets/ticket-management';

export default async function TicketsPage(): Promise<React.JSX.Element> {
  return <TicketManagement />;
}
