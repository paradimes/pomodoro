import { useCallback, useEffect, useState } from "react";

type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

export default function Pomodoro() {
  const [time, setTime] = useState<Time>({
    hours: 0,
    minutes: 1,
    seconds: 10,
  });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(true);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);

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
      setTime((prevTime) => ({
        ...prevTime,
        [timeUnit]: value,
      }));
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

  // progress bar
  const radius = 150;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // updating the time
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          const newTime: Time = { ...prevTime };

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
              } else {
                clearInterval(timer);
                setIsActive(false);
              }
            }
          }

          const remainingSeconds =
            newTime.hours * 3600 + newTime.minutes * 60 + newTime.seconds;
          const newProgress: number =
            (remainingSeconds / initialTotalSeconds) * 100;
          if (remainingSeconds > initialTotalSeconds) {
            setInitialTotalSeconds(remainingSeconds);
          } else {
            setProgress(newProgress);
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [initialTotalSeconds, isActive]);

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
  }, [initialTotalSeconds, time]);

  const handlePause = () => {
    setReset(false);
    setIsActive(false);
  };

  const handleReset = () => {
    setReset(true);
    setIsActive(false);
    setTime({
      hours: 0,
      minutes: 0,
      seconds: 10,
    });
    setInitialTotalSeconds(0);
    setProgress(100);
    document.title = "Pomodoro";
  };

  useEffect(() => {
    const handleSpacebarPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
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
  }, [handleStart, isActive]);

  return (
    <div
      className="w-1/2 h-1/2 p-4 flex flex-col items-center justify-center
         bg-stone-900 border-4 border-stone-300 rounded-3xl"
    >
      <div
        id="timer"
        className="flex items-center justify-center mb-4 min-h-[80%]  "
      >
        {!reset && (
          <>
            <svg id="timer-progress-bar" height={radius * 2} width={radius * 2}>
              <circle
                stroke="#f97316"
                fill="#a8a29e"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="##84cc16"
                fill="#1c1917"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius - 2}
                cx={radius}
                cy={radius}
              />
            </svg>
            <span id="time" className="absolute text-5xl font-bold text-white">
              {`${String(time.hours).padStart(2, "0")}:${String(
                time.minutes
              ).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`}
            </span>
          </>
        )}
        {
          reset && (
            <div className="absolute w-1/5 flex flex-row items-center justify-center bg-stone-500 rounded-lg ">
              <input
                disabled={!reset}
                className={`text-5xl font-bold text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80`}
                type="number"
                min="0"
                max="10"
                value={String(time.hours).padStart(2, "0")}
                onChange={handleTimeChange("hours")}
                onKeyDown={handleTimerInputKeyPress}
              />
              <span className="text-5xl font-bold text-white bg-transparent">
                :
              </span>
              <input
                disabled={!reset}
                className={`text-5xl font-bold text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80`}
                type="number"
                min="0"
                max="59"
                value={String(time.minutes).padStart(2, "0")}
                onChange={handleTimeChange("minutes")}
                onKeyDown={handleTimerInputKeyPress}
              />
              <span className="text-5xl font-bold text-white bg-transparent">
                :
              </span>
              <input
                disabled={!reset}
                className={`text-5xl font-bold text-white bg-transparent text-center border-none outline-none focus:bg-orange-400 focus:bg-opacity-80`}
                type="number"
                min="0"
                max="59"
                value={String(time.seconds).padStart(2, "0")}
                onChange={handleTimeChange("seconds")}
                onKeyDown={handleTimerInputKeyPress}
              />
            </div>
          )
          //  : (
          //   <span id="time" className="absolute text-5xl font-bold text-white">
          // {`${String(time.hours).padStart(2, "0")}:${String(
          //   time.minutes
          // ).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`}
          //   </span>
          // )
        }
      </div>

      <div
        id="button-options"
        className=" w-1/2 flex flex-row  items-center justify-center gap-[10%] mt-[3%]"
      >
        <button
          id="reset-button"
          disabled={reset}
          onClick={handleReset}
          className="flex items-center justify-center w-1/3 h-full bg-stone-300 p-2 "
        >
          Reset (Esc)
        </button>
        <button
          id="start-stop-button"
          onClick={isActive ? handlePause : handleStart}
          className={`flex w-1/3 h-full p-2 text-center 
          ${
            isActive
              ? `bg-red-400`
              : !isActive && !reset
              ? `bg-green-400`
              : `bg-stone-300`
          }`}
        >{`${
          isActive
            ? `Pause (SpacebarIcon)`
            : !isActive && !reset
            ? `Resume (SpacebarIcon)`
            : `Start(SpacebarIcon)`
        }`}</button>
      </div>
    </div>
  );
}
