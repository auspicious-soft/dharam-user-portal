import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { login } from "@/auth/Authenticated";
import { toast } from "sonner";

import SuccessDialog from "@/components/SuccessDialog";
import SuccessIcon from "@/assets/account-created.png";

const RESEND_SECONDS = 60;

const EnterOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode } = location.state || {};

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatResendTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
      2,
      "0"
    )} sec`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const verificationToken = localStorage.getItem("verificationToken");
      const response = await api.post(
        "/verify-otp",
        { otp },
        verificationToken
          ? {
              headers: {
                Authorization: `Bearer ${verificationToken}`,
              },
            }
          : undefined
      );
      const accessToken =
        (response.data as { data?: { accessToken?: string | null } })?.data
          ?.accessToken ?? null;

      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
      }

      const successMessage =
        (response.data as { message?: string | null })?.message ??
        "OTP verified";
      toast.success(successMessage);

      login();

      if (mode === "signup") {
        setIsDialogOpen(true);
      } else {
        navigate("/create-new-password");
      }
    } catch (requestError: unknown) {
      const message =
        (requestError as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? "OTP verification failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || isResending) {
      return;
    }

    const verificationToken = localStorage.getItem("verificationToken");
    if (!verificationToken) {
      setError("Verification token missing. Please sign up again.");
      return;
    }

    setError("");
    setIsResending(true);

    try {
      const response = await api.get(
        "/resend-otp",
        {
          headers: {
            Authorization: `Bearer ${verificationToken}`,
          },
        }
      );

      const newToken =
        (response.data as { data?: { resetToken?: string | null } })?.data
          ?.resetToken ?? null;

      if (newToken) {
        localStorage.setItem("verificationToken", newToken);
      }

      const successMessage =
        (response.data as { message?: string | null })?.message ??
        "OTP resent";
      toast.success(successMessage);

      setResendSeconds(RESEND_SECONDS);
    } catch (requestError: unknown) {
      const message =
        (requestError as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? "Failed to resend OTP.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleConfirm = () => {
    setIsDialogOpen(false);
    navigate("/login");
  };

  return (
    <div>
      <div className="mb-4 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold capitalize leading-[46px] text-center text-[#1f1f1f]">
          Enter OTP
        </h2>

        <p className="text-paragraph text-base font-normal max-w-[400px] w-full m-auto">
          Enter the one-time code sent to your registered email address.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="relative max-w-72 w-full m-auto">
          <Input
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            className="text-center"
          />

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Continue"}{" "}
          <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <p className="text-paragraph text-sm font-normal leading-[22px]">
            Haven't received it?{" "}
            <button
              type="button"
              className={`underline text-paragraph text-sm font-normal leading-[22px] ${
                resendSeconds > 0 || isResending
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleResend}
              disabled={resendSeconds > 0 || isResending}
            >
              {resendSeconds > 0 ? "Resend in" : "Resend OTP"}
            </button>{" "}
            {resendSeconds > 0 && (
              <span className="font-bold text-Black_light">
                {formatResendTime(resendSeconds)}
              </span>
            )}
          </p>
        </div>
      </form>

      {/* SUCCESS FOR SIGNUP */}
      <SuccessDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Account Created"
        description="Your account has been created. Login to continue."
        buttonText="Login"
        image={SuccessIcon}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default EnterOtp;
