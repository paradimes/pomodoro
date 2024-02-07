let countdownTime = null;
let pauseTime = null;
let intervalId = null;

const updateCountdown = () => {
  console.log("hello from updateCountdown()");
  const currentTime = Date.now();
  const timeLeft = countdownTime - currentTime;
  let secondsLeft;

  // Check if the countdown is complete
  if (timeLeft <= 0) {
    clearInterval(intervalId);
  } else {
    // Calculate remaining time and post message
    secondsLeft = Math.round(timeLeft / 1000);
  }
  postMessage(secondsLeft);
};

self.onmessage = (e) => {
  if (e.data.action === "START") {
    countdownTime = e.data.endTime;
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(updateCountdown, 1000);
    console.log("WEBWORKER START");
    pauseTime = null; // Reset pause time
  } else if (e.data.action === "RESET") {
    clearInterval(intervalId);
    intervalId = null;
    pauseTime = null; //
    countdownTime = null;
    // postMessage("RESET");
  } else if (e.data.action === "PAUSE") {
    clearInterval(intervalId);
    intervalId = null;
    pauseTime = Date.now();
    // postMessage("PAUSED");
    console.log("WEBWORKER PAUSED");
  } else if (e.data.action === "RESUME") {
    if (countdownTime && intervalId === null && pauseTime) {
      const pausedDuration = Date.now() - pauseTime;
      countdownTime += pausedDuration;
      intervalId = setInterval(updateCountdown, 1000);
      pauseTime = null;
      // postMessage("RESUMED");
      console.log("WEBWORKER RESUMED");
    }
  }
};
