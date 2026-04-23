'use client';

import { useEffect } from 'react';
import { seedData } from '@/lib/seed';

export default function Bootstrapper() {
  useEffect(() => {
    seedData();
  }, []);
  return null;
}
