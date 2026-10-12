'use strict';

const { IntegrationConfig } = require('../models');
const { triggerSync, getSyncHistory, isRunning } = require('../services/synchronization/syncService');
const { cultureFrameClient } = require('../services/cultureframe/cultureframeClient');
const { env } = require('../config/environment');

async function getStatus(req, res, next) {
  try {
    const config = await IntegrationConfig.findOne({ where: { providerName: 'cultureframe' } });
    return res.json({
      success: true,
      data: {
        providerName: 'cultureframe',
        enabled: config?.enabled ?? false,
        apiBaseUrl: config?.apiBaseUrl ?? env.CULTUREFRAME_API_URL,
        lastConnectionTestAt: config?.lastConnectionTestAt ?? null,
        lastConnectionTestResult: config?.lastConnectionTestResult ?? null,
        lastSuccessfulSyncAt: config?.lastSuccessfulSyncAt ?? null,
        integrationEnabled: env.CULTUREFRAME_INTEGRATION_ENABLED,
        dataMode: env.DATA_MODE,
        syncRunning: await isRunning(),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function testConnection(req, res, next) {
  try {
    if (!env.CULTUREFRAME_INTEGRATION_ENABLED) {
      return res.json({
        success: false,
        data: {
          result: 'skipped',
          message: 'Integration is disabled. Set CULTUREFRAME_INTEGRATION_ENABLED=true to enable.',
        },
      });
    }

    let result = 'failure';
    let message = '';

    try {
      // Try to reach the CultureFrame base URL
      await cultureFrameClient.get('/');
      result = 'success';
      message = 'CultureFrame API is reachable.';
    } catch (err) {
      message = err.message;
    }

    await IntegrationConfig.update(
      { lastConnectionTestAt: new Date(), lastConnectionTestResult: result },
      { where: { providerName: 'cultureframe' } }
    );

    return res.json({ success: result === 'success', data: { result, message } });
  } catch (err) {
    return next(err);
  }
}

async function syncNow(req, res, next) {
  try {
    const result = await triggerSync();
    return res.json({ success: true, data: result });
  } catch (err) {
    if (err.code === 'SYNC_ALREADY_RUNNING') {
      return res.status(409).json({
        success: false,
        error: { code: err.code, message: err.message },
      });
    }
    return next(err);
  }
}

async function getSyncHistory_handler(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const history = await getSyncHistory(limit);
    return res.json({ success: true, data: history });
  } catch (err) {
    return next(err);
  }
}

async function getConfigurationStatus(req, res, next) {
  try {
    const config = await IntegrationConfig.findOne({ where: { providerName: 'cultureframe' } });
    const checklist = [
      { item: 'CULTUREFRAME_API_URL is set', ok: !!env.CULTUREFRAME_API_URL },
      { item: 'CULTUREFRAME_API_TOKEN is set', ok: !!env.CULTUREFRAME_API_TOKEN },
      { item: 'CULTUREFRAME_INTEGRATION_ENABLED is true', ok: env.CULTUREFRAME_INTEGRATION_ENABLED },
      { item: 'Integration config exists in database', ok: !!config },
      { item: 'Last connection test passed', ok: config?.lastConnectionTestResult === 'success' },
      { item: 'At least one successful sync completed', ok: !!config?.lastSuccessfulSyncAt },
    ];
    const allReady = checklist.every((c) => c.ok);
    return res.json({ success: true, data: { allReady, checklist, dataMode: env.DATA_MODE } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getStatus, testConnection, syncNow, getSyncHistory: getSyncHistory_handler, getConfigurationStatus };
