'use client';

import { useReportWebVitals } from 'next/web-vitals';

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // This can later be wired to analytics instead of console logs.
    console.info(
      `[web-vitals] ${metric.name} value=${metric.value.toFixed(2)} rating=${metric.rating} id=${metric.id}`
    );
  });

  return null;
}
