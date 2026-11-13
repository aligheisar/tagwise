import cliSpinners, { type SpinnerName } from "cli-spinners";
import { useEffect, useState } from "react";

export const Spinner = ({
  color,
  name = "dots",
}: {
  color?: string;
  name?: SpinnerName;
}) => {
  const spinner = cliSpinners[name];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((index) => (index + 1) % spinner.frames.length);
    }, spinner.interval);

    return () => clearInterval(timer);
  }, [spinner]);

  return <text fg={color}>{spinner.frames[frameIndex]}</text>;
};
