import FreeTralBg from "@/assets/free-trail-bg.jpg";
import FreeTrailImage from "@/assets/free-trail-img.jpg";
import { Button } from "../ui/button";

const content = {
  headings: "Start Your Free Trial",
  description:
    "Test-drive our exam simulators, practice exams, and study bundles before you buy.",
  features: [
    "Instant access after signup",
    "Real exam timer, flag, and review features",
    "Detailed explanations and domain-wise analytics",
    "Cancel anytime during trial—no charges",
  ],
  buttonText: "Start a Free Trial",
};

type StartFreeTrialProps = {
  onStartFreeTrial?: () => void;
  isSubmitting?: boolean;
  showStartTrialButton?: boolean;
  trialNotice?: string | null;
};

const StartFreeTrial = ({
  onStartFreeTrial,
  isSubmitting = false,
  showStartTrialButton = true,
  trialNotice = null,
}: StartFreeTrialProps) => {
  return (
    <div
      style={{
        backgroundImage: `url(${FreeTralBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
      className="py-8 p-4 md:p-8 lg:p-10 rounded-[20px] text-white flex flex-wrap gap-5 justify-between items-center"
    >
      <div className="flex flex-col gap-5 items-start">
        <h2 className="self-stretch justify-start text-white text-2xl font-bold">{content.headings}</h2>

        <p className="self-stretch justify-start text-white text-sm font-normal">{content.description}</p>

        <ul className="space-y-2">
          {content.features.map((item, index) => (
            <li key={index} className="flex items-start gap-2 self-stretch justify-start text-white text-sm font-normal leading-6 ">
              <span className="text-[8px]">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {showStartTrialButton ? (
          <Button
            className="max-h-[44px] !bg-white !text-primary_blue"
            onClick={onStartFreeTrial}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting trial..." : content.buttonText}
          </Button>
        ) : (
          <p className="text-sm font-semibold text-white">
            {trialNotice ?? "You already have free trial for this course."}
          </p>
        )}
      </div>

      <img
        src={FreeTrailImage}
        alt="FreeTrial"
        className="max-w-[352px] w-full rounded-[20px]"
      />
    </div>
  );
};

export default StartFreeTrial;
