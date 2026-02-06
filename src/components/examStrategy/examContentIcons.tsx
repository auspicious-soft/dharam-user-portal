import { ContentType } from "../examStrategy/examtypes";
import VideoIcon from "@/assets/video-icon.png"
import PdfIcon from "@/assets/pdf.png"

export const contentIconMap: Record<ContentType, JSX.Element> = {
  video: <img src={VideoIcon} alt="Video icon" className="max-w-[32px]" />,
  pdf: <img src={PdfIcon} alt="PDF icon" className="max-w-[32px]" />,
};
