import React, { ReactNode } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type DisabledTooltipProps = {
  disabled: boolean;
  label: string;
  children: ReactNode;
  className?: string;
};

const DisabledTooltip: React.FC<DisabledTooltipProps> = ({ disabled, label, children, className }) => {
  if (!disabled) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={className ?? "inline-block"} aria-hidden>
          <div className="cursor-not-allowed opacity-50">
            {children}
          </div>
        </div>
      </TooltipTrigger>

      <TooltipContent side="top">
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  );
};
export default DisabledTooltip;
