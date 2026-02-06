import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Input } from "../../components/ui/input";
import { Lock, Eye, EyeClosed, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/SuccessDialog";
import SuccessIcon from "@/assets/reset.svg"; 

const CreateNewPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Success
    setError("");
    setIsDialogOpen(true);
  };

const handleConfirm = () => {
  setIsDialogOpen(false);
  navigate("/login", { replace: true });
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
        {/* Password */}
        <div className="relative">
          <Lock  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9} />
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
            {showPassword ? <EyeClosed className="w-4 h-4" strokeWidth={0.9} /> : <Eye className="w-4 h-4" strokeWidth={0.9} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-input-888"
            strokeWidth={0.9} />
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
            {confirmShowPassword ? <EyeClosed className="w-4 h-4" strokeWidth={0.9} /> : <Eye className="w-4 h-4" strokeWidth={0.9} />}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <Button type="submit">
          Confirm <ArrowRight className="w-5 h-5" />
        </Button>
      </form>

      {/* Success Popup */}
      <SuccessDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Password Updated"
        description="Your password has been updated successfully!"
        buttonText="Login"
        image={SuccessIcon}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default CreateNewPassword;
