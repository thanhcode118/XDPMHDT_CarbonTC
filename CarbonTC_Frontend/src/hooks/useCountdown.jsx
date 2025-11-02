import { useState, useEffect } from 'react';

/**
 * @param {string} targetDate - Chuỗi ISO 8601 (ví dụ: "2025-11-07T05:27:02.618")
 */
const useCountdown = (targetDate) => {
  const countDownDate = new Date(targetDate).getTime() + 7 * 60 * 60 * 1000;

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    if (!countDownDate || countDownDate < new Date().getTime()) {
      setCountDown(0);
      return;
    }

    const interval = setInterval(() => {
      const newCountDown = countDownDate - new Date().getTime();

      if (newCountDown <= 0) {
        clearInterval(interval);
        setCountDown(0);
      } else {
        setCountDown(newCountDown);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]); 

  return getReturnValues(countDown);
};

/**
 * Helper function để chuyển milliseconds thành ngày, giờ, phút, giây
 */
const getReturnValues = (countDown) => {
  if (countDown <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isOver: false };
};

export { useCountdown };