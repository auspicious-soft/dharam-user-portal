import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BinMinusIn } from "iconoir-react";
import SuccessfullyIcon from "@/assets/successfully-icon.png";
import CourseSelect from "@/components/reusableComponents/CourseSelect";
import QuestionSuccessDialog from "@/components/dialogs/QuestionSuccessDialog";

interface FileUpload {
  id: string;
  fileName: string;
  duration: string;
  fileType: "" | "PDF" | "Video";
  file: File | null;
  videoUrl: string;
}

interface UploadSection {
  id: string;
  title: string;
  files: FileUpload[];
}

const EditApplicstionTask = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [uploadSections, setUploadSections] = useState<UploadSection[]>([
    {
      id: "1",
      title: "",
      files: [
        {
          id: "1-1",
          fileName: "",
          duration: "",
          fileType: "",
          file: null,
          videoUrl: "",
        },
      ],
    },
  ]);

  const removeFileUpload = (sectionId: string, fileId: string) => {
    setUploadSections(
      uploadSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              files: section.files.filter((file) => file.id !== fileId),
            }
          : section
      )
    );
  };

  const updateFileUpload = (
    sectionId: string,
    fileId: string,
    field: keyof FileUpload,
    value: unknown
  ) => {
    setUploadSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              files: section.files.map((file) =>
                file.id === fileId ? { ...file, [field]: value } : file
              ),
            }
          : section
      )
    );
  };

  const handleSaveChanges = () => {
    if (isEdit) {
      // PUT / PATCH API
      console.log("Updating module", id);
    } else {
      // POST API
      console.log("Creating new module");
    }

    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };
  return (
    <div className="flex flex-col gap-5 ">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <h2 className="text-2xl font-bold">
        Edit Application Task 
        </h2>
        <CourseSelect />
      </div>

      {/* Upload Files Section */}
      <div className="flex flex-col p-4 bg-blue-50 rounded-[20px] gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 w-full">
          <Input type="text" placeholder="Name of Category" />
          <Input type="text" placeholder="Enter Price" />
        </div>
        {uploadSections.map((section) => (
          <div key={section.id} className="flex flex-col gap-2">
            <div className=" space-y-4">
              <div className="space-y-3 lg:pl-7">
                {section.files.map((fileUpload) => (
                  <div
                    key={fileUpload.id}
                    className="flex flex-col items-end gap-4 p-4 lg:p-4 bg-white rounded-lg w-full"
                  >
                    {section.files.length > 1 && (
                      <Button
                        onClick={() =>
                          removeFileUpload(section.id, fileUpload.id)
                        }
                        className=" !bg-[#f50927] rounded-md text-white transition-colors !p-[7.50px] !text-xs !max-w-[90px]"
                      >
                        <BinMinusIn className="w-3 h-3" /> Remove
                      </Button>
                    )}
                    <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4 w-full">
                      <Input
                        type="text"
                        placeholder="Name of file"
                        value={fileUpload.fileName}
                        onChange={(e) =>
                          updateFileUpload(
                            section.id,
                            fileUpload.id,
                            "fileName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1">
                      <Select
                        value={fileUpload.fileType}
                        onValueChange={(value) =>
                          updateFileUpload(
                            section.id,
                            fileUpload.id,
                            "fileType",
                            value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select file type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                        </SelectContent>
                      </Select>

                      {fileUpload.fileType === "Video" && (
                        <Input
                          type="url"
                          placeholder="Enter video URL"
                          value={fileUpload.videoUrl}
                          onChange={(e) =>
                            updateFileUpload(
                              section.id,
                              fileUpload.id,
                              "videoUrl",
                              e.target.value
                            )
                          }
                        />
                      )}

                      {/* PDF / Questionnaire → File upload */}
                      {(fileUpload.fileType === "PDF" ) && (
                        <Input
                          type="file"
                          onChange={(e) =>
                            updateFileUpload(
                              section.id,
                              fileUpload.id,
                              "file",
                              e.target.files?.[0] || null
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 pt-2 max-w-xl ml-auto w-full ">
        <Button variant="outline">Cancel</Button>

        <Button type="submit" className="w-full" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </div>
      {/* Success Dialog */}
      <QuestionSuccessDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        icon={SuccessfullyIcon}
        title="Saved Successfully"
      />
    </div>
  );
};

export default EditApplicstionTask;
