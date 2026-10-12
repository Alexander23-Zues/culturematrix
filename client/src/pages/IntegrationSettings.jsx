import React, { useState } from 'react';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAnalytics } from '../hooks/useAnalytics';
import { integrationService } from '../services/integrationService';
import { CheckCircle, XCircle, RefreshCw, Wifi, WifiOff, Clock, AlertTriangle } from 'lucide-react';

const fmt = (d) => d ? new Date(d).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';

function StatusRow({ label, ok, note }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {ok
          ? <CheckCircle size={15} className="text-green-500" />
          : <XCircle size={15} className="text-red-400" />}
        <span className={`text-xs ${ok ? 'text-green-600' : 'text-red-500'}`}>{ok ? 'Ready' : 'Not ready'}</span>
      </div>
    </div>
  );
}

export default function IntegrationSettings() {
  const { data: status, loading, error, refetch } = useAnalytics(() => integrationService.getStatus());
  const { data: config, refetch: refetchConfig } = useAnalytics(() => integrationService.getConfigurationStatus());
  const { data: history } = useAnalytics(() => integrationService.getSyncHistory(10));

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await integrationService.testConnection();
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, data: { result: 'failure', message: err.message } });
    } finally {
      setTestLoading(false);
      refetch();
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const res = await integrationService.syncNow();
      setSyncResult(res);
    } catch (err) {
      setSyncResult({ success: false, error: { message: err.response?.data?.error?.message || err.message } });
    } finally {
      setSyncLoading(false);
      refetch();
      refetchConfig();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {loading && <LoadingSpinner />}
        {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}
        {!loading && !error && status && (
          <>
            {/* Status overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  {status.integrationEnabled ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-gray-400" />}
                  CultureFrame Integration
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Data Mode</span><span className="font-medium capitalize">{status.dataMode}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Integration Enabled</span><span className={status.integrationEnabled ? 'text-green-600 font-medium' : 'text-red-500'}>{status.integrationEnabled ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">API Base URL</span><span className="text-xs font-mono text-gray-600 max-w-xs truncate">{status.apiBaseUrl}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Last Connection Test</span><span className="text-xs">{fmt(status.lastConnectionTestAt)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Last Test Result</span><span className={`text-xs ${status.lastConnectionTestResult === 'success' ? 'text-green-600' : 'text-gray-400'}`}>{status.lastConnectionTestResult || 'Not tested'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Last Successful Sync</span><span className="text-xs">{fmt(status.lastSuccessfulSyncAt)}</span></div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleTest}
                    disabled={testLoading || !status.integrationEnabled}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    {testLoading ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Wifi size={15} />}
                    Test Connection
                  </button>

                  {!status.integrationEnabled && (
                    <p className="text-xs text-gray-400 text-center">Set CULTUREFRAME_INTEGRATION_ENABLED=true to enable connection tests.</p>
                  )}

                  {testResult && (
                    <div className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {testResult.success ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      {testResult.data?.message}
                    </div>
                  )}

                  <button
                    onClick={handleSync}
                    disabled={syncLoading || status.syncRunning}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {syncLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RefreshCw size={15} />}
                    {status.syncRunning ? 'Sync in progress…' : 'Trigger Sync Now'}
                  </button>

                  {syncResult && (
                    <div className={`rounded-lg px-3 py-2 text-xs ${syncResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {syncResult.success
                        ? `Sync ${syncResult.data?.status}: ${syncResult.data?.recordsProcessed} records processed.`
                        : syncResult.error?.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration checklist */}
            {config && (
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertTriangle size={15} className={config.allReady ? 'text-green-500' : 'text-amber-500'} />
                  Integration Checklist
                </h3>
                {config.checklist.map((item) => (
                  <StatusRow key={item.item} label={item.item} ok={item.ok} />
                ))}
                {config.allReady && (
                  <p className="text-xs text-green-600 mt-3 font-medium">All checks passed. Integration is ready.</p>
                )}
                {!config.allReady && (
                  <p className="text-xs text-amber-600 mt-3">Complete all checklist items before enabling live integration. See docs/CULTUREFRAME_API_CONTRACT.md.</p>
                )}
              </div>
            )}

            {/* Sync history */}
            {history && (
              <div className="card overflow-x-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Clock size={15} />
                  Sync History
                </h3>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-400">No sync runs recorded yet.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400">
                        <th className="text-left pb-2 pr-4">Started</th>
                        <th className="text-left pb-2 pr-4">Status</th>
                        <th className="text-right pb-2 pr-4">Fetched</th>
                        <th className="text-right pb-2 pr-4">Processed</th>
                        <th className="text-right pb-2 pr-4">Rejected</th>
                        <th className="text-left pb-2">Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((run) => (
                        <tr key={run.id} className="border-b border-gray-50">
                          <td className="py-1.5 pr-4">{fmt(run.startedAt)}</td>
                          <td className="py-1.5 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              run.status === 'completed' ? 'bg-green-100 text-green-700'
                              : run.status === 'failed' ? 'bg-red-100 text-red-700'
                              : run.status === 'partial' ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                            }`}>{run.status}</span>
                          </td>
                          <td className="py-1.5 pr-4 text-right">{run.recordsFetched}</td>
                          <td className="py-1.5 pr-4 text-right">{run.recordsProcessed}</td>
                          <td className="py-1.5 pr-4 text-right">{run.recordsRejected}</td>
                          <td className="py-1.5 capitalize">{run.dataMode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
