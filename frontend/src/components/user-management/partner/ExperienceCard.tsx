import { Calendar } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { IExperience } from "@/types/user-management/partner.interface";

const ExperienceCard = ({ experience }: { experience: IExperience }) => {
  return (
    <Card className="border-none bg-surface-subtle rounded-md overflow-hidden">
      <CardContent className="p-4 flex gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="font-medium text-ink text-base leading-tight line-clamp-2">
            {experience.companyName}
          </h4>
          <div className="flex items-start xl:items-center flex-col xl:flex-row font-regular text-sm text-ink-muted gap-x-2 gap-y-1">
            <span className="shrink-0">{experience.role}</span>
            <span className="hidden xl:inline w-1 h-1 rounded-full bg-ink-muted" />
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
              <span className="truncate">
                {experience.from} - {experience.to}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-center flex flex-col items-center">
          <span className="text-md sm:text-lg font-bold text-ink leading-none">
            {Math.max(0, (parseInt(experience.to) || 0) - (parseInt(experience.from) || 0))}
          </span>
          <div className="text-xs sm:text-sm font-regular text-ink-muted leading-none tracking-wider">
            yrs
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceCard;
