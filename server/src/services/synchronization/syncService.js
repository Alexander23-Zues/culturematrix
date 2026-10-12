'use strict';

/**
 * syncService.js
 *
 * Handles on-demand synchronization of CultureFrame data.
 * Records every run in IntegrationSyncRun.
 * Prevents overlapping runs.
 * Preserves the last successful snapshot on failure.
 */

const { IntegrationSyncRun, AnalyticsSnapshot, IntegrationConfig } = require('../../models');
const { env } = require('../../config/environment');
const {
  fetchOrders,
  fetchProducts,
  fetchCustomers,
  fetchEvents,
  fetchHeritage,
  fetchScenicDestinations,
  fetchOverview,
} = require('../analytics/dataProvider');

let _runningSync = false;

async function isRunning() {
  return _runningSync;
}

async function triggerSync() {
  if (_runningSync) {
    throw Object.assign(new Error('A synchronization is already in progress. Please wait for it to finish.'), {
      code: 'SYNC_ALREADY_RUNNING',
      status: 409,
    });
  }

  _runningSync = true;

  const syncRun = await IntegrationSyncRun.create({
    providerName: 'cultureframe',
    startedAt: new Date(),
    status: 'running',
    dataMode: env.DATA_MODE,
  });

  let totalFetched = 0;
  let totalProcessed = 0;
  let totalRejected = 0;
  const errors = [];

  try {
    const tasks = [
      { key: 'overview', fn: fetchOverview },
      { key: 'orders', fn: fetchOrders },
      { key: 'products', fn: fetchProducts },
      { key: 'customers', fn: fetchCustomers },
      { key: 'events', fn: fetchEvents },
      { key: 'heritage', fn: fetchHeritage },
      { key: 'scenic', fn: fetchScenicDestinations },
    ];

    for (const task of tasks) {
      try {
        const result = await task.fn({});
        const items =
          result.orders ||
          result.products ||
          result.events ||
          result.heritage ||
          result.scenic ||
          (result.summary ? [result.summary] : null) ||
          (result.overview ? [result.overview] : null) ||
          [];
        const fetched = Array.isArray(items) ? items.length : 1;
        const rejected = result.rejected || 0;
        totalFetched += fetched;
        totalRejected += rejected;

        // Upsert snapshot
        const existing = await AnalyticsSnapshot.findOne({
          where: { metricType: task.key, dataMode: env.DATA_MODE },
          order: [['generatedAt', 'DESC']],
        });

        // Always create a new snapshot (preserve history, do not overwrite)
        await AnalyticsSnapshot.create({
          metricType: task.key,
          periodStart: null,
          periodEnd: null,
          metricPayload: result,
          sourceSystem: 'cultureframe',
          dataMode: env.DATA_MODE,
          generatedAt: new Date(),
        });

        totalProcessed += fetched;
      } catch (taskErr) {
        errors.push(`[${task.key}] ${taskErr.message}`);
        console.error(`[SyncService] Task "${task.key}" failed:`, taskErr.message);
      }
    }

    const finalStatus = errors.length === 0 ? 'completed' : errors.length === tasks.length ? 'failed' : 'partial';

    await syncRun.update({
      finishedAt: new Date(),
      status: finalStatus,
      recordsFetched: totalFetched,
      recordsProcessed: totalProcessed,
      recordsRejected: totalRejected,
      errorSummary: errors.length > 0 ? errors.join('\n') : null,
    });

    // Update integration config last sync timestamp only on full or partial success
    if (finalStatus !== 'failed') {
      await IntegrationConfig.update(
        { lastSuccessfulSyncAt: new Date() },
        { where: { providerName: 'cultureframe' } }
      );
    }

    return {
      syncRunId: syncRun.id,
      status: finalStatus,
      recordsFetched: totalFetched,
      recordsProcessed: totalProcessed,
      recordsRejected: totalRejected,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (err) {
    await syncRun.update({
      finishedAt: new Date(),
      status: 'failed',
      errorSummary: err.message,
    });
    throw err;
  } finally {
    _runningSync = false;
  }
}

async function getSyncHistory(limit = 20) {
  return IntegrationSyncRun.findAll({
    order: [['startedAt', 'DESC']],
    limit,
    attributes: ['id', 'providerName', 'startedAt', 'finishedAt', 'status', 'recordsFetched', 'recordsProcessed', 'recordsRejected', 'errorSummary', 'dataMode', 'createdAt'],
  });
}

async function getLatestSnapshot(metricType) {
  return AnalyticsSnapshot.findOne({
    where: { metricType },
    order: [['generatedAt', 'DESC']],
  });
}

module.exports = { triggerSync, getSyncHistory, getLatestSnapshot, isRunning };
