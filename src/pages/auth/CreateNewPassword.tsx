import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Lock, Eye, EyeClosed, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

const MIN_PASSWORD_LENGTH = 5;

const CreateNewPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (isSubmitting) {
      return;
    }

    const changePasswordToken = localStorage.getItem("changePasswordToken");
    if (!changePasswordToken) {
      setError("Session expired. Please verify OTP again.");
      navigate("/forgot-password", { replace: true });
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post(
        "/update-password",
        { password: trimmedPassword },
        {
          headers: {
            Authorization: `Bearer ${changePasswordToken}`,
          },
        }
      );

      const successMessage =
        (response.data as { message?: string | null })?.message ??
        "Password updated successfully";
      toast.success(successMessage);

      localStorage.removeItem("changePasswordToken");
      localStorage.removeItem("verificationToken");

      navigate("/login", { replace: true });
    } catch (requestError: unknown) {
      const message =
        (requestError as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? "Failed to update password.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold capitalize leading-[46px] text-center text-[#1f1f1f]">
          Create New Password
        </h2>
        <p className="text-paragraph text-base font-normal">
          Create a strong password to protect your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9}
          />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="pl-12 pr-10"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-input-888 hover:text-dark-bg"
          >
            {showPassword ? (
              <EyeClosed className="w-4 h-4" strokeWidth={0.9} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={0.9} />
            )}
          </button>
        </div>

        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9}
          />
          <Input
            type={confirmShowPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="pl-12 pr-10"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
          />
          <button
            type="button"
            onClick={() => setConfirmShowPassword(!confirmShowPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-input-888 hover:text-dark-bg"
          >
            {confirmShowPassword ? (
              <EyeClosed className="w-4 h-4" strokeWidth={0.9} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={0.9} />
            )}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Confirm"}{" "}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};

export default CreateNewPassword;
