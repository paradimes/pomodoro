/* eslint-disable @typescript-eslint/no-unused-vars */
type CircleProgressBarProps = {
  percentage: number;
  circleWidth: number;
};

export default function CircleProgressBar({
  percentage,
  circleWidth,
}: CircleProgressBarProps) {
  // circle details
  const radius = 85;
  const dashArray = 2 * Math.PI * radius; // circumference
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  // details:
  // circleWidth = 200px is the container of the circle.
  // radius = 85, diameter = 170

  return (
    <div>
      <svg
        className="border-2 border-red-500"
        width={circleWidth}
        height={circleWidth}
        viewBox={`0 0 ${circleWidth} ${circleWidth}`}
      >
        <circle
          id="circle-background"
          r={radius}
          fill="none"
          strokeWidth={"8px"}
          stroke="#78716c" //gray
          cx={circleWidth / 2}
          cy={circleWidth / 2}
        />
        <circle
          id="circle-progress"
          r={radius}
          fill="none"
          stroke="#ea580c" //orange
          strokeWidth={"8px"}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeLinejoin="round"
          cx={circleWidth / 2}
          cy={circleWidth / 2}
          transform={`rotate(-90 ${circleWidth / 2} ${circleWidth / 2})`}
        />
        {/* <text
          className="text-white text-lg"
          dy={"0.3em"}
          x={"50%"}
          y={"50%"}
          textAnchor="middle"
          color="white"
        >
          {percentage}%
        </text> */}
      </svg>
    </div>
  );
}
