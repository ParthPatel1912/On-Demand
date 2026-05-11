import { Link } from "react-router-dom";

import { bronzeMedal, goldMedal, silverMedal } from "@/assets";
import { APP_ROUTES } from "@/routes/config";
import { displayRole, getInitialsName } from "@/utils";
import type { IDashboardPartner } from "@/types/dashboard.interface";
import { CARD_CLASSNAME } from "./constants";
import DashboardEmptyState from "./DashboardEmptyState";
import { DASHBOARD_TEXT } from "@/constants/dashboard.text";

const medals = [goldMedal, silverMedal, bronzeMedal];

const TopPartnersCard = ({ data }: { data?: IDashboardPartner[] }) => {
  const partnersList = data && data.length > 0 ? data : [];

  return (
    <article className={`${CARD_CLASSNAME} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold leading-6 text-ink">
          {DASHBOARD_TEXT.topServicePartners}
        </h2>
        {partnersList.length > 0 && (
          <Link to={APP_ROUTES.ADMIN_SERVICE_PARTNER_MANAGEMENT}>
            <button className="rounded-md border border-status-inactive-soft bg-white px-3 py-1 text-sm font-bold text-primary cursor-pointer">
              {DASHBOARD_TEXT.viewAll}
            </button>
          </Link>
        )}
      </div>

      <div className="space-y-0">
        {partnersList.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          partnersList.map((partner, index) => {
            const isTop3 = index < 3;

            return (
              <div
                key={partner.name}
                className="flex items-center justify-between border-b border-line-soft px-2 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  {isTop3 ? (
                    <img src={medals[index]} alt="medal" className="h-6 w-6" />
                  ) : (
                    <div className="w-5 text-sm font-bold text-ink-rank">
                      {index + 1}.
                    </div>
                  )}

                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[8px] bg-surface-card">
                    {partner.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-ink-muted">
                        {getInitialsName(partner.name)}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink">
                      {partner.name}
                    </p>
                    <p className="text-xs font-medium text-ink-muted">
                      {displayRole(partner.role)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-base font-bold text-ink">
                      {partner.completed}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-ink-muted">
                    {DASHBOARD_TEXT.completed}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
};

export default TopPartnersCard;
