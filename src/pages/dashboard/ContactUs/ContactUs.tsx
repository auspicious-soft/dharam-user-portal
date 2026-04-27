import { AddressIcon, CallIcon, EmailIcon } from "@/utils/svgicons";
import React, { useEffect, useState } from "react";
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
import api from "@/lib/axios";

type SupportInfo = {
  title?: string | null;
  description?: string | null;
  address?: string | null;
  primaryEmail?: string | null;
  secondaryEmail?: string | null;
  primaryContact?: string | null;
  secondaryContact?: string | null;
};

const ContactUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [supportInfo, setSupportInfo] = useState<SupportInfo | null>(null);
  const [supportLoading, setSupportLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportModules, setReportModules] = useState<string[]>([]);
  const [reportModuleLoading, setReportModuleLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [reportComments, setReportComments] = useState("");
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSupportInfo = async () => {
      try {
        setSupportLoading(true);
        const response = await api.get("/platform-info", {
          params: {
            type: "SUPPORT",
          },
        });
        const data = (response.data as { data?: SupportInfo })?.data ?? null;
        if (isMounted) {
          setSupportInfo(data);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load support info", error);
      } finally {
        if (isMounted) {
          setSupportLoading(false);
        }
      }
    };

    fetchSupportInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchReportModules = async () => {
      try {
        setReportModuleLoading(true);
        const response = await api.get("/user/report-problem");
        const data = (response.data as { data?: string[] })?.data ?? [];
        if (isMounted) {
          setReportModules(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load report problem modules", error);
      } finally {
        if (isMounted) {
          setReportModuleLoading(false);
        }
      }
    };

    fetchReportModules();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitEnquiry = async () => {
    try {
      setIsSubmitting(true);
      await api.post("/user/enquiry", {
        fullName,
        email,
        phoneNumber,
        subject,
        message,
      });
      setSubject("");
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setMessage("");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to submit enquiry", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReportProblem = async () => {
    try {
      setIsReportSubmitting(true);
      const courseId = localStorage.getItem("selectedCourseId");
      await api.post("/user/report-problem", {
        type: selectedModule,
        comments: reportComments,
        courseId,
      });
      setSelectedModule("");
      setReportComments("");
      setIsOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to submit report problem", error);
    } finally {
      setIsReportSubmitting(false);
    }
  };
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
              {supportLoading ? "Loading..." : supportInfo?.title ?? "-"}
            </p>
            <p className="text-paragraph text-sm md:text-base leading-6">
              {supportLoading ? "" : supportInfo?.description ?? ""}
            </p>
          </div>
          <div className="self-stretch inline-flex flex-col justify-start items-start gap-4">
            <div className="self-stretch inline-flex justify-start items-start gap-4">
              <div className="w-9 h-9 relative bg-[#4c8dea] rounded-[99px] flex items-center justify-center mt-1">
                <AddressIcon />
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-1">
                <p className="justify-start text-[#666666] text-sm leading-6 max-w-60 w-full">
                  {supportLoading ? "Loading..." : supportInfo?.address ?? "-"}
                </p>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4">
              <div className="w-9 h-9 relative bg-[#4c8dea] rounded-[99px] flex items-center justify-center mt-1">
                <EmailIcon />
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-1">
                {supportLoading ? (
                  <span className="justify-start text-[#666666] text-sm leading-6">
                    Loading...
                  </span>
                ) : (
                  <>
                    {supportInfo?.primaryEmail ? (
                      <a
                        href={`mailto:${supportInfo.primaryEmail}`}
                        className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                      >
                        {supportInfo.primaryEmail}
                      </a>
                    ) : null}
                    {supportInfo?.secondaryEmail ? (
                      <a
                        href={`mailto:${supportInfo.secondaryEmail}`}
                        className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                      >
                        {supportInfo.secondaryEmail}
                      </a>
                    ) : null}
                    {!supportInfo?.primaryEmail && !supportInfo?.secondaryEmail ? (
                      <span className="justify-start text-[#666666] text-sm leading-6">
                        -
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-start gap-4">
              <div className="w-9 h-9 relative bg-[#4c8dea] rounded-[99px] flex items-center justify-center mt-1">
                <CallIcon />
              </div>
              <div className="inline-flex flex-col justify-start items-start gap-1">
                {supportLoading ? (
                  <span className="justify-start text-[#666666] text-sm leading-6">
                    Loading...
                  </span>
                ) : (
                  <>
                    {supportInfo?.primaryContact ? (
                      <a
                        href={`tel:${supportInfo.primaryContact.trim()}`}
                        className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                      >
                        {supportInfo.primaryContact.trim()}
                      </a>
                    ) : null}
                    {supportInfo?.secondaryContact ? (
                      <a
                        href={`tel:${supportInfo.secondaryContact.trim()}`}
                        className="justify-start text-[#666666] text-sm leading-6 hover:underline"
                      >
                        {supportInfo.secondaryContact.trim()}
                      </a>
                    ) : null}
                    {!supportInfo?.primaryContact &&
                    !supportInfo?.secondaryContact ? (
                      <span className="justify-start text-[#666666] text-sm leading-6">
                        -
                      </span>
                    ) : null}
                  </>
                )}
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
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website Issue">Website Issue</SelectItem>
                  <SelectItem value="Account Help">Account Help</SelectItem>
                  <SelectItem value="Payment Query">Payment Query</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Full Name</Label>
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Email Address</Label>
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Phone Number</Label>
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Your Message</Label>
              <Textarea
                className="h-28"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <div className="space-y-1 w-full">
              <Button
                className="w-full"
                onClick={handleSubmitEnquiry}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
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
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {reportModuleLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : reportModules.length ? (
                    reportModules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No modules available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full">
              <Label className="text-paragraph">Add Comments</Label>
              <Textarea
                className="h-28"
                value={reportComments}
                onChange={(event) => setReportComments(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-w-40 max-h-[44px]">
                Close
              </Button>
            </DialogClose>
            <Button
              className="flex-1 max-h-[44px]"
              onClick={handleSubmitReportProblem}
              disabled={isReportSubmitting || !selectedModule}
            >
              {isReportSubmitting ? "Reporting..." : "Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactUs;
