import { useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export function useDateFilter(defaultDays = 30) {
  const [startDate, setStartDate] = useState(daysAgo(defaultDays));
  const [endDate, setEndDate] = useState(today());

  const setPreset = (days) => {
    setStartDate(daysAgo(days));
    setEndDate(today());
  };

  return { startDate, endDate, setStartDate, setEndDate, setPreset };
}
