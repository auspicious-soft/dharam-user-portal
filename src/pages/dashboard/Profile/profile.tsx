import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/reusableComponents/ImageUploader";
import api from "@/lib/axios";
import {
  extractS3KeyFromUrl,
  getPublicUrlForKey,
  uploadFileToS3,
} from "@/utils/s3Upload";
import { toast } from "sonner";
export default function Profile() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchProfileStats = async (id: string) => {
    try {
      const response = await api.get(`/user/profile-stats/${id}`);
      const profile =
        (response.data as {
          data?: {
            firstname?: string | null;
            lastname?: string | null;
            email?: string | null;
            countryCode?: string | null;
            phoneNumber?: string | null;
            image?: string | null;
          };
        })?.data ?? {};

      setFirstName(profile.firstname ?? "");
      setLastName(profile.lastname ?? "");
      setEmail(profile.email ?? "");
      setCountryCode(profile.countryCode ?? "+91");
      setPhoneNumber(profile.phoneNumber ?? "");
      const rawImage = profile.image ?? null;
      let previewUrl: string | null = null;
      let key: string | null = null;
      if (rawImage) {
        if (rawImage.startsWith("http")) {
          previewUrl = rawImage;
          key = extractS3KeyFromUrl(rawImage);
        } else {
          previewUrl = getPublicUrlForKey(rawImage);
          key = rawImage;
        }
      }
      setLogoPreview(previewUrl);
      setImageKey(key);
      setSelectedImageFile(null);

      const userPayload = {
        firstname: profile.firstname ?? "",
        lastname: profile.lastname ?? "",
        email: profile.email ?? "",
        image: previewUrl ?? "",
      };
      localStorage.setItem("user", JSON.stringify(userPayload));
      window.dispatchEvent(new Event("userUpdated"));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch profile stats", error);
    }
  };

  useEffect(() => {
    const storedCourseId = localStorage.getItem("selectedCourseId");
    setCourseId(storedCourseId);

    if (storedCourseId) {
      fetchProfileStats(storedCourseId);
    }
  }, []);

  const handleSaveDetails = async () => {
    if (!courseId) {
      toast.error("Please select a course first.");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = logoPreview;
      let finalImageKey = imageKey;

      if (selectedImageFile) {
        const uploadResult = await uploadFileToS3(selectedImageFile, {
          folder: "profile",
        });
        imageUrl = uploadResult.url;
        finalImageKey = uploadResult.key;
      }

      await api.put(`/user/profile-update`, {
        firstname: firstName,
        lastname: lastName,
        email,
        countryCode,
        phoneNumber,
        image: finalImageKey,
      });

      if (courseId) {
        await fetchProfileStats(courseId);
      } else {
        if (imageUrl) {
          setLogoPreview(imageUrl);
        }
        setImageKey(finalImageKey ?? null);
        setSelectedImageFile(null);
        const userPayload = {
          firstname: firstName,
          lastname: lastName,
          email,
          image: imageUrl ?? "",
        };
        localStorage.setItem("user", JSON.stringify(userPayload));
        window.dispatchEvent(new Event("userUpdated"));
      }
      toast.success("Profile updated successfully.");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save profile details", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to save details. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (isChangingPassword) return;

    setIsChangingPassword(true);
    try {
      const response = await api.post("/user/change-password", {
        oldPassword,
        newPassword,
      });
      const successMessage =
        (response.data as { message?: string | null })?.message ??
        "Password changed successfully.";
      toast.success(successMessage);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to change password", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to change password. Please try again.";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex gap-5 w-full flex-col lg:flex-row">
      <div className="">
        <ImageUploader
          preview={logoPreview}
          onChange={setLogoPreview}
          onFileSelect={setSelectedImageFile}
          buttonLabel="Upload / Change Image"
          containerClass="w-full max-w-80 lg:w-[340px] m-auto"
        />
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <div className=" rounded-2xl bg-light-blue p-4 md:p-7 flex flex-col gap-5">
          <h3 className="text-Black_light text-base font-semibold">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              id="first_name"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <Input
              type="text"
              id="last_name"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <Input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              disabled
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex gap-2 relative bg-white rounded-[99px] outline-none w-full border border-[#e8e8e8] text-paragraph text-sm font-light">
              <select
                id="country_code"
                className="outline-none pl-3 pr-0 rounded-tl-[99px] rounded-bl-[99px] text-paragraph text-sm font-light"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+61">+61</option>
                <option value="+91">+91</option>
              </select>

              <Input
                className="border-0 border-l rounded-tl-none rounded-bl-none"
                type="tel"
                id="phone"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              className="px-12"
              onClick={handleSaveDetails}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </div>

        <div className=" rounded-2xl bg-light-blue p-4 md:p-7 flex flex-col gap-5">
          <h3 className="text-Black_light text-base font-semibold">
            Change Password
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              type="password"
              id="old_password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <Input
              type="password"
              id="new_password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              type="password"
              id="confirm_password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              className="!px-12"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
