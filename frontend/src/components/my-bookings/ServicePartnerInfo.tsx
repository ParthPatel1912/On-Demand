import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingPartner } from "@/types/myBookings.interface";

interface ServicePartnerInfoProps {
  servicePartner: BookingPartner | null;
}

const ServicePartnerInfo = ({ servicePartner }: ServicePartnerInfoProps) => {
  const handleCall = () => {
    if (!servicePartner?.mobileNumber) return;
    window.location.href = `tel:${servicePartner.mobileNumber}`;
  };

  return (
    <div className="flex flex-col gap-2.5 w-full pt-1.25">
      <p className="w-full text-xs font-semibold text-ink-muted leading-4 tracking-[0.004em]">
        Assigned Service Partner
      </p>

      {servicePartner ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {servicePartner.profileImage ? (
              <img
                src={servicePartner.profileImage}
                alt={servicePartner.name}
                className="w-8 h-8 rounded-[6px] object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-[6px] bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {servicePartner.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="leading-4 flex flex-col items-start gap-0.5">
              <p className="text-xs font-semibold text-gray-800">
                {servicePartner.name}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {servicePartner.serviceType?.name}
              </p>
            </div>
          </div>

          {/* Call Button */}
          <Button
            onClick={handleCall}
            aria-label={`Call ${servicePartner.name}`}
            disabled={!servicePartner.mobileNumber}
            className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-white border text-primary hover:bg-primary/10"
          >
            <Phone size={14} strokeWidth={2} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            ?
          </div>
          <p className="text-xs text-gray-400 italic">Not yet assigned</p>
        </div>
      )}
    </div>
  );
};

export default ServicePartnerInfo;
