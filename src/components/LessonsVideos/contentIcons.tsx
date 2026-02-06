import { ContentType } from "./types";
import VideoIcon from "@/assets/video-icon.png"
import slideIcon from "@/assets/slide-icon.png"
import QuizIcon from "@/assets/question-icon.png"

export const contentIconMap: Record<ContentType, JSX.Element> = {
  video: <img src={VideoIcon} alt="Video icon" className="max-w-[32px] rounded-full" />,
  slide: <img src={slideIcon} alt="Slide icon" className="max-w-[32px] rounded-full" />,
  quiz: <img src={QuizIcon} alt="Quiz icon" className="max-w-[32px] rounded-full" />,
};
