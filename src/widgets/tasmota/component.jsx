import classNames from "classnames";
import { useTranslation } from "next-i18next/pages";
import { useState } from "react";

import Container from "components/services/widget/container";
import { getURLSearchParams } from "utils/proxy/api-helpers";
import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_REFRESH_INTERVAL = 10000;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const [toggling, setToggling] = useState(false);

  const {
    data: statusData,
    error: statusError,
    mutate,
  } = useWidgetAPI(widget, "status", {
    refreshInterval: Math.max(1000, widget.refreshInterval ?? DEFAULT_REFRESH_INTERVAL),
  });

  async function handleToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    setToggling(true);
    try {
      const params = getURLSearchParams(widget, "toggle");
      const res = await fetch(`/api/services/proxy?${params.toString()}`, { method: "POST" });
      // Tasmota answers a toggle with the new power state and the proxy answers a
      // rejected one with { error }; either beats rendering the pre-toggle state
      // until the next poll, so only refetch when the body is unusable.
      const next = await res.json().catch(() => undefined);
      await mutate(next, { revalidate: next === undefined });
    } catch {
      await mutate();
    } finally {
      setToggling(false);
    }
  }

  if (statusError) {
    return <Container service={service} error={statusError} />;
  }

  const loading = !statusData;
  const isOn = statusData?.POWER === "ON";

  return (
    <Container service={service}>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-row items-center justify-between p-2 service-block">
        <span className="font-bold text-xs uppercase">{t("tasmota.power")}</span>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={t("tasmota.power")}
          disabled={loading || toggling}
          onClick={handleToggle}
          className={classNames(
            "relative inline-flex items-center h-5 w-9 shrink-0 rounded-full transition-colors duration-200 cursor-pointer",
            loading && "animate-pulse",
            isOn ? "bg-green-500" : "bg-theme-700 dark:bg-theme-800",
          )}
        >
          <span className="sr-only">{isOn ? t("tasmota.on") : t("tasmota.off")}</span>
          <span
            className={classNames(
              "ml-[3px] h-3.5 w-3.5 rounded-full bg-theme-100 transition-transform duration-200",
              isOn ? "translate-x-4" : "translate-x-0",
            )}
          />
        </button>
      </div>
    </Container>
  );
}
