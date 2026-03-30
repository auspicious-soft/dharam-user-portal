import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { MailOpen, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/forget-password", {
        email: trimmedEmail,
      });

      const resetToken =
        (response.data as { data?: { resetToken?: string | null } })?.data
          ?.resetToken ?? null;
      if (resetToken) {
        localStorage.setItem("verificationToken", resetToken);
      }

      const successMessage =
        (response.data as { message?: string | null })?.message ??
        "OTP sent successfully";
      toast.success(successMessage);

      navigate("/enter-otp", {
        state: {
          mode: "forgot",
          email: trimmedEmail,
        },
      });
    } catch (requestError: unknown) {
      const message =
        (requestError as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? "Failed to send OTP.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold capitalize leading-[46px] text-center text-[#1f1f1f]">
          Forgot Password?
        </h2>
        <p className="text-paragraph text-base font-normal max-w-[350px] w-full m-auto">
          Reset your password by email link and set a new one securely.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="relative">
          <MailOpen
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9}
          />
          <Input
            type="email"
            placeholder="Email Address"
            className="pl-12"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Verify Email"}{" "}
          <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <p className="text-paragraph text-sm font-normal leading-[22px]">
            Remember Password?{" "}
            <Link
              to="/login"
              className="underline text-paragraph text-sm font-normal leading-[22px]"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
