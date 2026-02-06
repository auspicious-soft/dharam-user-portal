import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/reusableComponents/ImageUploader";
export default function Profile() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  return (
    <div className="flex gap-5 w-full flex-col lg:flex-row">
      <div className="">
        <ImageUploader
          preview={logoPreview}
          onChange={setLogoPreview}
          buttonLabel="Upload / Change Image"
          containerClass="w-full max-w-80 lg:w-[340px] m-auto"
        />
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <div className=" rounded-2xl bg-light-blue p-4 md:p-7 flex flex-col gap-5">
          <h3 className="text-Black_light text-base font-semibold">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="text" id="first_name" placeholder="First Name" />

            <Input type="text" id="last_name" placeholder="Last Name" />

            <Input type="email" id="email" placeholder="Email" />

            <div className="flex gap-2 relative bg-white rounded-[99px] outline-none w-full border border-[#e8e8e8] text-paragraph text-sm font-light">
              <select
                id="country_code"
                className="outline-none pl-3 pr-0 rounded-tl-[99px] rounded-bl-[99px] text-paragraph text-sm font-light"
                defaultValue="+91"
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
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button className="px-12">Save Details</Button>
          </div>
        </div>

        <div className=" rounded-2xl bg-light-blue p-4 md:p-7 flex flex-col gap-5">
          <h3 className="text-Black_light text-base font-semibold">
            Change Password
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              type="password"
              id="old_password"
              placeholder="Old Password"
            />
            <Input
              type="password"
              id="new_password"
              placeholder="New Password"
            />

            <Input
              type="password"
              id="confirm_password"
              placeholder="Confirm Password"
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button className="!px-12">Confirm</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
