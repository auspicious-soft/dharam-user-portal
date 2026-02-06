"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  preview: string | null;
  onChange: (value: string | null) => void;
  buttonLabel?: string;
  containerClass?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  preview,
  onChange,
  buttonLabel = "Upload / Change Image",
  containerClass = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={`flex flex-col gap-4 ${containerClass}`}>
      <div className="h-[280px] bg-[#f8f8f8] rounded-[20px] border border-[#e6e6e6] flex items-center justify-center overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt="Uploaded"
            className="w-full object-cover h-full"
          />
        ) : (
          <span className="text-gray-400 text-sm">No Image</span>
        )}
      </div>

      <Button type="button" onClick={() => fileInputRef.current?.click()}>
        {buttonLabel}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
