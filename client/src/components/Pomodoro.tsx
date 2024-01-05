import { useCallback, useContext, useEffect } from "react";
import { TimerContext } from "../context/TimerContext";
import bell from "../assets/old-church-bell.mp3";

export type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

export default function Pomodoro() {
  const timerContext = useContext(TimerContext);

  if (!timerContext) {
    throw new Error("TimerMenu must be used within a TimerProvider");
  }
  const {
    time,
    setTime,
    handleReset,
    isActive,
    setIsActive,
    reset,
    setReset,
    initialTotalSeconds,
    setInitialTotalSeconds,
    progress,
    setProgress,
  } = timerContext;

  const radius = 150;
  const stroke = 5;
  const circleWidth = 2 * radius + stroke;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - (dashArray * progress) / 100;

  const handleTimeChange =
    (timeUnit: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = parseInt(event.target.value, 10);
      if (timeUnit === "hours" && value > 10) {
        value = 10;
      } else if (timeUnit === "Hours" && value < 0) {
        value = 0;
      } else if (
        (timeUnit === "minutes" || timeUnit === "seconds") &&
        value > 59
      ) {
        value = 59;
      } else if (
        (timeUnit === "minutes" || timeUnit === "seconds") &&
        value < 0
      ) {
        value = 0;
      }
      const newTime: Time = {
        ...time,
        [timeUnit]: value,
      };
      setTime(newTime);
    };

  const handleTimerInputKeyPress = (event: React.KeyboardEvent) => {
    const value = event.key;
    if (
      !value.match(/^[0-9:]$/) &&
      value !== "Backspace" &&
      value !== "Delete" &&
      value !== "ArrowLeft" &&
      value !== "ArrowRight" &&
      value !== "ArrowUp" &&
      value !== "ArrowDown"
    ) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      timer = setInterval(() => {
        const newTime: Time = { ...time };
        if (newTime.seconds > 0) {
          newTime.seconds--;
        } else {
          if (newTime.minutes > 0) {
            newTime.minutes--;
            newTime.seconds = 59;
          } else {
            if (newTime.hours > 0) {
              newTime.hours--;
              newTime.minutes = 59;
              newTime.seconds = 59;
            }
          }
        }
        setTime(newTime);

        const remainingSeconds =
          newTime.hours * 3600 + newTime.minutes * 60 + newTime.seconds;
        const newProgress: number =
          (remainingSeconds / initialTotalSeconds) * 100;
        setProgress(newProgress);

        if (remainingSeconds === 0) {
          const audio = new Audio(bell);
          audio.play();
          handleReset();
        }
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [
    handleReset,
    initialTotalSeconds,
    setInitialTotalSeconds,
    isActive,
    setIsActive,
    setProgress,
    setTime,
    time,
  ]);

  useEffect(() => {
    if (!reset) {
      document.title = `(${
        time.hours ? String(time.hours).padStart(2, "0") + ":" : ""
      }${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(
        2,
        "0"
      )}) Pomodoro`;
    }
  }, [reset, time.hours, time.minutes, time.seconds]);

  const handleStart = useCallback(() => {
    setReset(false);
    setIsActive(true);
    if (initialTotalSeconds === 0) {
      const totalSeconds: number =
        time.hours * 3600 + time.minutes * 60 + time.seconds;
      setInitialTotalSeconds(totalSeconds);
    }
  }, [
    initialTotalSeconds,
    setInitialTotalSeconds,
    setIsActive,
    setReset,
    time.hours,
    time.minutes,
    time.seconds,
  ]);

  const handlePause = useCallback(() => {
    setReset(false);
    setIsActive(false);
  }, [setIsActive, setReset]);

  useEffect(() => {
    const handleSpacebarPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (isActive) {
          handlePause();
        } else {
          handleStart();
        }
      } else if (event.code === "Escape") {
        handleReset();
      }
    };

    document.addEventListener("keydown", handleSpacebarPress);

    return () => {
      document.removeEventListener("keydown", handleSpacebarPress);
    };
  }, [handlePause, handleReset, handleStart, isActive]);

  return (
    <div
      className=" w-11/12 sm:w-4/5 md:w-3/4 2xl:w-1/2 h-1/2 p-4 pb-6  flex flex-col items-center justify-center
         bg-stone-900 border-2 border-stone-700 rounded-3xl"
    >
      <div
        id="timer"
        className="flex items-center justify-center mb-4 min-h-[80%]"
      >
        {!reset && (
          <>
            <svg
              width={circleWidth}
              height={circleWidth}
              viewBox={`0 0 ${circleWidth} ${circleWidth}`}
            >
              <circle
                id="circle-background"
                r={radius}
                fill="none"
                strokeWidth={stroke}
                stroke="#78716c"
                cx={circleWidth / 2}
                cy={circleWidth / 2}
              />
              <circle
                id="circle-progress"
                r={radius}
                fill="none"
                stroke="#f97316"
                strokeWidth={stroke}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeLinejoin="round"
                cx={circleWidth / 2}
                cy={circleWidth / 2}
                transform={`rotate(-90 ${circleWidth / 2} ${circleWidth / 2})`}
              />
            </svg>
            <span
              id="time"
              className="absolute text-6xl font-medium text-white"
            >
              {` ${
                time.hours ? String(time.hours).padStart(2, "0") + ":" : ""
              }${String(time.minutes).padStart(2, "0")}:${String(
                time.seconds
              ).padStart(2, "0")}`}
            </span>
          </>
        )}
        {reset && (
          <div className=" w-full  flex flex-col items-center gap-2 justify-center rounded-lg">
            <div className="flex flex-row items-center justify-center gap-20 bg-stone-900 w-full rounded-lg text-sm text-stone-400 font-normal ">
              <span>hr</span>
              <span>min</span>
              <span>sec</span>
            </div>
            <div className=" w-full flex flex-row items-center justify-center bg-stone-500 rounded-lg px-2 ">
              <input
                disabled={!reset}
                className={`text-6xl font-medium text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80`}
                type="number"
                min="0"
                max="10"
                value={String(time.hours).padStart(2, "0")}
                onChange={handleTimeChange("hours")}
                onKeyDown={handleTimerInputKeyPress}
              />
              <span className="text-6xl font-medium text-white bg-transparent">
                :
              </span>
              <input
                disabled={!reset}
                className={`text-6xl font-medium text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80`}
                type="number"
                min="0"
                max="59"
                value={String(time.minutes).padStart(2, "0")}
                onChange={handleTimeChange("minutes")}
                onKeyDown={handleTimerInputKeyPress}
              />
              <span className="text-6xl font-medium text-white bg-transparent">
                :
              </span>
              <input
                disabled={!reset}
                className={`text-6xl font-medium text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80`}
                type="number"
                min="0"
                max="59"
                value={String(time.seconds).padStart(2, "0")}
                onChange={handleTimeChange("seconds")}
                onKeyDown={handleTimerInputKeyPress}
              />
            </div>
          </div>
        )}
      </div>

      <div
        id="button-options"
        className=" mt-[3%]
        flex flex-row  items-center justify-center rounded-md text-sm text- sm:text-base  w-5/6 sm:w-4/6 md:w-3/5 lg:w-1/2 bg-stone-800 border-[0.5px] border-stone-600 overflow-hidden
        "
      >
        <button
          id="reset-button"
          onClick={handleReset}
          className="p-2 w-1/2 h-full text-stone-400 text-center  hover:bg-stone-600 active:bg-stone-500 border-r-[0.5px] border-stone-600 focus:outline-none focus:border-none"
        >
          <span>Reset (ESC)</span>
        </button>
        <button
          id="start-stop-button"
          onClick={isActive ? handlePause : handleStart}
          className={` w-1/2 text-stone-200 text-center focus:outline-none focus:border-none
           p-2 
          ${
            isActive
              ? `bg-red-700 hover:bg-red-600 active:bg-red-500 `
              : `bg-green-700 hover:bg-green-600 active:bg-green-500 `
          }`}
        >
          {`${isActive ? `Pause` : !isActive && !reset ? `Resume` : `Start`}`}
          <span> (Spacebar)</span>
        </button>
      </div>
    </div>
  );
}
