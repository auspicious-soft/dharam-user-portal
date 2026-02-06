import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { MailOpen, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    navigate("/enter-otp", {
      state: {
        mode: "forgot",
        email,
      },
    });
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
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit">
          Verify Email <ArrowRight className="w-5 h-5" />
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
