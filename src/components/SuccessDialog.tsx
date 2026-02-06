import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  onConfirm?: () => void;
  icon?: React.ReactNode; 
  image?: string; 
  buttonLink?: string; 
}

const SuccessDialog = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "Continue",
  onConfirm,
  icon,
  image,
  buttonLink,
}: SuccessDialogProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="md:gap-4">
          {/* Icon or Image */}
          {(icon || image) && (
            <div className="flex justify-center mb-4">
              {icon ? (
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100">
                  {icon}
                </div>
              ) : image ? (
                <img
                  src={image}
                  alt="Dialog icon"
                  className="w-16 md:w-24  object-contain"
                />
              ) : null}
            </div>
          )}

          <DialogTitle className="text-center text-2xl lg:text-3xl  text-Black_light md:text-3xl font-bold capitalize leading-[45px] md:leading-[65px]">{title}</DialogTitle>
          <DialogDescription className=" self-stretch text-center justify-start text-[#444444] text-base font-medium leading-[24px]">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center pt-4">
          {buttonLink ? (
            <Link to={buttonLink} className="w-full">
              <Button onClick={handleConfirm} className="w-full">
                {buttonText} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Button onClick={handleConfirm} className="w-full">
              {buttonText} <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;