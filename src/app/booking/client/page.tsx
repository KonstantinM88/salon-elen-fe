// src/app/booking/client/page.tsx
import { Metadata } from "next";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { translate, type MessageKey } from "@/i18n/messages";
import ClientPageWithGoogleOption from "./ClientPageWithGoogleOption";

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }
  return DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = (key: MessageKey) => translate(locale, key);

  return {
    title: t("booking_client_page_title"),
    description: t("booking_client_page_description"),
  };
}

export default async function ClientPage({
  searchParams,
}: {
  searchParams: Promise<{
    s?: string;
    m?: string;
    start?: string;
    end?: string;
    d?: string;
  }>;
}) {
  const params = await searchParams;
  const serviceId = params.s;
  const masterId = params.m;
  const startAt = params.start;
  const endAt = params.end;
  const selectedDate = params.d;
  const locale = await resolveLocale();
  const t = (key: MessageKey) => translate(locale, key);

  if (!serviceId || !masterId || !startAt || !endAt || !selectedDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1E] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            {t("booking_client_params_error_title")}
          </h1>
          <p className="text-gray-400 mb-8">
            {t("booking_client_params_error_text")}
          </p>
          <a
            href="/booking"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold hover:shadow-lg transition-all"
          >
            {t("booking_client_params_error_return")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <ClientPageWithGoogleOption
      serviceId={serviceId}
      masterId={masterId}
      startAt={startAt}
      endAt={endAt}
      selectedDate={selectedDate}
    />
  );
}