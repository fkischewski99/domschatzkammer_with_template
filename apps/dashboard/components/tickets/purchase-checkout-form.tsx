'use client';

import { useState } from 'react';
import { createCheckoutSession } from '~/actions/tickets/create-checkout-session';

export interface PurchaseCheckoutFormProps {
  ticketId: string;
  organizationId: string;
  onCancel: () => void;
}

/**
 * Purchase Checkout Form
 * Collects customer info and redirects to Stripe Checkout
 */
export function PurchaseCheckoutForm({
  ticketId,
  organizationId,
  onCancel,
}: PurchaseCheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession({
        ticketId,
        organizationId,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName || undefined,
        customerPhone: formData.customerPhone || undefined,
        quantity: 1,
      });

      if (result.success && result.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.sessionUrl;
      } else {
        setError(result.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="customerEmail"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="customerEmail"
          required
          value={formData.customerEmail}
          onChange={(e) =>
            setFormData({ ...formData, customerEmail: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="customerName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name (optional)
        </label>
        <input
          type="text"
          id="customerName"
          value={formData.customerName}
          onChange={(e) =>
            setFormData({ ...formData, customerName: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label
          htmlFor="customerPhone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone (optional)
        </label>
        <input
          type="tel"
          id="customerPhone"
          value={formData.customerPhone}
          onChange={(e) =>
            setFormData({ ...formData, customerPhone: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+1234567890"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
}
