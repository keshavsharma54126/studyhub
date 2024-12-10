"use client";
import { cn } from "../utils/cn.js";
import React from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 opacity-50 mix-blend-soft-light",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-blue-50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent" />
    </div>
  );
};
