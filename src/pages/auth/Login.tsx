import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../auth/Authenticated";
import { Input } from "../../components/ui/input";
import { Lock, Eye, EyeClosed, MailOpen, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/utils/svgicons";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(); // fake login
    navigate("/", { replace: true });
  };

  return (
    <div>
      <div className="mb-4 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold capitalize leading-[46px] text-center text-[#1f1f1f]">
          Welcome Back
        </h2>
        <p className="text-paragraph text-base font-normal ">
         Login to Your account to access the exam simulator.
        </p>
      </div>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="relative">
          <MailOpen
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9}
          />
          <Input type="email" placeholder="Email Address" className="pl-12" />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9}
          />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="pl-12 pr-10"
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
        <div className="mt-[-6px] text-right ">
          <Link
            to="/forgot-password"
            className=" text-paragraph text-sm font-normal leading-[22px] ml-auto"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit">
          Login <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-sm text-paragraph text-center ">
          Don’t have an account? {" "} 
          <Link
            to="/create-account"
            className="underline"
          > Create One.</Link>
        </p>
        <div className="self-stretch inline-flex justify-start items-center gap-[30px] my-3">
          <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>
          <div className="text-center justify-start text-paragraph text-sm font-normal leading-[22px]">
            Or
          </div>
          <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>
        </div>
        <Button
          className="shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]"
          variant="secondary"
        >
          <GoogleIcon />
          <div className=" text-sm ">Continue with Google</div>
        </Button>
      </form>
    </div>
  );
};

export default Login;
