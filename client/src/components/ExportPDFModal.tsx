import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useKanban } from '../context/KanbanContext';

interface ExportPDFModalProps {
  projectId: string;
  onClose: () => void;
}

export const ExportPDFModal: React.FC<ExportPDFModalProps> = ({ projectId, onClose }) => {
  const { exportPDF } = useKanban();
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    includeComments: true,
    includeHistory: true,
    includeContributors: true,
  });

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      await exportPDF(projectId, options);
      onClose();
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <m.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Export Project PDF</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-400 mb-4 text-sm">
            Select the sections you want to include in the generated PDF report.
          </p>

          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={options.includeContributors}
                onChange={(e) => setOptions({...options, includeContributors: e.target.checked})}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
              />
              <span className="text-slate-300">Contributor Summary</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={options.includeHistory}
                onChange={(e) => setOptions({...options, includeHistory: e.target.checked})}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
              />
              <span className="text-slate-300">Recent Activity Timeline</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={options.includeComments}
                onChange={(e) => setOptions({...options, includeComments: e.target.checked})}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
              />
              <span className="text-slate-300">Task Comments</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer opacity-50">
              <input 
                type="checkbox" 
                checked={true}
                disabled
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-500"
              />
              <span className="text-slate-300">Tasks Breakdown (Always included)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors font-medium text-sm"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <m.button
              onClick={handleExport}
              disabled={isGenerating}
              animate={isGenerating ? { opacity: 0.7, scale: 0.98 } : { opacity: 1, scale: 1 }}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors font-medium text-sm flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  📥 Download PDF
                </>
              )}
            </m.button>
          </div>
        </div>
      </m.div>
    </div>
  );
};
