import React from 'react';
import { Button } from '@/components/ui/button';
import { Delete, X } from 'lucide-react';
import {
  posNumpadDeleteClassName,
  posNumpadDisplayClassName,
  posNumpadKeyClassName,
  posNumpadShellClassName,
  posNumpadSubmitClassName,
  text,
} from '@/lib/theme';

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
    <div className={posNumpadShellClassName()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-bold ${text.secondary}`}>Member Phone</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className={`w-5 h-5 ${text.muted}`} />
        </Button>
      </div>

      <div className={posNumpadDisplayClassName()}>
        {value || <span className={text.muted}>0XX-XXX-XXXX</span>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            className={posNumpadKeyClassName()}
            onClick={() => handleKeyClick(num.toString())}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          className={posNumpadDeleteClassName()}
          onClick={handleBackspace}
        >
          <Delete className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          className={posNumpadKeyClassName()}
          onClick={() => handleKeyClick('0')}
        >
          0
        </Button>
        <Button
          className={posNumpadSubmitClassName()}
          onClick={onSubmit}
          disabled={value.length < 10}
        >
          Find
        </Button>
      </div>
    </div>
  );
}
