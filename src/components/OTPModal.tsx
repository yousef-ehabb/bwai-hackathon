'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OTPModalProps {
  phone: string;
  onSuccess: () => void;
  onBack: () => void;
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, 3) + 'X'.repeat(phone.length - 5) + phone.slice(-2);
}

export default function OTPModal({ phone, onSuccess, onBack }: OTPModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [countdown, setCountdown] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        value = value.slice(-1);
      }
      if (value && !/^\d$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleResend = () => {
    setCountdown(59);
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const allFilled = otp.every((d) => d !== '');

  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="font-syne text-xl font-bold text-white mb-2">Verify Your Phone</h3>
        <p className="text-sm text-slate-400">
          OTP sent to <span className="text-[#3b82f6] font-mono">{maskPhone(phone)}</span>
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-14 text-center text-2xl font-bold bg-[#0f172a] border-[#334155] text-white focus:border-[#3b82f6] focus:ring-[#3b82f6]/20"
          />
        ))}
      </div>

      <div className="text-sm text-slate-400">
        {countdown > 0 ? (
          <span>Resend in 0:{countdown.toString().padStart(2, '0')}</span>
        ) : (
          <button onClick={handleResend} className="text-[#3b82f6] hover:underline">
            Resend OTP
          </button>
        )}
      </div>

      <Button
        onClick={onSuccess}
        disabled={!allFilled}
        className="w-full bg-[#1a56db] hover:bg-[#1e40af] text-white disabled:opacity-50"
        size="lg"
      >
        Verify OTP
      </Button>

      <Button
        variant="ghost"
        onClick={onBack}
        className="text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </div>
  );
}
