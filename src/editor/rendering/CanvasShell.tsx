import { ReactNode } from "react";

type CanvasShellProps = {
  children: ReactNode;
};

export function CanvasShell({ children }: CanvasShellProps) {
  return (
    <div className="rounded-[32px] bg-[#F2F4F7] p-6">
      <div className="mx-auto max-w-[820px]">
        <div className="rounded-[24px] bg-white px-10 py-12 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
          {children}
        </div>
      </div>
    </div>
  );
}
