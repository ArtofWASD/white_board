'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FeatureFlags {
  showExerciseTracker: boolean;
  showWeightTracker: boolean;
}

interface FeatureFlagContextType {
  flags: FeatureFlags;
  toggleFlag: (key: keyof FeatureFlags) => void;
}

const defaultFlags: FeatureFlags = {
  showExerciseTracker: true,
  showWeightTracker: true,
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedFlags = localStorage.getItem('featureFlags');
    if (storedFlags) {
      try {
        setFlags({ ...defaultFlags, ...JSON.parse(storedFlags) });
      } catch (e) {
        console.error('Failed to parse feature flags', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleFlag = (key: keyof FeatureFlags) => {
    setFlags((prev) => {
      const newFlags = { ...prev, [key]: !prev[key] };
      localStorage.setItem('featureFlags', JSON.stringify(newFlags));
      return newFlags;
    });
  };

  if (!isLoaded) {
    return null; // Or a loading spinner if critical
  }

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}
