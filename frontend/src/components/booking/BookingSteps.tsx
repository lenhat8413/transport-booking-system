'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

const BOOKING_STEPS: Step[] = [
  { label: 'Chọn ghế', description: 'Chọn chỗ ngồi' },
  { label: 'Hành khách', description: 'Thông tin cá nhân' },
  { label: 'Xác nhận', description: 'Kiểm tra lại' },
  { label: 'Thanh toán', description: 'Hoàn tất' },
];

interface BookingStepsProps {
  currentStep: number; // 0-indexed
}

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {BOOKING_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 relative
                    ${isCompleted
                      ? 'bg-brand-500 text-white shadow-glow'
                      : isCurrent
                        ? 'bg-brand-500 text-white shadow-glow ring-4 ring-brand-100'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                  {isCurrent && (
                    <span className="absolute -inset-1 rounded-full border-2 border-brand-300 animate-pulse-slow" />
                  )}
                </motion.div>
                <span className={`mt-2 text-xs font-medium text-center ${isCurrent ? 'text-brand-600' : isCompleted ? 'text-brand-500' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-gray-400 hidden sm:block">
                  {step.description}
                </span>
              </div>

              {/* Connector line */}
              {idx < BOOKING_STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 rounded-full relative overflow-hidden bg-gray-200 mt-[-24px]">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: idx < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 bg-brand-500 rounded-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
