// app/components/InstallPrompt.js
'use client';
import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setPrompt(e);
    });
  }, []);

  if (!prompt) return null;

  return (
    <button onClick={() => prompt.prompt()}>
      Install App
    </button>
  );
}