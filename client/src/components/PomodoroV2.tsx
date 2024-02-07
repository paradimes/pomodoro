import { useCallback, useContext, useEffect } from "react";
import TimerWorker from "../../public/countdownWorker.js?worker";
import { TimerContext } from "../context/TimerContext";
import bell from "../assets/old-church-bell.mp3";

export type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

export default function PomodoroV2() {
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
    worker,
    setWorker,
    totalRemainingSeconds,
    setTotalRemainingSeconds,
  } = timerContext;

  // Progress bar properties
  const radius = 150;
  const stroke = 5;
  const circleWidth = 2 * radius + stroke;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - (dashArray * progress) / 100;

  // Start and Pause handlers
  const handleStart = useCallback(() => {
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

  // Initial reset
  useEffect(() => {
    handleReset();
  }, [handleReset]);

  // Web Worker initialization
  useEffect(() => {
    const newWorker = new TimerWorker();

    newWorker.onmessage = (e) => {
      const remainingSeconds = e.data;
      setTotalRemainingSeconds(remainingSeconds);

      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      setTime({ hours, minutes, seconds });
    };

    setWorker(newWorker);

    return () => {
      newWorker.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer progress handler (in-progress + finished)
  useEffect(() => {
    if (isActive) {
      const newProgress = (totalRemainingSeconds / initialTotalSeconds) * 100;
      setProgress(newProgress);
    }

    if (totalRemainingSeconds === 0 && isActive) {
      const audio = new Audio(bell);
      audio.play();
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalRemainingSeconds]);

  // Document title updates
  useEffect(() => {
    if (!reset) {
      document.title = `(${
        time.hours ? String(time.hours).padStart(2, "0") + ":" : ""
      }${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(
        2,
        "0"
      )}) Pomodoro`;
    } else {
      document.title = "Pomodoro";
    }
  }, [reset, time.hours, time.minutes, time.seconds]);

  // Timer Start and Reset by key handler
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
         bg-stone-900 border-2 border-stone-700 rounded-3xl"
    >
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

      <div className="mt-5 flex flex-row  items-center justify-center rounded-md text-sm sm:text-base w-5/6 sm:w-4/6 md:w-3/5 lg:w-1/2 bg-stone-800 border-[0.5px] border-stone-600 overflow-hidden">
        <button
          id="reset-button"
          onClick={handleReset}
          className={`w-1/2 h-full text-stone-400 text-center  hover:bg-stone-600 active:bg-stone-500
       border-r-[0.5px] border-stone-600 focus:outline-none focus:border-none   `}
        >
          Reset
        </button>
        <button
          id="start-stop-button"
          onClick={isActive ? handlePause : handleStart}
          className={`w-1/2 h-full text-stone-200 text-center focus:outline-none focus:border-none  ${
            isActive
              ? `bg-red-700 hover:bg-red-600 active:bg-red-500 `
              : `bg-green-700 hover:bg-green-600 active:bg-green-500 `
          } `}
        >
          {`${isActive ? `Pause` : !isActive && !reset ? `Resume` : `Start`}`}
        </button>
      </div>
    </div>
  );
}
