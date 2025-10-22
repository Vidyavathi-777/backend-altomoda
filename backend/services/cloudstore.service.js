const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

class CloudStoreService {
  constructor() {
    this.client = axios.create({
      baseURL: config.cloudstore.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.cloudstore.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.requestQueue = [];
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.maxRequests = 100;
    this.windowMs = 60000;
  }

  async waitForRateLimit() {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.windowStart);
      logger.warn(`CloudStore rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
  }

  async makeRequest(method, endpoint, data = null, config = {}) {
    await this.waitForRateLimit();

    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data,
        ...config,
      });

      logger.info(`CloudStore ${method} ${endpoint}: ${response.status}`);
      return response.data;
    } catch (error) {
      logger.error(`CloudStore API Error: ${error.message}`, {
        endpoint,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.makeRequest(method, endpoint, data, config);
      }

      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'CloudStore API error'
      );
    }
  }

// Get full catalog from CloudStore
// In your CloudStoreService class
async getFullCatalog(pageIndex = 1, pageSize = 20) {
  const url = `${config.cloudstore.apiUrl}/shop/v1/items?_pageIndex=${pageIndex}&_pageSize=${pageSize}`;
  logger.info(`Fetching from CloudStore URL: ${url}`);
  const response = await this.client.get(url, {
    headers: {
      Authorization: `Bearer ${config.cloudstore.apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}



  // Get catalog with quantities (delta sync)
  async getCatalogWithQuantities(sinceTimestamp = null, page = 1) {
    const params = { withQuantities: true, page };
    if (sinceTimestamp) {
      params.since = sinceTimestamp;
    }
    return this.makeRequest('GET', `/shop/v1/items`, null, { params });
  }

  // Search items by term
  async searchByTerm(term) {
    return this.makeRequest('GET', `/shop/v1/items/listBySearchTerm`, null, {
      params: { term },
    });
  }

  // Find product by SKU code
  async findByCode(sku) {
    return this.makeRequest('GET', `/shop/v1/items/findByCode`, null, {
      params: { code: sku },
    });
  }

  // Create order in CloudStore
  async createOrder(orderData) {
    return this.makeRequest('POST', `/shop/v1/orders`, orderData);
  }

  // Update order status
  async updateOrder(cloudstoreOrderId, updateData) {
    return this.makeRequest('PUT', `/shop/v1/orders/${cloudstoreOrderId}`, updateData);
  }

  // Confirm order (mark as CONFIRMED)
  async confirmOrder(cloudstoreOrderId) {
    return this.updateOrder(cloudstoreOrderId, { status: 'CONFIRMED' });
  }

  // Cancel order
  async cancelOrder(cloudstoreOrderId) {
    return this.updateOrder(cloudstoreOrderId, { status: 'CANCELLED' });
  }

  // Get events
  async getEvents(sinceTimestamp = null) {
    const params = {};
    if (sinceTimestamp) {
      params.since = sinceTimestamp;
    }
    return this.makeRequest('GET', `/shop/v1/events`, null, { params });
  }

  // Start inventory export
  async startInventoryExport() {
    return this.makeRequest('POST', `/shop/v1/inventory-catalog/start`);
  }

  // Upload inventory page
  async uploadInventoryPage(token, pageData) {
    return this.makeRequest('POST', `/shop/v1/inventory-catalog/page`, {
      token,
      data: pageData,
    });
  }

  // Finish inventory export
  async finishInventoryExport(token) {
    return this.makeRequest('POST', `/shop/v1/inventory-catalog/finish`, { token });
  }
}

module.exports = new CloudStoreService();