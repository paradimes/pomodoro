import { useContext, useEffect } from "react";
import { TimerContext } from "../context/TimerContext";

export default function TimerMenu() {
  const timerContext = useContext(TimerContext);

  if (!timerContext) {
    throw new Error("TimerMenu must be used within a TimerProvider");
  }
  const {
    setTime,
    pomodoroMode,
    setPomodoroMode,
    shortBreak,
    setShortBreak,
    longBreak,
    setLongBreak,
    handleReset,
  } = timerContext;

  useEffect(() => {
    setPomodoroMode(true);
  }, [setPomodoroMode]);

  const handlePomodoroClick = () => {
    handleReset();
    setPomodoroMode(true);
    setShortBreak(false);
    setLongBreak(false);
    setTime({
      hours: 0,
      minutes: 25,
      seconds: 0,
    });
  };

  const handleShortBreakClick = () => {
    handleReset();
    setPomodoroMode(false);
    setShortBreak(true);
    setLongBreak(false);
    setTime({
      hours: 0,
      minutes: 5,
      seconds: 0,
    });
  };

  const handleLongBreakClick = () => {
    handleReset();
    setPomodoroMode(false);
    setShortBreak(false);
    setLongBreak(true);
    setTime({
      hours: 0,
      minutes: 10,
      seconds: 0,
    });
  };

  return (
    <div className="flex flex-row  items-center justify-center rounded-md w-1/4 bg-stone-800 border-[0.5px] border-stone-600 overflow-hidden">
      <button
        id="pomodoroMode"
        className={`w-1/2 text-stone-400 text-center focus:bg-stone-700 hover:bg-stone-600 active:bg-stone-500
       border-r-[0.5px] border-stone-600 focus:outline-none focus:border-none ${
         pomodoroMode ? "bg-stone-700" : "bg-transparent"
       }  `}
        onClick={handlePomodoroClick}
      >
        Pomodoro
      </button>
      <button
        id="shortBreak"
        className={`w-1/2 text-stone-400 text-center focus:bg-stone-700 hover:bg-stone-600 active:bg-stone-500
       border-r-[0.5px] border-stone-600 focus:outline-none focus:border-none ${
         shortBreak ? "bg-stone-700" : "bg-transparent"
       }  `}
        onClick={handleShortBreakClick}
      >
        Short Break
      </button>
      <button
        id="longBreak"
        className={`w-1/2 text-stone-400 text-center focus:bg-stone-700 hover:bg-stone-600 active:bg-stone-500 focus:outline-none focus:border-none  ${
          longBreak ? "bg-stone-700" : "bg-transparent"
        } `}
        onClick={handleLongBreakClick}
      >
        Long Break
      </button>
    </div>
  );
}
