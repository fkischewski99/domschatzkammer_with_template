/**
 * PDF Ticket Template
 * React component for generating ticket PDFs using @react-pdf/renderer
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

export interface TicketTemplateProps {
  organizationName: string;
  organizationLogo?: string;
  ticketTypeName: string;
  ticketDescription?: string;
  ticketFeatures: string[];
  customerName?: string;
  customerEmail: string;
  purchaseDate: string;
  ticketNumber: string;
  qrCodeDataURL: string;
  validFrom?: string;
  validUntil?: string;
  price: string;
  currency: string;
  isComplimentary?: boolean;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #E5E7EB',
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
    marginBottom: 10,
  },
  organizationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    width: 120,
  },
  value: {
    fontSize: 10,
    color: '#111827',
    flex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  qrLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
  features: {
    marginTop: 10,
  },
  feature: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #E5E7EB',
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  termsText: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  complimentaryBadge: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    padding: '6 12',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
});

export function TicketTemplate(props: TicketTemplateProps): React.ReactElement {
  const {
    organizationName,
    organizationLogo,
    ticketTypeName,
    ticketDescription,
    ticketFeatures,
    customerName,
    customerEmail,
    purchaseDate,
    ticketNumber,
    qrCodeDataURL,
    validFrom,
    validUntil,
    price,
    currency,
    isComplimentary,
  } = props;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {organizationLogo && <Image src={organizationLogo} style={styles.logo} />}
          <Text style={styles.organizationName}>{organizationName}</Text>
          <Text style={styles.ticketTitle}>{ticketTypeName}</Text>
          {ticketDescription && (
            <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>
              {ticketDescription}
            </Text>
          )}
          {isComplimentary && (
            <View style={styles.complimentaryBadge}>
              <Text>COMPLIMENTARY TICKET</Text>
            </View>
          )}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          {customerName && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{customerName}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{customerEmail}</Text>
          </View>
        </View>

        {/* Ticket Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ticket Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ticket Number:</Text>
            <Text style={styles.value}>{ticketNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Purchase Date:</Text>
            <Text style={styles.value}>{purchaseDate}</Text>
          </View>
          {!isComplimentary && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Price:</Text>
              <Text style={styles.value}>{`${price} ${currency}`}</Text>
            </View>
          )}
          {validFrom && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Valid From:</Text>
              <Text style={styles.value}>{validFrom}</Text>
            </View>
          )}
          {validUntil && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Valid Until:</Text>
              <Text style={styles.value}>{validUntil}</Text>
            </View>
          )}

          {ticketFeatures.length > 0 && (
            <View style={styles.features}>
              <Text style={styles.sectionTitle}>Included Features:</Text>
              {ticketFeatures.map((feature, index) => (
                <Text key={index} style={styles.feature}>
                  • {feature}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <Image src={qrCodeDataURL} style={styles.qrCode} />
          <Text style={styles.qrLabel}>
            Scan this QR code for ticket validation
          </Text>
        </View>

        {/* Footer / Terms */}
        <View style={styles.footer}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            This ticket is valid only for the specified date range (if applicable) and cannot be
            transferred or refunded unless stated otherwise by the organization. Please present
            this ticket (printed or digital) along with a valid ID for entry. The organization
            reserves the right to refuse entry if this ticket is deemed invalid or has been
            refunded. For questions or support, please contact the organization directly.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
