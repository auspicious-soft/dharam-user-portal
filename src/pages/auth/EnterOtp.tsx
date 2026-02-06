import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";

import SuccessDialog from "@/components/SuccessDialog";
import SuccessIcon from "@/assets/account-created.png";

const EnterOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode } = location.state || {};

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const CORRECT_OTP = "1234";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 4) {
      setError("Please enter a 4-digit OTP");
      return;
    }

    if (otp !== CORRECT_OTP) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    setError("");

    // ✅ DIFFERENT FLOW
    if (mode === "signup") {
      setIsDialogOpen(true);
    } else {
      navigate("/create-new-password");
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
            placeholder="1234"
            maxLength={4}
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

        <Button type="submit" className="w-full">
          Continue <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <p className="text-paragraph text-sm font-normal leading-[22px]">
            Haven't received it?{" "}
            <button
              type="button"
              className="underline text-paragraph text-sm font-normal leading-[22px]"
            >
              Resend in
            </button>{" "}
            <span className="font-bold text-Black_light">02:00 sec</span>
          </p>
        </div>
      </form>

      {/* ✅ SUCCESS FOR SIGNUP */}
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
