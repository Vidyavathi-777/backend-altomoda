// services/cloudstore.service.js
const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

class CloudStoreService {
  constructor() {
    this.client = axios.create({
      baseURL: config.cloudstore.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.cloudstore.shopAuthToken}`, 
        'Content-Type': 'application/json',
      },
      timeout: config.cloudstore.timeoutMs || 100000,
    });

    // --- Simple rate-limit window ---
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.maxRequests = 100;    // adjust if CloudStore docs specify lower/higher
    this.windowMs = 60000;
  }

  /** --- Internal rate limit window --- **/
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

  /** --- Generic request wrapper with retry + exponential backoff --- **/
  async makeRequest(method, endpoint, data = null, options = {}, attempt = 1) {
    await this.waitForRateLimit();
    try {
      const response = await this.client.request({ method, url: endpoint, data, ...options });
      logger.info(`CloudStore ${method.toUpperCase()} ${endpoint} → ${response.status}`);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message;

      logger.error(`CloudStore API Error (${status}): ${msg}`, {
        endpoint,
        data: error.response?.data,
      });

      // 429 rate limit or network error → backoff retry
      if ((status === 429 || !status) && attempt < (config.cloudstore.retryAttempts || 3)) {
        const delay = Math.pow(2, attempt) * 500;
        logger.warn(`Retrying CloudStore ${endpoint} in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise(res => setTimeout(res, delay));
        return this.makeRequest(method, endpoint, data, options, attempt + 1);
      }

      throw new ApiError(status || 500, msg || 'CloudStore API error');
    }
  }

  /* =============================
   *        CATALOG APIs
   * ============================= */

async getFullCatalog(pageIndex = 1, pageSize = 20) {
  const url = `${config.cloudstore.baseUrl}/shop/v1/items?_pageIndex=${pageIndex}&_pageSize=${pageSize}`;
  
  const res = await this.client.get(url, {
    headers: {
      Authorization: `Bearer ${config.cloudstore.shopAuthToken}`,
      Accept: "application/json",
      "Accept-Encoding": "gzip, br",
    },
    decompress: true,
    timeout: 300000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return res.data;
}

  async getCatalogWithQuantities(sinceTimestamp = null, page = 1) {
    const params = { withQuantities: true, page };
    if (sinceTimestamp) params.since = sinceTimestamp;
    return this.makeRequest('GET', `/shop/v1/items`, null, { params });
  }

  async searchByTerm(term) {
    return this.makeRequest('GET', `/shop/v1/items/listBySearchTerm`, null, { params: { term } });
  }

  async findByCode(sku) {
    return this.makeRequest('GET', `/shop/v1/items/findByCode`, null, { params: { code: sku } });
  }

  /* =============================
   *        ORDER APIs
   * ============================= */

// In services/cloudstore.service.js - KEEP THE WRAPPING

async createOrder(orderData) {
  logger.info(`Creating CloudStore order: ${orderData?.shop_order_id}`);
  
  // The API expects the order data wrapped in "order" property
  const payload = {
    order: orderData
  };
  
  return this.makeRequest('POST', `/shop/v1/orders`, payload);
}

async updateOrder(cloudstoreOrderId, updateData) {
  logger.info(`Updating CloudStore order ${cloudstoreOrderId}`);
  
  // For PATCH, also wrap the update data
  const payload = {
    order: updateData
  };
  
  return this.makeRequest('PATCH', `/shop/v1/orders/${encodeURIComponent(cloudstoreOrderId)}`, payload);
}

  async confirmOrder(cloudstoreOrderId) {
    return this.updateOrder(cloudstoreOrderId, { order_status: 'CONFIRMED' });
  }

  async cancelOrder(cloudstoreOrderId) {
    return this.updateOrder(cloudstoreOrderId, { order_status: 'CANCELED' });
  }

  async deleteOrder(cloudstoreOrderId) {
    logger.info(`Deleting CloudStore order ${cloudstoreOrderId}`);
    return this.makeRequest('DELETE', `/shop/v1/orders/${encodeURIComponent(cloudstoreOrderId)}`);
  }

  /* =============================
   *        EVENT & INVENTORY
   * ============================= */

  async getEvents(sinceTimestamp = null) {
    const params = {};
    if (sinceTimestamp) params.since = sinceTimestamp;
    return this.makeRequest('GET', `/shop/v1/events`, null, { params });
  }

  async startInventoryExport() {
    return this.makeRequest('POST', `/shop/v1/inventory-catalog/start`);
  }

  async uploadInventoryPage(token, pageData) {
    return this.makeRequest('POST', `/shop/v1/inventory-catalog/page`, { token, data: pageData });
  }

  async finishInventoryExport(token) {
    return this.makeRequest('POST', `/shop/v1/inventory-catalog/finish`, { token });
  }
}

module.exports = new CloudStoreService();
