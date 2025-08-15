
"use client";

import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

interface PinInputProps {
  length: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
  className?: string;
}

const PinInput: React.FC<PinInputProps> = ({ length, onComplete, disabled = false, className }) => {
  const [pin, setPin] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newPin.join('').length === length) {
        onComplete(newPin.join(''));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
      if (pasteData.length === length) {
          const newPin = pasteData.split('');
          setPin(newPin);
          onComplete(pasteData);
          inputRefs.current[length - 1]?.focus();
      }
  }

  return (
    <div 
      className={cn(
        'flex justify-center gap-2 md:gap-4', 
        className
      )}
      onPaste={handlePaste}
    >
      {Array.from({ length }, (_, index) => (
        <Input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="tel"
            maxLength={1}
            value={pin[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled}
            className="w-12 h-14 text-center text-2xl font-bold"
            aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default PinInput;


