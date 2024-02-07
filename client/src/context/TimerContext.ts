import { createContext } from "react";
import { Time } from "../components/Pomodoro";

export type TimerContextType = {
  time: Time;
  setTime: (value: Time) => void;
  pomodoroMode: boolean;
  setPomodoroMode: (value: boolean) => void;
  shortBreak: boolean;
  setShortBreak: (value: boolean) => void;
  longBreak: boolean;
  setLongBreak: (value: boolean) => void;
  handleReset: () => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  reset: boolean;
  setReset: (value: boolean) => void;
  initialTotalSeconds: number;
  setInitialTotalSeconds: (value: number) => void;
  progress: number;
  setProgress: (value: number) => void;
  worker: Worker | null;
  setWorker: (value: Worker) => void;
  totalRemainingSeconds: number;
  setTotalRemainingSeconds: (value: number) => void;
};

export const TimerContext = createContext<TimerContextType | undefined>(
  undefined
);
