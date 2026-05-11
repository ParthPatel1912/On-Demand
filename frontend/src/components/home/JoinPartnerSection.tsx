import { useNavigate } from "react-router-dom";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { joinPartnerImage } from "@/assets";
import { APP_ROUTES } from "@/routes/config";
import { HOME_TEXT } from "@/constants/home.text";
import { formatBookings } from "@/utils";

interface JoinPartnerSectionProps {
  partnerCount: number;
}

const JoinPartnerSection = ({ partnerCount }: JoinPartnerSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="pt-6 pb-3">
      <Container>
        <div className="relative lg:h-96.25">
          <img
            src={joinPartnerImage}
            alt=""
            className="pointer-events-none absolute right-0 -top-24 z-10 hidden aspect-506/441 w-60 select-none object-cover sm:block sm:w-[320px] md:w-105 lg:w-126.5"
            loading="lazy"
          />

          <div className="mt-28 h-68 max-h-70 overflow-hidden rounded-3xl bg-primary sm:mt-32 lg:mt-28.25]">
            <div className="flex h-full items-start px-6 pt-8 text-primary-foreground sm:px-10 sm:pt-12 lg:px-15]">
              <div className="flex w-full max-w-145 flex-col gap-10 md:pr-70 lg:pr-0">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[48px] lg:leading-15 lg:tracking-normal">
                    {HOME_TEXT.joinUsTitle}
                  </h2>
                  <p className="font-medium text-primary-foreground/75 sm:text-base lg:text-base lg:leading-6 text-pretty">
                    {HOME_TEXT.joinUsSubtitle}{" "}
                    <span className="whitespace-nowrap">{formatBookings(partnerCount || 0)}</span>{" "}
                    {HOME_TEXT.joinUsSuffix}
                  </p>
                </div>

                <Button
                  className="h-10 w-30 rounded-full bg-cta px-4 text-sm font-bold leading-5 text-cta-foreground hover:bg-cta/90"
                  type="button"
                  onClick={() => navigate(APP_ROUTES.SERVICE_PARTNER_SIGNUP)}
                >
                  {HOME_TEXT.joinNowBtn}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default JoinPartnerSection;
