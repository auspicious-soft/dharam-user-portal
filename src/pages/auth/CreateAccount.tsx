import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { getFcmToken } from "@/lib/fcm";
import { toast } from "sonner";
import {
  COUNTRY_CODE_FALLBACK_OPTIONS,
  fetchCountryCodeOptions,
} from "@/utils/countryCodeOptions";

const MIN_PASSWORD_LENGTH = 5;

const CreateAccount = () => {
 const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [countryCode, setCountryCode] = useState("+91");
  const [countryCodeOptions, setCountryCodeOptions] = useState(
    COUNTRY_CODE_FALLBACK_OPTIONS
  );
  const [isCountryCodesLoading, setIsCountryCodesLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadCountryCodes = async () => {
      setIsCountryCodesLoading(true);
      try {
        const options = await fetchCountryCodeOptions(controller.signal);
        setCountryCodeOptions(options);
        setCountryCode((currentCode) => {
          if (options.some((option) => option.value === currentCode)) {
            return currentCode;
          }
          return options.find((option) => option.value === "+91")?.value ?? options[0].value;
        });
      } catch {
        setCountryCodeOptions(COUNTRY_CODE_FALLBACK_OPTIONS);
      } finally {
        setIsCountryCodesLoading(false);
      }
    };

    void loadCountryCodes();
    return () => controller.abort();
  }, []);


  const validateForm = () => {
    if (!firstName || !email || !password || !confirmPassword) {
      toast.error("Please fill all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (isSubmitting) {
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setConfirmDialogOpen(true);
    }
  };

  const handleCreateAccount = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();

    let fcmToken: string | null = null;
    try {
      fcmToken = await getFcmToken({ requestPermission: false });
    } catch (tokenError) {
      console.warn("FCM token not available", tokenError);
    }

    try {
      const response = await api.post("/create-user", {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        fullName,
        email: email.trim(),
        countryCode,
        phoneNumber: phone.trim(),
        password,
        fcmToken: fcmToken ?? "",
        deviceType: "WEB",
      });

      const verificationToken =
        (response.data as { data?: { verificationToken?: string | null } })
          ?.data?.verificationToken ?? null;
      if (verificationToken) {
        localStorage.setItem("verificationToken", verificationToken);
      }

      const successMessage =
        (response.data as { message?: string | null })?.message ??
        "Registration successful";
      toast.success(successMessage);
      setConfirmDialogOpen(false);

      navigate("/enter-otp", {
        state: {
          mode: "signup",
          email,
        },
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };



  return (
    <div>
      <div className="mb-4 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold capitalize leading-[46px] text-center text-[#1f1f1f]">
        Create Account
        </h2>
        <p className="text-paragraph text-base font-normal max-w-80 w-full m-auto">
          By continuing, you agree to our{" "}
          <a href="https://dharma-web.vercel.app/terms-of-service" target="_blank" className="text-primary_heading ">
            Terms
          </a>{" "}
          &{" "}
          <a href="https://dharma-web.vercel.app/privacy-policy" target="_blank" className="text-primary_heading">
            Privacy Policy.
          </a>
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
            onChange={(e) => setFirstName(e.target.value)}
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
            onChange={(e) => setLastName(e.target.value)}
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
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex gap-2 relative bg-white rounded-[99px] outline-none w-full border border-[#e8e8e8] text-paragraph text-sm font-light">
          <select
            id="country_code"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            disabled={isCountryCodesLoading}
            className="outline-none pl-3 pr-0 rounded-tl-[99px] rounded-bl-[99px] text-paragraph text-sm font-light"
          >
            {countryCodeOptions.map((option) => (
              <option key={`${option.isoCode}-${option.value}`} value={option.value}>
                {option.value}
              </option>
            ))}
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
            onChange={(e) => setPassword(e.target.value)}
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
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Account"}{" "}
          <ArrowRight className="w-5 h-5" />
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

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-7">
          <DialogHeader className="items-center space-y-4 mb-4">
            <DialogTitle className="text-center text-2xl text-Black_light md:text-3xl font-bold">
              Create Account?
            </DialogTitle>
            <DialogDescription className="text-paragraph text-base font-medium text-center">
              Are you sure you want to create this account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              className="flex-1 max-h-[44px]"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setConfirmDialogOpen(false)}
            >
              No
            </Button>
            <Button
              type="button"
              className="flex-1 max-h-[44px]"
              disabled={isSubmitting}
              onClick={() => void handleCreateAccount()}
            >
              {isSubmitting ? "Creating..." : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateAccount;
