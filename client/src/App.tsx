/* eslint-disable @typescript-eslint/no-unused-vars */
import TimerMenu from "./components/TimerMenu";
import { Time } from "./components/PomodoroV2";
import "./index.css";
import { useCallback, useState } from "react";
import { TimerContext } from "./context/TimerContext";
import PomodoroV2 from "./components/PomodoroV2";

export default function App() {
  const [time, setTime] = useState<Time>({
    hours: 0,
    minutes: 25,
    seconds: 0,
  });
  const [pomodoroMode, setPomodoroMode] = useState<boolean>(true);
  const [shortBreak, setShortBreak] = useState<boolean>(false);
  const [longBreak, setLongBreak] = useState<boolean>(false);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(true);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [totalRemainingSeconds, setTotalRemainingSeconds] = useState<number>(0);

  const handleReset = useCallback(() => {
    if (worker) {
      worker.postMessage({ action: "RESET" });
      setReset(true);
      setIsActive(false);
      setTotalRemainingSeconds(0);
      setInitialTotalSeconds(0);
      setProgress(100);

      if (pomodoroMode) {
        setTime({
          hours: 0,
          minutes: 25,
          seconds: 0,
        });
      } else if (shortBreak) {
        setTime({
          hours: 0,
          minutes: 5,
          seconds: 0,
        });
      } else if (longBreak) {
        setTime({
          hours: 0,
          minutes: 20,
          seconds: 0,
        });
      }
    }
  }, [longBreak, pomodoroMode, shortBreak, worker]);

  return (
    <TimerContext.Provider
      value={{
        time,
        setTime,
        pomodoroMode,
        setPomodoroMode,
        shortBreak,
        setShortBreak,
        longBreak,
        setLongBreak,
        handleReset,
        isActive,
        setIsActive,
        reset,
        setReset,
        initialTotalSeconds,
        setInitialTotalSeconds,
        progress,
        setProgress,
        worker,
        setWorker,
        totalRemainingSeconds,
        setTotalRemainingSeconds,
      }}
    >
      <div className="w-full h-screen flex flex-col gap-5 items-center justify-center bg-stone-900">
        <TimerMenu />
        {/* <Pomodoro /> */}
        <PomodoroV2 />
      </div>
    </TimerContext.Provider>
  );
}
