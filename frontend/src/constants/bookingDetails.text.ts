export const BOOKING_DETAILS_TEXT = {
  header: {
    title: "Booking Details",
    backAriaLabel: "Back to booking management",
  },

  sections: {
    basicInfo: {
      bookingId: "Booking ID",
      service: "Service",
      serviceId: "Service ID",
      serviceType: "Service Type",
      scheduledAt: "Scheduled At",
      customer: "Customer",
      customerPhone: "Customer Phone",
      customerEmail: "Customer Email",
      cancellationReason: "Cancellation Reason",
    },

    payment: {
      title: "Payment",
      status: "Payment Status",
      method: "Payment Method",
      gateway: "Payment Gateway",
      transactionId: "Transaction ID",
    },

    partnerCharges: {
      title: "Service Partner Charges & Commission",
      partnerCharges: "Partner Charges",
      commissionAmount: "Commission Amount",
      commissionPercent: "Commission %",
      partnerPayout: "Partner Payout",
    },

    customerPayment: {
      title: "Customer Payment Summary",
      subtotal: "Subtotal",
      tax: "Tax",
      discount: "Discount",
      total: "Total",
      paid: "Paid",
    },

    logs: {
      title: "Booking Logs",
      noLogs: "No logs",
      logsCount: (count: number) => `${count} log(s)`,
    },

    fallback: {
      missingBookingId: "Missing booking id.",
      empty: "-",
    },
  },
};
