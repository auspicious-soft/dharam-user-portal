import { X } from "iconoir-react";
import { useState } from "react";

// Types
interface DraggableItem {
  id: string;
  text: string;
}

interface DropZone {
  id: string;
  label: string;
  correctItemId: string;
  displayText: string;
}

interface DragDropQuestion {
  id: string;
  type: "dragdrop";
  question: string;
  draggableItems: DraggableItem[];
  dropZones: DropZone[];
  qExplanation: string;
}

interface DragDropRendererProps {
  question: DragDropQuestion;
  answers: Record<number, Record<string, string>>;
  setAnswers: (answers: Record<number, Record<string, string>>) => void;
  showResult: boolean;
  currentQuestionIndex: number;
}

export const ExamsDragDropRenderer: React.FC<DragDropRendererProps> = ({
  question,
  answers,
  setAnswers,
  showResult,
  currentQuestionIndex,
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const currentAnswers = answers[currentQuestionIndex] || {};

  const handleDragStart = (itemId: string) => {
    if (!showResult) setDraggedItem(itemId);
  };

  const handleDrop = (zoneId: string) => {
    if (!draggedItem || showResult) return;

    const newAnswers = { ...currentAnswers, [zoneId]: draggedItem };
    setAnswers({ ...answers, [currentQuestionIndex]: newAnswers });
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    if (showResult) return;
    setDraggedItem(itemId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedItem || showResult) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the drop zone element
    const dropZone = element?.closest('[data-drop-zone-id]');
    if (dropZone) {
      const zoneId = dropZone.getAttribute('data-drop-zone-id');
      if (zoneId) {
        handleDrop(zoneId);
      }
    }
    
    setDraggedItem(null);
  };

  const handleRemoveItem = (zoneId: string) => {
    if (showResult) return;
    const newAnswers = { ...currentAnswers };
    delete newAnswers[zoneId];
    setAnswers({ ...answers, [currentQuestionIndex]: newAnswers });
  };

  const usedItems = new Set(Object.values(currentAnswers));
  const availableItems = question.draggableItems.filter(
    (item) => !usedItems.has(item.id),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr_1.4fr] lg:grid-cols-2 gap-4">
        {/* Available Items to Drag */}
        <div>
          {!showResult && availableItems.length > 0 && (
            <div className="">
              <div className="flex flex-wrap flex-col gap-4">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="max-w-52 w-full px-1 md:px-5 py-2.5 bg-light-blue rounded-lg border-[1px] border-dashed border-paragraph text-xs text-paragraph md:text-sm font-medium cursor-move transition-all touch-none"
                  >
                    <div>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Drop Zones with Display Text */}
        <div className="space-y-3">
          {question.dropZones.map((zone) => {
            const droppedItemId = currentAnswers[zone.id];
            const droppedItem = question.draggableItems.find(
              (item) => item.id === droppedItemId,
            );

            return (
              <div key={zone.id} className="flex items-center gap-1 md:gap-4">
                {/* Left Side - Draggable Drop Zone */}
                <div className="max-w-52 w-full flex-shrink-1">
                  <div
                    data-drop-zone-id={zone.id}
                    onDrop={() => handleDrop(zone.id)}
                    onDragOver={handleDragOver}
                    className={`min-h-[50px] px-1 md:px-5 py-2.5 rounded-lg border-1 transition-all flex items-center justify-between border relative
                    ${!droppedItem ? "border border-[#556378]/50 bg-[#f3f3f3]" : ""}
                    ${droppedItem ? "!border-primary_blue bg-[#F0F8FF] text-primary_blue" : ""}
                  `}
                  >
                    {droppedItem ? (
                      <>
                        <span className="text-xs md:text-sm font-medium ">
                          {droppedItem.text}
                        </span>
                        {(
                          <button
                            onClick={() => handleRemoveItem(zone.id)}
                            className="absolute top-[-4px] right-[-4px] text-gray-400 hover:text-gray-600 border border-[#556378]/50 hover:border-[#556378] bg-[#f3f3f3] rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs md:text-sm italic"></span>
                    )}
                  </div>
                </div>

                {/* Right Side - Display Text */}
                <div className="flex-1">
                  <p className="text-[#464646] text-xs md:text-sm font-medium">
                    {zone.displayText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};