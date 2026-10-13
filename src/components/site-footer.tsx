import { ArrowUpRight, Mail } from "lucide-react";

import { BrandIcon } from "@/components/ui/brand-icon";
import { profile } from "@/lib/profile";

const linkClass =
  "inline-flex items-center gap-2 border-b border-foreground/40 pb-1 text-[15px] font-medium text-foreground transition-colors hover:border-accent hover:text-accent";

/** 연락처 한 줄. */
export default function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20">
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-t border-ink/15 py-12">
          <div>
            <p className="section-label">
              Let&apos;s Connect
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.025em] text-foreground sm:text-[1.75rem]">
              검증까지 함께 책임질 동료가 필요하다면.
            </h2>
          </div>
          <p className="flex flex-wrap gap-x-8 gap-y-3">
            <a href={`mailto:${profile.email}`} className={linkClass}>
              <Mail aria-hidden="true" size={17} strokeWidth={1.8} />
              {profile.email}
              <ArrowUpRight aria-hidden="true" size={14} />
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className={linkClass}>
              <BrandIcon name="github" size={17} />
              GitHub
              <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
