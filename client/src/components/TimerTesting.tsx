import { useEffect, useState } from "react";
import TimerWorker from "../../public/countdownWorker.js?worker";

export default function TimerTesting() {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const newWorker = new TimerWorker();

    newWorker.onmessage = (e) => {
      setTimeLeft(e.data);
      document.title = `${e.data} Pomodoro`;
    };

    setWorker(newWorker);

    return () => {
      newWorker.terminate();
      document.title = `Pomodoro`;
    };
  }, []);

  const startTimer = () => {
    if (worker) {
      const endTime = new Date().getTime() + 5 * 60 * 1000; // 5 mins in milliseconds
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
      setTimeLeft("");
      document.title = `Pomodoro`;
    }
  };

  return (
    <div className="text-white flex flex-col gap-3">
      Time Left : {timeLeft}
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
