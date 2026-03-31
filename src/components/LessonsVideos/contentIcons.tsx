import { ContentType } from "./types";

const videoIconUrl = new URL("../../assets/video-icon.png", import.meta.url)
  .href;
const slideIconUrl = new URL("../../assets/slide-icon.png", import.meta.url)
  .href;
const quizIconUrl = new URL("../../assets/question-icon.png", import.meta.url)
  .href;

export const contentIconMap: Record<ContentType, JSX.Element> = {
  video: (
    <img
      src={videoIconUrl}
      alt="Video icon"
      className="max-w-[32px] rounded-full"
    />
  ),
  slide: (
    <img
      src={slideIconUrl}
      alt="Slide icon"
      className="max-w-[32px] rounded-full"
    />
  ),
  quiz: (
    <img
      src={quizIconUrl}
      alt="Quiz icon"
      className="max-w-[32px] rounded-full"
    />
  ),
};
