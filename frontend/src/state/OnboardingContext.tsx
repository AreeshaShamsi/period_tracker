import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { OnboardingData, UserLogs } from "@/types/onboarding";
import {
  loadLogs,
  loadOnboarding,
  saveLogs,
  saveOnboarding,
} from "@/lib/storage";

import { profileService } from "@/services/profile.service";
import { AuthUser } from "@/types/auth";

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  name: "",
  birthday: { month: 12, day: 25, year: 1995 },
  periodLength: 4,
  cycleType: "regular",
  cycleLength: 28,
  cycleLengthMin: 26,
  cycleLengthMax: 28,
  lastPeriodDays: [],
  step: 0,
};

export const DEFAULT_USER_LOGS: UserLogs = {
  periodDays: [],
  symptoms: {},
  moods: {},
  notes: {},
};

type Action =
  | { type: "SET_FIELD"; field: keyof OnboardingData; value: any }
  | { type: "SET_ONBOARDING_DATA"; data: OnboardingData }
  | { type: "SET_USER_LOGS"; logs: UserLogs }
  | { type: "TOGGLE_PERIOD_LOG"; dateStr: string }
  | {
      type: "UPDATE_DATE_LOG";
      dateStr: string;
      isPeriod: boolean;
      symptoms: string[];
      notes?: string;
    };

interface State {
  onboardingData: OnboardingData;
  userLogs: UserLogs;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        onboardingData: {
          ...state.onboardingData,
          [action.field]: action.value,
        },
      };
    case "SET_ONBOARDING_DATA":
      return {
        ...state,
        onboardingData: action.data,
      };
    case "SET_USER_LOGS":
      return {
        ...state,
        userLogs: action.logs,
      };
    case "TOGGLE_PERIOD_LOG": {
      const exists = state.userLogs.periodDays.includes(action.dateStr);
      const newDays = exists
        ? state.userLogs.periodDays.filter((d) => d !== action.dateStr)
        : [...state.userLogs.periodDays, action.dateStr].sort();

      const newLogs: UserLogs = {
        ...state.userLogs,
        periodDays: newDays,
      };
      saveLogs(newLogs);
      return {
        ...state,
        userLogs: newLogs,
      };
    }
    case "UPDATE_DATE_LOG": {
      const exists = state.userLogs.periodDays.includes(action.dateStr);
      let newPeriodDays = [...state.userLogs.periodDays];
      if (action.isPeriod && !exists) {
        newPeriodDays.push(action.dateStr);
        newPeriodDays.sort();
      } else if (!action.isPeriod && exists) {
        newPeriodDays = newPeriodDays.filter((d) => d !== action.dateStr);
      }

      const newSymptoms = {
        ...state.userLogs.symptoms,
        [action.dateStr]: action.symptoms,
      };

      const newNotes = { ...state.userLogs.notes };
      if (action.notes !== undefined) {
        newNotes[action.dateStr] = action.notes;
      }

      const newLogs: UserLogs = {
        ...state.userLogs,
        periodDays: newPeriodDays,
        symptoms: newSymptoms,
        notes: newNotes,
      };
      saveLogs(newLogs);
      return {
        ...state,
        userLogs: newLogs,
      };
    }
    default:
      return state;
  }
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  userLogs: UserLogs;
  isLoadingStorage: boolean;
  isLoaded: boolean;
  setField: <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K]
  ) => void;
  setOnboardingData: (data: OnboardingData) => Promise<void>;
  togglePeriodLog: (dateStr: string) => void;
  updateDateLog: (
    dateStr: string,
    isPeriod: boolean,
    symptoms: string[],
    notes?: string
  ) => void;
  syncWithServer: (user?: AuthUser) => Promise<{
    user: AuthUser;
    onboardingCompleted: boolean;
  } | null>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    onboardingData: DEFAULT_ONBOARDING_DATA,
    userLogs: DEFAULT_USER_LOGS,
  });

  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const isLoaded = !isLoadingStorage;

  useEffect(() => {
    async function initStorage() {
      try {
        const savedData = await loadOnboarding();
        if (savedData) {
          dispatch({ type: "SET_ONBOARDING_DATA", data: savedData });
        }
        const savedLogs = await loadLogs();
        if (savedLogs) {
          dispatch({ type: "SET_USER_LOGS", logs: savedLogs });
        }
      } catch (error) {
        console.error("Failed to load initial storage data:", error);
      } finally {
        setIsLoadingStorage(false);
      }
    }
    initStorage();
  }, []);

  const setField = <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K]
  ) => {
    dispatch({ type: "SET_FIELD", field, value });
    const updated = { ...state.onboardingData, [field]: value };
    saveOnboarding(updated).catch(() => {});
  };

  const setOnboardingData = async (data: OnboardingData) => {
    dispatch({ type: "SET_ONBOARDING_DATA", data });
    await saveOnboarding(data);
  };

  const togglePeriodLog = (dateStr: string) => {
    dispatch({ type: "TOGGLE_PERIOD_LOG", dateStr });
  };

  const updateDateLog = (
    dateStr: string,
    isPeriod: boolean,
    symptoms: string[],
    notes?: string
  ) => {
    dispatch({
      type: "UPDATE_DATE_LOG",
      dateStr,
      isPeriod,
      symptoms,
      notes,
    });
  };

  const syncWithServer = useCallback(async (user?: AuthUser) => {
    try {
      const result = await profileService.syncUserData(user);
      const savedData = await loadOnboarding();
      if (savedData) {
        dispatch({ type: "SET_ONBOARDING_DATA", data: savedData });
      }
      const savedLogs = await loadLogs();
      if (savedLogs) {
        dispatch({ type: "SET_USER_LOGS", logs: savedLogs });
      }
      return result;
    } catch (err) {
      console.warn("[OnboardingContext] syncWithServer failed:", err);
      return null;
    }
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData: state.onboardingData,
        userLogs: state.userLogs,
        isLoadingStorage,
        isLoaded,
        setField,
        setOnboardingData,
        togglePeriodLog,
        updateDateLog,
        syncWithServer,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
