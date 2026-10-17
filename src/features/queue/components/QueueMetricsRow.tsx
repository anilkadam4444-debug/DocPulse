import React from 'react';
import { GlobalOPDQueueMetrics } from '../estimationEngine';

export type QueueFilterTab =
  | 'all'
  | 'waiting'
  | 'active'
  | 'scheduled'
  | 'completed'
  | 'no_show'
  | 'cancelled';

interface QueueMetricsRowProps {
  metrics: GlobalOPDQueueMetrics;
  activeFilter: QueueFilterTab;
  onFilterChange: (tab: QueueFilterTab) => void;
}

export const QueueMetricsRow: React.FC<QueueMetricsRowProps> = ({
  metrics,
  activeFilter,
  onFilterChange,
}) => {
  const tabs: { id: QueueFilterTab; label: string; count: number; color?: string }[] = [
    { id: 'all', label: 'All Entries', count: metrics.totalTokens },
    { id: 'waiting', label: 'Waiting in Clinic', count: metrics.waitingCount, color: 'text-amber-700 bg-amber-50' },
    {
      id: 'active',
      label: 'Called / In Room',
      count: metrics.inConsultationCount + metrics.calledCount,
      color: 'text-teal-700 bg-teal-50',
    },
    { id: 'scheduled', label: 'Scheduled / Expected', count: metrics.scheduledCount, color: 'text-blue-700 bg-blue-50' },
    { id: 'completed', label: 'Completed', count: metrics.completedCount, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'no_show', label: 'No-Show', count: metrics.noShowCount, color: 'text-purple-700 bg-purple-50' },
    { id: 'cancelled', label: 'Cancelled', count: metrics.cancelledCount, color: 'text-rose-700 bg-rose-50' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isSelected = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              isSelected
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                isSelected
                  ? 'bg-slate-700 text-teal-300'
                  : tab.color || 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
