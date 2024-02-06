import { useEffect, useState } from "react";
import TimerWorker from "../../public/countdownWorker.js?worker";
import { Time } from "./Pomodoro";

export default function TimerTesting() {
  const [time, setTime] = useState<string>("");
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeFormatted, setTimeFormatted] = useState<Time>({
    hours: 0,
    minutes: 25,
    seconds: 0,
  });
  const [progress, setProgress] = useState<number>(100);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(0);

  useEffect(() => {
    const newWorker = new TimerWorker();

    newWorker.onmessage = (e) => {
      const remainingSeconds = e.data;
      setTime(remainingSeconds);
      document.title = `${remainingSeconds} Pomodoro`;

      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      setTimeFormatted({ hours, minutes, seconds });

      const newProgress = (remainingSeconds / initialTotalSeconds) * 100;
      setProgress(newProgress);
    };

    setWorker(newWorker);

    return () => {
      newWorker.terminate();
      document.title = `Pomodoro`;
    };
  }, [initialTotalSeconds]);

  const startTimer = () => {
    if (worker) {
      const timerDurationMilliseconds =
        (timeFormatted.hours * 3600 +
          timeFormatted.minutes * 60 +
          timeFormatted.seconds) *
        1000;
      const endTime = new Date().getTime() + timerDurationMilliseconds;
      if (initialTotalSeconds === 0) {
        // const totalSeconds: number =
        //   timeFormatted.hours * 3600 +
        //   timeFormatted.minutes * 60 +
        //   timeFormatted.seconds;
        setInitialTotalSeconds(timerDurationMilliseconds / 1000);
      }

      worker.postMessage({ action: "START", endTime: endTime });
    }
  };

  const pauseResumeTimer = () => {
    if (worker) {
      if (isPaused) {
        // If currently paused, resume the timer
        worker.postMessage({ action: "RESUME" });
      } else {
        // If currently running, pause the timer
        worker.postMessage({ action: "PAUSE" });
      }
      // Toggle the pause state
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    if (worker) {
      worker.postMessage({ action: "RESET" });
      setTime("");
      setTimeFormatted({ hours: 0, minutes: 25, seconds: 0 });
      document.title = `Pomodoro`;
    }
  };

  return (
    <div className="text-white flex flex-col gap-3">
      Time Left : {time}
      <span>
        Time Formatted : {timeFormatted.hours}:{timeFormatted.minutes}:
        {timeFormatted.seconds}
      </span>
      <span>Progress: {progress}</span>
      <div className="flex flex-row gap-3">
        <button
          className="flex px-2 py-1 bg-stone-300 text-black"
          onClick={startTimer}
        >
          Start
        </button>
        <button
          className="flex px-2 py-1 bg-stone-300 text-black"
          onClick={pauseResumeTimer}
        >
          Pause/Resume
        </button>
        <button
          className="flex px-2 py-1 bg-stone-300 text-black"
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
