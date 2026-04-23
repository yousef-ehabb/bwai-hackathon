'use client';

import { useEffect } from 'react';
import { seedData } from '@/lib/seed';
import { archiveOldReports, seedHotspotReports } from '@/lib/storage';

export default function Bootstrapper() {
  useEffect(() => {
    seedData();
    archiveOldReports();
    seedHotspotReports();
  }, []);
  return null;
}
