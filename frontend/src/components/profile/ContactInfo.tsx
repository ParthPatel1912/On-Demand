import { useState } from "react";
import { Phone, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChangeMobileModal } from "@/components/profile/ChangeMobileModal";
import { VerifyOTPModal } from "@/components/profile/VerifyOTPModal";
import { ChangeEmailModal } from "./ChangeEmailModal";

interface IProps {
  email?: string;
  mobileNumberWithCode?: string;
  onProfileUpdate?: () => void;
}

export const ContactInfo = ({
  email,
  mobileNumberWithCode,
  onProfileUpdate,
}: IProps) => {
  const [showChangeMobileModal, setShowChangeMobileModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showVerifyOTPModal, setShowVerifyOTPModal] = useState(false);

  return (
    <>
      <div className="w-full border border-line rounded-lg p-6 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white shadow-sm">
        {/* Phone Number Section */}
        <div className="flex flex-1 items-center justify-between w-full lg:pr-12 lg:border-r border-line gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-soft rounded-md text-primary">
              <Phone className="w-5 h-5" />
            </div>
            <span className="font-alexandria font-medium text-base text-ink whitespace-nowrap">
              {mobileNumberWithCode || "Not provided"}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowChangeMobileModal(true)}
            className="text-primary border-line border-2 font-bold px-6 py-2 rounded-full h-10 hover:bg-primary hover:text-white transition-all shadow-none"
          >
            {mobileNumberWithCode ? "Change" : "Add"}
          </Button>
        </div>

        {/* Email Address Section */}
        <div className="flex flex-1 items-center justify-between w-full lg:pl-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-soft rounded-md text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <span className="font-alexandria font-medium text-base text-ink truncate">
              {email || "Not provided"}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowChangeEmailModal(true)}
            className="text-primary border-line border-2 font-bold px-6 py-2 rounded-full h-10 hover:bg-primary hover:text-white transition-all shadow-none"
          >
            {email ? "Change" : "Add"}
          </Button>
        </div>
      </div>

      <ChangeMobileModal
        open={showChangeMobileModal}
        onClose={() => setShowChangeMobileModal(false)}
        currentMobile={mobileNumberWithCode || undefined}
        apiEndpoint="customer/profile/change-mobile"
        successMessage="Mobile number changed successfully"
        onSuccess={() => {
          setShowChangeMobileModal(false);
          if (onProfileUpdate) onProfileUpdate();
        }}
      />

      <ChangeEmailModal
        open={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
        currentEmail={email || undefined}
        apiEndpoint="customer/profile/change-email"
        onSuccess={(emailValue) => {
          setNewEmail(emailValue);
          setShowChangeEmailModal(false);
          setShowVerifyOTPModal(true);
        }}
      />

      <VerifyOTPModal
        open={showVerifyOTPModal}
        onClose={() => setShowVerifyOTPModal(false)}
        receivedText={newEmail}
        apiEndpoint="customer/profile/verify-email-update"
        payloadKey="email"
        successMessage="Email updated successfully"
        onVerify={() => {
          setShowVerifyOTPModal(false);
          if (onProfileUpdate) onProfileUpdate();
        }}
      />
    </>
  );
}
