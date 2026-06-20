import React from 'react';
import { Button } from '@/components/ui/button';
import { Delete, X } from 'lucide-react';

interface OnScreenNumpadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function OnScreenNumpad({ value, onChange, onSubmit, onClose }: OnScreenNumpadProps) {
  const handleKeyClick = (key: string) => {
    if (value.length < 10) {
      onChange(value + key);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl shadow-xl w-full max-w-[320px] mx-auto border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Member Phone</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-5 h-5 text-slate-500" />
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-14 mb-4 flex items-center justify-center text-2xl font-mono tracking-widest text-slate-800 dark:text-slate-100 shadow-inner">
        {value || <span className="text-slate-300 dark:text-slate-600">0XX-XXX-XXXX</span>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            className="h-16 text-2xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-900/30 shadow-sm"
            onClick={() => handleKeyClick(num.toString())}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-16 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/30 text-rose-500 shadow-sm"
          onClick={handleBackspace}
        >
          <Delete className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          className="h-16 text-2xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-900/30 shadow-sm"
          onClick={() => handleKeyClick('0')}
        >
          0
        </Button>
        <Button
          className="h-16 bg-emerald-500 hover:bg-emerald-600 border-none text-white font-bold text-lg shadow-sm"
          onClick={onSubmit}
          disabled={value.length < 10}
        >
          Find
        </Button>
      </div>
    </div>
  );
}
