import { useCallback, useContext, useEffect, useState } from "react";
import TimerWorker from "../../public/countdownWorker.js?worker";
import { TimerContext } from "../context/TimerContext";

export type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

export default function TimerTesting() {
  const timerContext = useContext(TimerContext);

  if (!timerContext) {
    throw new Error("TimerMenu must be used within a TimerProvider");
  }
  const {
    time,
    setTime,
    //   handleReset,
    isActive,
    setIsActive,
    reset,
    setReset,
    initialTotalSeconds,
    setInitialTotalSeconds,
    progress,
    setProgress,
  } = timerContext;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [totalRemainingSeconds, setTotalRemainingSeconds] = useState<number>(0);

  // Progress bar properties
  const radius = 150;
  const stroke = 5;
  const circleWidth = 2 * radius + stroke;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - (dashArray * progress) / 100;

  // Time input onChange handler
  const handleTimeChange =
    (timeUnit: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = parseInt(event.target.value, 10);
      if (timeUnit === "hours" && value > 10) {
        value = 10;
      } else if (timeUnit === "hours" && value < 0) {
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

  // Time input onKeyDown handler
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
    const newWorker = new TimerWorker();
    console.log("abc", newWorker);

    newWorker.onmessage = (e) => {
      const remainingSeconds = e.data;
      setTotalRemainingSeconds(remainingSeconds);
      document.title = `${remainingSeconds} Pomodoro`;

      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      setTime({ hours, minutes, seconds });

      const newProgress = (remainingSeconds / initialTotalSeconds) * 100;
      setProgress(newProgress);
    };

    setWorker(newWorker);

    return () => {
      newWorker.terminate();
      document.title = `Pomodoro`;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(() => {
    console.log("handleStart called");
    if (worker) {
      setReset(false);
      setIsActive(true);
      const timerDurationMilliseconds =
        (time.hours * 3600 + time.minutes * 60 + time.seconds) * 1000;
      const endTime = new Date().getTime() + timerDurationMilliseconds;
      if (initialTotalSeconds === 0) {
        setInitialTotalSeconds(timerDurationMilliseconds / 1000);
      }

      worker.postMessage({ action: "START", endTime: endTime });
    }
  }, [
    initialTotalSeconds,
    setInitialTotalSeconds,
    setIsActive,
    setReset,
    time.hours,
    time.minutes,
    time.seconds,
    worker,
  ]);

  const handlePause = useCallback(() => {
    console.log("handlePause called");

    if (worker) {
      if (!isActive) {
        worker.postMessage({ action: "RESUME" });
      } else {
        worker.postMessage({ action: "PAUSE" });
      }
      setIsActive(!isActive);
      setReset(false);
    }
  }, [isActive, setIsActive, setReset, worker]);

  const handleReset = useCallback(() => {
    if (worker) {
      worker.postMessage({ action: "RESET" });
      setReset(true);
      setIsActive(false);
      setTotalRemainingSeconds(0);
      setTime({ hours: 0, minutes: 25, seconds: 0 });
      document.title = `Pomodoro`;
    }
  }, [setIsActive, setReset, setTime, worker]);

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
      id="main-container"
      className=" w-11/12 sm:w-4/5 md:w-3/4 2xl:w-1/2 h-3/5 p-4 pb-6 flex flex-col items-center justify-center
         bg-red-900 border-2 border-stone-700 rounded-3xl"
    >
      <div id="og-time-container" className="flex flex-col text-white">
        <span>Time Left : {totalRemainingSeconds}</span>
        <span>
          Time Formatted : {time.hours}:{time.minutes}:{time.seconds}
        </span>
        <span>Progress: {progress}</span>
      </div>

      <div
        id="timer-container"
        className="flex items-center justify-center mb-4 min-h-[80%] w-80 "
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
            <div className="flex flex-row items-center justify-center gap-20 bg-stone-900 w-full rounded-lg text-sm text-stone-400 font-normal   ">
              <span>hr</span>
              <span>min</span>
              <span>sec</span>
            </div>
            <div className=" w-full flex flex-row items-center justify-center bg-stone-800 rounded-lg px-2 border-2 border-stone-700 ">
              <input
                disabled={!reset}
                className={`text-6xl font-medium text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80 w-1/3`}
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
                className={`text-6xl font-medium text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80 w-1/3`}
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
                className={`text-6xl font-medium text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80 w-1/3`}
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

      <div id="buttons-container" className="flex flex-row gap-3">
        <button
          className="flex px-2 py-1 bg-stone-300 text-black"
          onClick={handleStart}
        >
          Start
        </button>
        <button
          className="flex px-2 py-1 bg-stone-300 text-black"
          onClick={handlePause}
        >
          Pause/Resume
        </button>
        <button
          className="flex px-2 py-1 bg-stone-300 text-black"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
