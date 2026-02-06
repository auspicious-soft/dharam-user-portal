import { ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type DataTableActionsProps = {
  viewPath?: string;
  editPath?: string;

  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const DataTableActions = ({
  viewPath,
  onView,
}: DataTableActionsProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) return onView();
    if (viewPath) navigate(viewPath);
  };


  return (
    <>
      <div className="flex gap-2">
        {/* VIEW */}
        {(onView || viewPath) && (
          <Button
            className="rounded-lg"
            size="icon"
            onClick={handleView}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

      </div>

    </>
  );
};

export default DataTableActions;
