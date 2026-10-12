'use strict';

/**
 * cultureframeAdapter.js
 *
 * Maps CultureMetrics data-access calls to actual CultureFrame API endpoints.
 * All endpoint paths are configurable. If CultureFrame uses different routes,
 * update the ENDPOINTS map — do not change analytics services.
 *
 * NOTE: These endpoints do not currently exist on CultureFrame.
 * See docs/CULTUREFRAME_API_CONTRACT.md for the required integration.
 */

const { cultureFrameClient } = require('./cultureframeClient');

// Configurable endpoint paths — update these to match the real CultureFrame routes
const ENDPOINTS = {
  overview: '/api/integrations/analytics/overview',
  orders: '/api/integrations/analytics/orders',
  products: '/api/integrations/analytics/products',
  customersSummary: '/api/integrations/analytics/customers/summary',
  events: '/api/integrations/analytics/events',
  heritage: '/api/integrations/analytics/heritage',
  scenic: '/api/integrations/analytics/scenic',
};

class CultureFrameAdapter {
  /**
   * Fetch high-level overview metrics from CultureFrame.
   */
  async getOverview(params = {}) {
    return cultureFrameClient.get(ENDPOINTS.overview, params);
  }

  /**
   * Fetch paginated orders. Supports startDate, endDate, page, limit.
   */
  async getOrders(params = {}) {
    return cultureFrameClient.get(ENDPOINTS.orders, params);
  }

  /**
   * Fetch paginated products.
   */
  async getProducts(params = {}) {
    return cultureFrameClient.get(ENDPOINTS.products, params);
  }

  /**
   * Fetch customer summary aggregates (no personal data).
   */
  async getCustomers(params = {}) {
    return cultureFrameClient.get(ENDPOINTS.customersSummary, params);
  }

  /**
   * Fetch events and registration counts.
   */
  async getEvents(params = {}) {
    return cultureFrameClient.get(ENDPOINTS.events, params);
  }

  /**
   * Fetch cultural heritage records.
   */
  async getHeritage(params = {}) {
    return cultureFrameClient.get(ENDPOINTS.heritage, params);
  }

  /**
   * Fetch scenic destination records.
   */
  async getScenicDestinations(params = {}) {
    return cultureFrameClient.get(ENDPOINTS.scenic, params);
  }

  /** Return the configured endpoint map (for documentation/status display) */
  getEndpoints() {
    return { ...ENDPOINTS };
  }
}

const cultureFrameAdapter = new CultureFrameAdapter();
module.exports = { cultureFrameAdapter };
