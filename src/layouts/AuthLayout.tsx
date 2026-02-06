import Copyright from "@/components/copyright";
import { Outlet } from "react-router-dom";
import LoginBanner from "@/assets/login-banner.jpg";
import AuthLogo from "@/assets/auth-logo.png";

const AuthLayout = () => {
  return (
    <div className="auth-layout p-3 md:p-5  min-h-dvh flex flex-col gap-3 md:gap-5 justify-between">
      <div
        className="flex-grow background-cover bg-center rounded-[12px] md:rounded-[20px] px-4 py-8  md:p-12"
        style={{ backgroundImage: `url(${LoginBanner})` }}
      >
        <div className="flex flex-col gap-[90px]">
          <div className="">
            <img className="max-w-[96px]" src={AuthLogo} alt="Auth logo" />
          </div>
          <div className="p-7 rounded-[12px] md:rounded-[20px] bg-light-blue max-w-[535px] w-full ml-auto">
            <Outlet />
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
};

export default AuthLayout;
