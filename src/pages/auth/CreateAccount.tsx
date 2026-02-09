import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import {
  Lock,
  Eye,
  EyeClosed,
  ArrowRight,
  MailOpen,
  User,
} from "iconoir-react";
import { Button } from "@/components/ui/button";

const CreateAccount = () => {
 const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName || !email || !password || !confirmPassword) {
      setError("Please fill all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
navigate("/enter-otp", {
      state: {
        mode: "signup",
        email,
      },
    });
  };



  return (
    <div>
      <div className="mb-4 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold capitalize leading-[46px] text-center text-[#1f1f1f]">
        Create Account
        </h2>
        <p className="text-paragraph text-base font-normal max-w-80 w-full m-auto">
          By continuing, you agree to our{" "}
          <Link to="#" className="text-primary_heading ">
            Terms
          </Link>{" "}
          &{" "}
          <Link to="#" className="text-primary_heading">
            Privacy Policy.
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <User
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9}
          />
          <Input
            type="text"
            placeholder="First Name"
            className="pl-12"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="relative">
          <User
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9}
          />
          <Input
            type="text"
            placeholder="Last Name"
            className="pl-12"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError("");
            }}
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-center justify-start text-[#556378]/40 text-[10px] font-normal italic">
            Optional
          </div>
        </div>
        </div>

        {/* Email Field */}
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

        <div className="flex gap-2 relative bg-white rounded-[99px] outline-none w-full border border-[#e8e8e8] text-paragraph text-sm font-light">
          <select
            id="country_code"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="outline-none pl-3 pr-0 rounded-tl-[99px] rounded-bl-[99px] text-paragraph text-sm font-light"
          >
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
          </select>

          <Input
            className="border-0 border-l rounded-tl-none rounded-bl-none"
            type="tel"
            id="phone"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Password */}
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

        {/* Confirm Password */}
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

        <Button type="submit">
          Create Account <ArrowRight className="w-5 h-5" />
        </Button>
                <p className="text-xs text-paragraph  text-center ">We may send occasional emails and offers regarding the services on your email address</p>
                <p className="text-sm text-paragraph text-center ">
          Already Have account? {" "} 
          <Link
            to="/login"
            className="underline"
          > Login</Link>
        </p>
      </form>

    </div>
  );
};

export default CreateAccount;
