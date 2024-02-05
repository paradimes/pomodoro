import TimerMenu from "./components/TimerMenu";
import Pomodoro, { Time } from "./components/Pomodoro";
import "./index.css";
import { useCallback, useState } from "react";
import { TimerContext } from "./context/TimerContext";
import TimerTesting from "./components/TimerTesting";

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

  const handleReset = useCallback(() => {
    setReset(true);
    setIsActive(false);
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

    setInitialTotalSeconds(0);
    setProgress(100);
    document.title = "Pomodoro";
  }, [setTime, pomodoroMode, shortBreak, longBreak]);

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
      }}
    >
      <div className="w-full h-screen flex flex-col gap-5 items-center justify-center bg-stone-900">
        <TimerMenu />
        <Pomodoro />
        <TimerTesting />
      </div>
    </TimerContext.Provider>
  );
}
