"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { RefreshCcw, ShieldAlert } from "lucide-react";

import type { SeoLocale } from "@/lib/seo-locale";

type AdminDeploymentWatcherProps = {
  initialDeploymentVersion: string;
  locale: SeoLocale;
};

type DeploymentWatcherCopy = {
  title: string;
  description: string;
  checked: string;
  reload: string;
  blocked: string;
};

const COPY: Record<SeoLocale, DeploymentWatcherCopy> = {
  de: {
    title: "Neue Version verfuegbar",
    description:
      "Diese Admin-Registerkarte verwendet noch eine alte Version. Bitte laden Sie die Seite neu, bevor Sie speichern.",
    checked: "Deployment erkannt",
    reload: "Neu laden",
    blocked: "Speichern wurde blockiert, bis die Seite neu geladen wird.",
  },
  ru: {
    title: "Доступна новая версия",
    description:
      "Эта вкладка админки открыта на старой версии. Обновите страницу перед сохранением, чтобы не поймать ошибку server action.",
    checked: "Обнаружен новый деплой",
    reload: "Обновить страницу",
    blocked: "Отправка формы заблокирована, пока страница не будет обновлена.",
  },
  en: {
    title: "New version available",
    description:
      "This admin tab is using an older deployment. Reload the page before saving to avoid server action mismatches.",
    checked: "New deployment detected",
    reload: "Reload page",
    blocked: "Form submission was blocked until the page is reloaded.",
  },
};

function shortVersion(value: string) {
  return value.length > 10 ? value.slice(0, 7) : value;
}

export default function AdminDeploymentWatcher({
  initialDeploymentVersion,
  locale,
}: AdminDeploymentWatcherProps) {
  const [isStale, setIsStale] = useState(false);
  const [latestDeploymentVersion, setLatestDeploymentVersion] = useState(
    initialDeploymentVersion,
  );
  const [blockMessageVisible, setBlockMessageVisible] = useState(false);
  const currentDeploymentVersionRef = useRef(initialDeploymentVersion);
  const inFlightRef = useRef(false);
  const staleRef = useRef(false);
  const t = COPY[locale];

  useEffect(() => {
    currentDeploymentVersionRef.current = initialDeploymentVersion;
  }, [initialDeploymentVersion]);

  useEffect(() => {
    staleRef.current = isStale;
  }, [isStale]);

  const checkDeploymentVersion = useEffectEvent(async () => {
    if (!currentDeploymentVersionRef.current || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;

    try {
      const response = await fetch(`/api/deployment-version?ts=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { deploymentVersion?: string };
      const nextDeploymentVersion = payload.deploymentVersion?.trim() ?? "";

      if (
        nextDeploymentVersion &&
        nextDeploymentVersion !== currentDeploymentVersionRef.current
      ) {
        setLatestDeploymentVersion(nextDeploymentVersion);
        setIsStale(true);
      }
    } catch {
      // Ignore transient probe failures; the next visibility/focus poll will retry.
    } finally {
      inFlightRef.current = false;
    }
  });

  const blockStaleSubmit = useEffectEvent((event: Event) => {
    if (!staleRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setBlockMessageVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  useEffect(() => {
    if (!initialDeploymentVersion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void checkDeploymentVersion();
    }, 60_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkDeploymentVersion();
      }
    };

    const handleWindowFocus = () => {
      void checkDeploymentVersion();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("submit", blockStaleSubmit, true);

    void checkDeploymentVersion();

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("submit", blockStaleSubmit, true);
    };
  }, [blockStaleSubmit, checkDeploymentVersion, initialDeploymentVersion]);

  if (!initialDeploymentVersion || (!isStale && !blockMessageVisible)) {
    return null;
  }

  return (
    <div className="mb-4 sm:mb-5">
      <div className="overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/12 via-orange-500/10 to-rose-500/12 shadow-[0_20px_60px_-25px_rgba(251,191,36,0.45)]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" />
              <span>{t.title}</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-50/90">
              {t.description}
            </p>
            <div className="mt-2 text-xs text-amber-200/80">
              {t.checked}: {shortVersion(initialDeploymentVersion)} -&gt;{" "}
              {shortVersion(latestDeploymentVersion)}
            </div>
            {blockMessageVisible ? (
              <div className="mt-2 text-xs font-medium text-rose-200">{t.blocked}</div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/12 px-4 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-amber-300/20"
          >
            <RefreshCcw className="h-4 w-4" />
            {t.reload}
          </button>
        </div>
      </div>
    </div>
  );
}
