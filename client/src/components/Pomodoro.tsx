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
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [editable, setEditable] = useState<boolean>(false);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes, seconds] = event.target.value.split(":");
    setTime({
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      seconds: parseInt(seconds),
    });
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
          setProgress(newProgress);

          return newTime;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [initialTotalSeconds, isActive]);

  const handleStart = useCallback(() => {
    setIsActive(true);
    if (initialTotalSeconds === 0) {
      const totalSeconds: number =
        time.hours * 3600 + time.minutes * 60 + time.seconds;
      setInitialTotalSeconds(totalSeconds);
    }
  }, [initialTotalSeconds, time]);

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime({
      hours: 0,
      minutes: 0,
      seconds: 10,
    });
    setInitialTotalSeconds(0);
    setProgress(100);
  };

  useEffect(() => {
    const handleSpacebarPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        if (isActive) {
          handlePause();
        } else {
          handleStart();
        }
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
      <div id="timer" className="flex items-center justify-center mb-4">
        <svg id="timer-progress-bar" height={radius * 2} width={radius * 2}>
          <circle
            stroke="#ef4444"
            fill="black"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {editable ? (
          <input
            className="flex absolute text-5xl font-bold text-white bg-transparent"
            type="text"
            value={`${String(time.hours).padStart(2, "0")}:${String(
              time.minutes
            ).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`}
            onChange={handleTimeChange}
            onBlur={() => setEditable(false)}
          />
        ) : (
          <span
            id="time"
            className="absolute text-5xl font-bold text-white"
            onClick={() => !isActive && setEditable(true)}
          >
            {`${String(time.hours).padStart(2, "0")}:${String(
              time.minutes
            ).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`}
          </span>
        )}

        {/* <span
          id="time"
          className=" absolute text-5xl font-bold text-white "
        >{`${String(time.hours).padStart(2, "0")}:${String(
          time.minutes
        ).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`}</span> */}
      </div>

      <div
        id="button-options"
        className="
        w-1/4 flex flex-row items-center justify-center gap-[10%] mt-[3%]"
      >
        <button
          id="start-button"
          onClick={handleStart}
          className="w-1/3 h-full bg-stone-300 p-2 "
        >
          Start
        </button>
        <button
          id="pause-button"
          onClick={handlePause}
          className="w-1/3 h-full bg-stone-300 p-2 "
        >
          Pause
        </button>
        <button
          id="reset-button"
          onClick={handleReset}
          className="w-1/3 h-full bg-stone-300 p-2 "
        >
          Reset
        </button>
        <button id="settings-button" className="w-1/3 h-full bg-stone-300 p-2 ">
          Settings
        </button>
      </div>
    </div>
  );
}
