const logger = require('../utils/logger');

class NotificationService {
  async sendOrderConfirmation(order, customer) {
    // TODO: Implement email/SMS/WhatsApp notification
    logger.info(`Order confirmation sent: ${order.altOrderId} to ${customer.email}`);
  }

  async sendShipmentUpdate(order, shipment) {
    logger.info(`Shipment update sent: ${shipment.trackingNumber}`);
  }

  async sendPaymentFailure(order, customer) {
    logger.info(`Payment failure notification: ${order.altOrderId}`);
  }

  async sendWelcomeEmail(customer) {
    logger.info(`Welcome email sent to: ${customer.email}`);
  }
}

module.exports = new NotificationService();