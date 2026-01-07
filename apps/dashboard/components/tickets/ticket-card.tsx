'use client';

import type { Ticket } from '@workspace/database';
import { useState } from 'react';
import { PurchaseCheckoutForm } from './purchase-checkout-form';

export interface TicketCardProps {
  ticket: Ticket;
  organizationId: string;
}

/**
 * Ticket Card Component
 * Displays ticket information with purchase button
 */
export function TicketCard({ ticket, organizationId }: TicketCardProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  const features = Array.isArray(ticket.features) ? ticket.features : [];
  const isAvailable =
    ticket.isActive && (ticket.stock === null || ticket.stock > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{ticket.name}</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {Number(ticket.price).toFixed(2)} {ticket.currency}
            </p>
          </div>
        </div>

        {ticket.description && (
          <p className="text-gray-600 mb-4">{ticket.description}</p>
        )}

        {features.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Includes:
            </h4>
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2">✓</span>
                  <span>{String(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {ticket.stock !== null && (
          <p className="text-sm text-gray-500 mb-4">
            {ticket.stock > 0
              ? `${ticket.stock} tickets available`
              : 'Sold out'}
          </p>
        )}

        {!isAvailable ? (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
          >
            Not Available
          </button>
        ) : !showCheckout ? (
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Purchase Ticket
          </button>
        ) : (
          <div className="mt-4">
            <PurchaseCheckoutForm
              ticketId={ticket.id}
              organizationId={organizationId}
              onCancel={() => setShowCheckout(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
