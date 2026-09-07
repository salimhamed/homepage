import { useTranslation } from "next-i18next/pages";
import { useContext } from "react";
import { MdToggleOff, MdToggleOn, MdVpnLock } from "react-icons/md";

import { TailscaleContext } from "utils/contexts/tailscale";

export default function TailscaleToggle({ hasTailscaleLinks }) {
  const { t } = useTranslation();
  const { useTailscale, setUseTailscale } = useContext(TailscaleContext);

  // Stay mounted while the mode is on even if nothing defines a tailscaleHref any
  // more, otherwise the only way to turn it back off is clearing localStorage.
  if (!hasTailscaleLinks && !useTailscale) {
    return null;
  }

  return (
    <div id="tailscale-toggle-wrap" className="m-auto flex flex-wrap grow sm:basis-auto justify-end gap-x-2">
      <div id="tailscale" className="rounded-full flex align-middle self-center">
        <button type="button" onClick={() => setUseTailscale(!useTailscale)} className="flex outline-hidden">
          <MdVpnLock className="text-theme-800 dark:text-theme-200 w-5 h-5 m-1.5" />
          {useTailscale ? (
            <MdToggleOn className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer" />
          ) : (
            <MdToggleOff className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer" />
          )}
          <span className="sr-only">{t("tailscaleLinks.toggle")}</span>
        </button>
      </div>
    </div>
  );
}
