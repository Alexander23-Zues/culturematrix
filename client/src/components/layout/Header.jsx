import React from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, WifiOff, Wifi, FlaskConical } from 'lucide-react';
import { useIntegrationStatus } from '../../hooks/useIntegrationStatus';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/sales': 'Sales Analytics',
  '/products': 'Product & Craft Analytics',
  '/orders': 'Order Analytics',
  '/customers': 'Customer Analytics',
  '/events': 'Event Analytics',
  '/destinations': 'Heritage & Scenic Analytics',
  '/reports': 'Reports',
  '/integration': 'CultureFrame Integration',
  '/settings': 'Settings',
};

function IntegrationChip({ status }) {
  if (!status) return null;

  if (status.dataMode === 'mock') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
        <FlaskConical size={11} />
        Demo Mode
      </span>
    );
  }

  if (status.dataMode === 'live' && status.integrationEnabled) {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
        <Wifi size={11} />
        Live · CultureFrame
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
      <WifiOff size={11} />
      Integration Off
    </span>
  );
}

export default function Header({ onRefresh }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'CultureMetrics';
  const integrationStatus = useIntegrationStatus();

  const formattedSync = integrationStatus?.lastSuccessfulSyncAt
    ? new Date(integrationStatus.lastSuccessfulSyncAt).toLocaleString('en-PH', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : null;

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
      <h1 className="text-lg font-display font-bold text-forest-800 truncate">{title}</h1>

      <div className="flex items-center gap-3 shrink-0">
        {formattedSync && (
          <span className="text-xs text-gray-400 hidden lg:block">
            Synced: {formattedSync}
          </span>
        )}

        <IntegrationChip status={integrationStatus} />

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-secondary flex items-center gap-1.5 text-xs"
            title="Refresh data"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
}
