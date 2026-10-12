import React from 'react';
import { Calendar } from 'lucide-react';

const PRESETS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
];

export default function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange, onPreset }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar size={16} className="text-gray-400" />
      {PRESETS.map((p) => (
        <button
          key={p.days}
          onClick={() => onPreset?.(p.days)}
          className="text-xs px-2.5 py-1 rounded-md border border-gray-200 hover:border-forest-500 hover:text-forest-700 transition-colors"
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="input text-xs w-36"
          aria-label="Start date"
        />
        <span className="text-gray-400 text-xs">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="input text-xs w-36"
          aria-label="End date"
        />
      </div>
    </div>
  );
}
