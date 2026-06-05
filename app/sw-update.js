// app/sw-update.js  — client component
'use client';
import { useEffect } from 'react';

export default function SwUpdate() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.update());
      });
    }
  }, []);
  return null;
}