import { useState, type MouseEvent } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type FlashCardItemProps = {
  frontText: string;
  backText: string;
  frontImage?: string;
  backImage?: string;
  isLocked?: boolean;
  isPurchasing?: boolean;
  onPurchase?: () => void;
};

const FlashCardsItem = ({
  frontText,
  backText,
  frontImage,
  backImage,
  isLocked = false,
  isPurchasing = false,
  onPurchase,
}: FlashCardItemProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const hasFrontText = Boolean(frontText.trim());
  const hasBackText = Boolean(backText.trim());
  const hasFrontImage = Boolean(frontImage);
  const hasBackImage = Boolean(backImage);
  const openImagePreview = (event: MouseEvent, image?: string) => {
    event.stopPropagation();
    if (!image || isLocked) return;
    setPreviewImage(image);
  };
  const handleFlip = (event: MouseEvent) => {
    event.stopPropagation();
    if (isLocked) return;
    setIsFlipped((prev) => !prev);
  };

  const renderImageWithActions = (
    image: string,
    className: "object-cover" | "object-contain"
  ) => (
    <div className="relative w-full h-full group/image">
      <img
        src={image}
        alt="Flash card"
        className={`w-full h-full ${className} object-contain`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-Black_light hover:bg-slate-100"
          onClick={(event) => openImagePreview(event, image)}
        >
          See Image
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full text-xs font-semibold bg-primary_heading text-white hover:bg-primary_blue"
          onClick={handleFlip}
        >
          Flip
        </button>
      </div>
    </div>
  );

  const renderFaceContent = (
    text: string,
    image?: string,
    fallbackText = "No content available"
  ) => {
    const hasText = Boolean(text.trim());
    const hasImage = Boolean(image);

    if (isLocked) {
      return (
        <h4 className="w-full max-h-full overflow-y-auto break-words whitespace-pre-wrap text-center text-sm font-medium leading-6 text-Desc-464646">
          
        </h4>
      );
    }

    if (hasText && hasImage) {
      return (
        <div className="w-full h-full flex flex-col gap-3">
          <div className="w-full h-28 rounded-xl overflow-hidden bg-white/70 border border-[#556378]/20">
            {renderImageWithActions(image, "object-cover")}
          </div>
          <div
            className="flex-1 overflow-y-auto break-words text-center text-sm font-medium leading-6 text-Desc-464646 [&_p]:my-0 [&_strong]:font-bold [&_b]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );
    }

    if (hasImage) {
      return (
        <div className="w-full h-full rounded-xl overflow-hidden bg-white/70 border border-[#556378]/20">
          {renderImageWithActions(image, "object-contain")}
        </div>
      );
    }

    if (hasText) {
      return (
        <div
          className="w-full max-h-full overflow-y-auto break-words whitespace-pre-wrap text-center text-sm font-medium leading-6 text-Desc-464646 [&_p]:my-0 [&_strong]:font-bold [&_b]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    return (
      <h4 className="w-full max-h-full overflow-y-auto break-words whitespace-pre-wrap text-center text-sm font-medium leading-6 text-Desc-464646">
        {fallbackText}
      </h4>
    );
  };

  return (
    <>
      <div
        onClick={() => {
          if (!isLocked) {
            setIsFlipped((prev) => !prev);
          }
        }}
        className={`relative min-h-56 ${isLocked ? "" : "cursor-pointer"}`}
      >
        <div className="w-full h-full [perspective:1000px]">
          <div
            className={`relative w-full h-full transition-transform duration-500 ${
              isLocked ? "opacity-80" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center p-4 bg-light-blue rounded-[20px] outline outline-1 outline-[#556378]/40 hover:shadow-md transition-shadow overflow-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              {renderFaceContent(
                frontText,
                frontImage,
                hasBackText || hasBackImage
                  ? "Flip to see answer"
                  : "No front content available"
              )}
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center p-4 bg-light-blue rounded-[20px] outline outline-1 outline-[#556378]/40 hover:shadow-md transition-shadow overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {renderFaceContent(
                backText,
                backImage,
                hasFrontText || hasFrontImage
                  ? "Flip to see front"
                  : "No back content available"
              )}
            </div>
          </div>
        </div>
        {isLocked ? (
          <div className="absolute inset-0 rounded-[20px] bg-white/25 flex items-center justify-center">
            <button
              type="button"
              className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#ff6402] to-[#fdb22b] disabled:opacity-70"
              onClick={(event) => {
                event.stopPropagation();
                onPurchase?.();
              }}
              disabled={isPurchasing}
            >
              {isPurchasing ? "Processing..." : "Premium"}
            </button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPreviewImage(null);
          }
        }}
      >
        <DialogContent className="w-[96vw] max-w-4xl p-4 md:p-6">
          <DialogTitle className="pr-8 text-base md:text-lg">
            Image Preview
          </DialogTitle>
          {previewImage ? (
            <div className="max-h-[75vh] overflow-auto rounded-lg bg-[#EDF4FD] p-3 md:p-4 flex items-center justify-center">
              <img
                src={previewImage}
                alt="Flash card preview"
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlashCardsItem;
