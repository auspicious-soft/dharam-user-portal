import { AddressIcon, CallIcon, EmailIcon } from "@/utils/svgicons";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import UserReportIcon from "@/assets/user-report-icon.png";

const ContactUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="self-stretch p-4 md:p-[30px] bg-[#f0f8ff] rounded-[20px] inline-flex flex-col justify-start gap-5 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[.7fr_1fr] w-full gap-5">
        <div className="inline-flex flex-col justify-start items-start gap-[30px]">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <h2 className="self-stretch justify-start text-xl md:text-3xl  font-bold">
              We’d Love to Hear
              <br />
              from You
            </h2>
            <p className="text-Black_light font-medium text-sm md:text-base leading-6">
              vCare Project Management LLC
            </p>
          </div>
          <div className="self-stretch inline-flex flex-col justify-start items-start gap-4">
            <div className="self-stretch inline-flex justify-start items-start gap-4">
              <div className="w-9 h-9 relative bg-[#4c8dea] rounded-[99px] flex items-center justify-center mt-1">
                <AddressIcon />
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-1">
                <p className="justify-start text-[#666666] text-sm leading-6 max-w-60 w-full">
                  325 N. Saint Paul St. Suite 3100 Dallas TX 75201
                </p>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4">
              <div className="w-9 h-9 relative bg-[#4c8dea] rounded-[99px] flex items-center justify-center mt-1">
                <EmailIcon />
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-1">
                <a
                  href="mailto:info@vcareprojectmanagement.com"
                  className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                >
                  info@vcareprojectmanagement.com
                </a>
                <a
                  href="mailto:team@vcareprojectmanagement.com"
                  className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                >
                  team@vcareprojectmanagement.com
                </a>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4">
              <div className="w-9 h-9 relative bg-[#4c8dea] rounded-[99px] flex items-center justify-center mt-1">
                <CallIcon />
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-1">
                <a
                  href="tel:+19727280388"
                  className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                >
                  +1 972-728-0388
                </a>
                <a
                  href="tel:+16502830123"
                  className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                >
                  +1 650-283-0123
                </a>
              </div>
            </div>
            <Button
              className="max-h-[44px] !text-sm mt-3"
              onClick={() => setIsOpen(true)}
            >
              Report A Problem
            </Button>
          </div>
        </div>
        <div className="space-y-8">
          <h3 className="justify-start text-[#4c8dea] text-xl font-bold">
            Enquiry Form
          </h3>
          <div className="flex flex-col items-end lg:items-center gap-3 w-full">
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Subject</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active"> Select a subject 1</SelectItem>
                  <SelectItem value="inactive">Select a subject 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Full Name</Label>
              <Input type="text" placeholder="Full Name" />
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Email Address</Label>
              <Input type="email" placeholder="Email Address" />
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Phone Number</Label>
              <Input type="tel" placeholder="Phone Number" />
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Your Message</Label>
              <Textarea className="h-28" />
            </div>
            <div className="space-y-1 w-full">
              <Button className="w-full">Submit</Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl gap-7">
          <DialogHeader>
            <img
              src={UserReportIcon}
              alt="Report Icon"
              className="max-w-[80px] md:max-w-[100px] m-auto mb-4"
            />
            <DialogTitle className="text-center text-2xl lg:text-3xl  text-Black_light md:text-3xl font-bold capitalize leading-[45px] md:leading-[65px]">
              Report a Problem
            </DialogTitle>
            <DialogDescription className=" self-stretch text-center justify-start text-[#444444] text-base font-medium leading-[30px]">
              You’ll be reverted on the mail by the admin.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-end lg:items-center gap-3 w-full">
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Select Module</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active"> Select a subject 1</SelectItem>
                  <SelectItem value="inactive">Select a subject 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Add Comments</Label>
              <Textarea className="h-28" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-w-40 max-h-[44px]">
                Close
              </Button>
            </DialogClose>
            <Button className="flex-1 max-h-[44px]">Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactUs;
