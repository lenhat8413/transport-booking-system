'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('00:00');
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="max-w-5xl mx-auto px-4 mt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-4 p-4 rounded-xl border ${
          isExpired
            ? 'bg-red-50 border-red-100 text-red-800'
            : 'bg-brand-50 border-brand-100 text-brand-800'
        }`}
      >
        <div className={`p-2 rounded-full mt-0.5 ${isExpired ? 'bg-red-100' : 'bg-brand-100'}`}>
          <Clock className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-brand-600'}`} />
        </div>
        <div>
          <h3 className="font-semibold mb-1">
            {isExpired ? 'Đã hết thời gian giữ chỗ' : `Thời gian giữ chỗ còn lại: ${timeLeft}`}
          </h3>
          <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-brand-600/80'}`}>
            {isExpired
              ? 'Vé của bạn đã bị hủy do hết thời gian giữ chỗ. Vui lòng đặt lại.'
              : 'Vui lòng hoàn tất đặt vé trước khi hết thời gian giữ chỗ để đảm bảo vị trí ngồi của bạn.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
