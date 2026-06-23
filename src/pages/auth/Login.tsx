import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../auth/Authenticated";
import { Input } from "../../components/ui/input";
import { Lock, Eye, EyeClosed, MailOpen, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/utils/svgicons";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";
import api from "@/lib/axios";
import { getFcmToken } from "@/lib/fcm";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const getRequiredFcmToken = async () => {
    const token = await getFcmToken({ requestPermission: true });

    if (!token) {
      throw new Error(
        "Please allow notifications so we can register this device for alerts.",
      );
    }

    return token;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    if (isSubmitting || isGoogleSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    let fcmToken: string | null = null;
    try {
      console.log("📱 Attempting to get FCM token for login...");
      fcmToken = await getFcmToken({ requestPermission: true });
      if (fcmToken) {
        console.log("✅ FCM token obtained successfully");
      } else {
        console.warn(
          "⚠️ FCM token is null - notification permission may have been denied",
        );
      }
    } catch (tokenError) {
      console.error("❌ Error getting FCM token:", tokenError);
    }

    try {
      console.log(
        "📡 Sending login request with fcmToken:",
        fcmToken ? "present" : "empty",
      );
      const response = await api.post("/user-login", {
        email: email.trim(),
        password,
        fcmToken: fcmToken ?? "",
        deviceType: "WEB",
      });

      const responseData = response.data as {
        data?: {
          accessToken?: string | null;
          refreshToken?: string | null;
          user?: unknown;
        };
      };

      const accessToken = responseData?.data?.accessToken ?? null;
      const refreshToken = responseData?.data?.refreshToken ?? null;
      const user = responseData?.data?.user ?? null;

      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("userUpdated"));
      }

      const successMessage =
        (response.data as { message?: string | null })?.message ??
        "Login successful";
      toast.success(successMessage);

      login();
      navigate("/dashboard", { replace: true });
    } catch (requestError: unknown) {
      const message =
        (requestError as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting || isGoogleSubmitting) {
      return;
    }

    setError("");
    setIsGoogleSubmitting(true);

    try {
      const requiredFcmToken = await getRequiredFcmToken();
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleIdToken = credential?.idToken ?? null;

      if (!googleIdToken) {
        throw new Error("Missing Google ID token from popup result.");
      }

      console.log(
        "📡 Sending social-login request with fcmToken:",
        requiredFcmToken ? "present" : "empty",
      );
      const response = await api.post("/social-login", {
        authType: "GOOGLE",
        idToken: googleIdToken,
        fcmToken: requiredFcmToken,
        deviceType: "WEB",
      });

      const responseData = response.data as {
        data?: {
          accessToken?: string | null;
          refreshToken?: string | null;
          user?: unknown;
        };
        message?: string | null;
      };

      const accessToken = responseData?.data?.accessToken ?? null;
      const refreshToken = responseData?.data?.refreshToken ?? null;
      const user = responseData?.data?.user ?? null;

      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("userUpdated"));
      }

      toast.success(responseData?.message ?? "Login successful");
      login();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Google login failed", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
        (error instanceof Error
          ? error.message
          : "Google login failed. Please try again.");
      setError(message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold capitalize leading-[46px] text-center text-[#1f1f1f]">
          Welcome Back
        </h2>
        <p className="text-paragraph text-base font-normal ">
          Login to Your account
        </p>
      </div>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="mt-[-6px] text-right ">
          <Link
            to="/forgot-password"
            className=" text-paragraph text-sm font-normal leading-[22px] ml-auto"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" disabled={isSubmitting || isGoogleSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}{" "}
          <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-sm text-paragraph text-center ">
          Don’t have an account?{" "}
          <Link to="/create-account" className="underline">
            {" "}
            Create One.
          </Link>
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
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting || isGoogleSubmitting}
        >
          <GoogleIcon />
          <div className=" text-sm ">
            {isGoogleSubmitting ? "Continuing..." : "Continue with Google"}
          </div>
        </Button>
      </form>
    </div>
  );
};

export default Login;
