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
      <div id="tailscale" className="group relative rounded-full flex align-middle self-center">
        <button
          type="button"
          onClick={() => setUseTailscale(!useTailscale)}
          aria-pressed={useTailscale}
          aria-describedby="tailscale-toggle-help"
          className="flex outline-hidden"
        >
          <MdVpnLock className="text-theme-800 dark:text-theme-200 w-5 h-5 m-1.5" />
          <span className="self-center mr-1.5 text-sm font-medium text-theme-800 dark:text-theme-200 cursor-pointer">
            {t("tailscaleLinks.toggle")}
          </span>
          {useTailscale ? (
            <MdToggleOn className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer" />
          ) : (
            <MdToggleOff className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer" />
          )}
        </button>
        <div
          id="tailscale-toggle-help"
          role="tooltip"
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute right-0 top-full mt-1 z-20 w-64 rounded-md p-2 text-xs shadow-lg bg-theme-100 dark:bg-theme-800 text-theme-800 dark:text-theme-200"
        >
          <div className="font-semibold">
            {t(useTailscale ? "tailscaleLinks.helpTitleOn" : "tailscaleLinks.helpTitleOff")}
          </div>
          <div>{t(useTailscale ? "tailscaleLinks.helpOn" : "tailscaleLinks.helpOff")}</div>
        </div>
      </div>
    </div>
  );
}
