import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  pulse?: boolean;
}

export function Skeleton({
  className,
  pulse = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/50",
        pulse && "motion-safe:animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
