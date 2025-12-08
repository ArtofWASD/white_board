import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FeatureFlags {
  showExerciseTracker: boolean;
  showWeightTracker: boolean;
  strengthTrainingCalculator: boolean;
  texasMethodCalculator: boolean;
}

interface FeatureFlagState {
  flags: FeatureFlags;
  toggleFlag: (key: keyof FeatureFlags) => void;
}

const defaultFlags: FeatureFlags = {
  showExerciseTracker: true,
  showWeightTracker: true,
  strengthTrainingCalculator: false,
  texasMethodCalculator: false,
};

export const useFeatureFlagStore = create<FeatureFlagState>()(
  persist(
    (set) => ({
      flags: defaultFlags,
      toggleFlag: (key) =>
        set((state) => ({
          flags: {
            ...state.flags,
            [key]: !state.flags[key],
          },
        })),
    }),
    {
      name: 'feature-flags',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
