import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Droplets,
  Footprints,
  Gem,
  HeartHandshake,
  House,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  SeoReveal,
  SeoScrollProgress,
  SeoStagger,
  SeoStaggerItem,
} from "@/components/seo/SeoScrollEffects";
import {
  FOOT_CARE_IMAGE_BASE_PATH,
  type FootCareGroupKey,
  type FootCareLandingCopy,
} from "@/lib/foot-care-landing";
import type { SeoLocale } from "@/lib/seo-locale";

export type FootCareServiceCard = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  durationMin: number;
  cover: string;
  group: FootCareGroupKey;
  isFromPrice: boolean;
};

type Props = {
  locale: SeoLocale;
  copy: FootCareLandingCopy;
  services: FootCareServiceCard[];
};

const GROUP_ICONS: Record<FootCareGroupKey, LucideIcon> = {
  pedicure: Sparkles,
  care: Droplets,
  specialist: ShieldCheck,
  mobile: House,
};

const HERO_IMAGES = [
  `${FOOT_CARE_IMAGE_BASE_PATH}/apparative-pedikuere.webp`,
  `${FOOT_CARE_IMAGE_BASE_PATH}/pedikuere-mit-uv-gellack.webp`,
  `${FOOT_CARE_IMAGE_BASE_PATH}/mobile-klassische-fusspflege.webp`,
] as const;

function localeHref(path: string, locale: SeoLocale): string {
  if (locale === "de") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

function formatPrice(cents: number | null, locale: SeoLocale): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat(
    locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(cents / 100);
}

function SectionHeading({
  eyebrow,
  title,
  text,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  inverse?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] ${
          inverse ? "text-[#f1cbd0]" : "text-[#a15d68]"
        }`}
      >
        <span className={`h-px w-9 ${inverse ? "bg-[#f1cbd0]/60" : "bg-[#a15d68]/55"}`} />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-playfair text-3xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-4xl lg:text-5xl ${
          inverse ? "text-white" : "text-[#3a272e] dark:text-white"
        }`}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-8 ${
            inverse ? "text-white/70" : "text-[#765f66] dark:text-white/64"
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function ServiceCard({
  service,
  copy,
  locale,
}: {
  service: FootCareServiceCard;
  copy: FootCareLandingCopy;
  locale: SeoLocale;
}) {
  return (
    <article id={`service-${service.slug}`} className="group flex h-full min-w-0 scroll-mt-24 flex-col overflow-hidden rounded-[1.6rem] border border-[#d9b6bc]/45 bg-white/92 shadow-[0_20px_70px_rgba(87,52,62,0.07)] transition duration-500 hover:-translate-y-1.5 hover:border-[#c98691]/60 hover:shadow-[0_28px_90px_rgba(87,52,62,0.14)] dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-[#df9ba7]/30">
      <Link
        href={localeHref(`/services?service=${encodeURIComponent(service.slug)}`, locale)}
        className="relative block aspect-[16/11] overflow-hidden bg-[#ead7da]"
        aria-label={`${copy.details}: ${service.name}`}
      >
        <Image
          src={service.cover}
          alt={`${service.name} bei Salon Elen in Halle (Saale)`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.055]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b22]/76 via-transparent to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#24161c]/55 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            <Clock3 className="h-3.5 w-3.5" />
            {service.durationMin} min
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#5b3540] backdrop-blur-md">
            {service.isFromPrice ? `${copy.from} ` : ""}
            {formatPrice(service.priceCents, locale)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="break-words font-playfair text-xl font-semibold leading-tight text-[#3f2a31] dark:text-white sm:text-2xl">
          {service.name}
        </h3>
        {service.description ? (
          <p className="mt-3 break-words text-sm leading-6 text-[#78656b] dark:text-white/60">
            {service.description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <Link
            href={localeHref(`/booking/services?preselect=${encodeURIComponent(service.id)}`, locale)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#8e4e5b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(142,78,91,0.22)] transition hover:bg-[#763d49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e4e5b] dark:bg-[#c77786] dark:text-[#24141a] dark:hover:bg-[#d58b98]"
          >
            {copy.choose}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={localeHref(`/services?service=${encodeURIComponent(service.slug)}`, locale)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cba5ac]/65 px-4 py-2.5 text-sm font-semibold text-[#75434d] transition hover:border-[#9b5a66] hover:bg-[#f8ecee] dark:border-white/15 dark:text-white/76 dark:hover:bg-white/8"
          >
            {copy.details}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function FootCareLandingPage({ locale, copy, services }: Props) {
  const grouped = copy.groups.map((group) => ({
    ...group,
    services: services.filter((service) => service.group === group.key),
  }));

  return (
    <main className="overflow-hidden bg-[#fdf9f7] text-[#3d2b31] dark:bg-[#0b090b] dark:text-white">
      <SeoScrollProgress />

      <section className="relative isolate min-h-[760px] overflow-hidden border-b border-[#cfaeb4]/30 bg-[radial-gradient(circle_at_20%_10%,rgba(226,180,187,0.32),transparent_34%),linear-gradient(135deg,#fffaf7_0%,#f5e5e6_54%,#e8cfd3_100%)] pt-20 dark:border-white/10 dark:bg-[radial-gradient(circle_at_20%_10%,rgba(160,84,101,0.2),transparent_35%),linear-gradient(135deg,#0d0a0c_0%,#1b1116_56%,#2b1820_100%)] sm:pt-24">
        <div aria-hidden="true" className="absolute -left-24 top-32 h-72 w-72 rounded-full border border-[#bb7d88]/20" />
        <div aria-hidden="true" className="absolute -left-5 top-52 h-40 w-40 rounded-full border border-[#bb7d88]/25" />
        <div aria-hidden="true" className="absolute right-[12%] top-20 h-px w-40 rotate-[-28deg] bg-[#a56873]/30" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-28 lg:pt-14">
          <SeoReveal direction="left" amount={0.05}>
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#896f76] dark:text-white/45">
              <Link href={localeHref("/", locale)} className="transition hover:text-[#7d3f4b] dark:hover:text-white">
                {copy.breadcrumbHome}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.breadcrumbCurrent}</span>
            </nav>

            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#9a5662] dark:text-[#e4aeb8]">
              <span className="h-px w-10 bg-current opacity-60" />
              {copy.heroEyebrow}
            </p>
            <h1 className="mt-6 font-playfair text-[clamp(3.4rem,8vw,7.3rem)] font-medium leading-[0.88] tracking-[-0.055em] text-[#39252c] dark:text-white">
              {copy.heroTitle}
              <span className="mt-2 block font-light italic text-[#9b5a65] dark:text-[#e0a2ad]">
                {copy.heroAccent}
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#6f5960] dark:text-white/68 sm:text-lg">
              {copy.heroText}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={localeHref("/booking/services", locale)}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#854653] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_45px_rgba(133,70,83,0.28)] transition hover:-translate-y-0.5 hover:bg-[#713946] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854653] dark:bg-[#d18190] dark:text-[#271419]"
              >
                <CalendarDays className="h-4 w-4" />
                {copy.book}
              </Link>
              <a
                href="#leistungen"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#b98690]/55 bg-white/45 px-7 py-3.5 text-sm font-bold text-[#67404a] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/15 dark:bg-white/5 dark:text-white"
              >
                {copy.discover}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-[#897077] dark:text-white/45">
              <ShieldCheck className="h-4 w-4 text-[#a25d69] dark:text-[#dfa0ac]" />
              {copy.heroNote}
            </p>
          </SeoReveal>

          <SeoReveal direction="right" delay={0.08} amount={0.05} className="relative">
            <div className="relative mx-auto grid max-w-[720px] grid-cols-[1fr_0.42fr] gap-3 sm:gap-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#d9bcc1] shadow-[0_36px_100px_rgba(72,38,49,0.24)] sm:rounded-[2.8rem]">
                <Image
                  src={HERO_IMAGES[0]}
                  alt={`${copy.breadcrumbCurrent} – apparative Pediküre bei Salon Elen`}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 65vw, 38vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#321c24]/52 via-transparent to-white/5" />
                <div className="absolute inset-x-5 bottom-5 rounded-[1.3rem] border border-white/25 bg-[#2a1820]/42 p-4 text-white backdrop-blur-lg sm:inset-x-7 sm:bottom-7 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Salon Elen · Halle</p>
                  <p className="mt-2 font-playfair text-xl sm:text-2xl">{copy.heroNote.split(" · ")[0]}</p>
                </div>
              </div>
              <div className="grid gap-3 py-10 sm:gap-5 sm:py-16">
                {HERO_IMAGES.slice(1).map((src, index) => (
                  <div key={src} className="relative overflow-hidden rounded-[1.4rem] bg-[#d9bcc1] shadow-[0_24px_70px_rgba(72,38,49,0.18)] sm:rounded-[2rem]">
                    <Image
                      src={src}
                      alt={`${copy.breadcrumbCurrent} – ${index === 0 ? copy.groups[0].title : copy.groups[3].title}`}
                      fill
                      sizes="(max-width: 1024px) 28vw, 16vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#301b23]/45 to-transparent" />
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-5 -left-5 hidden h-28 w-28 items-center justify-center rounded-full border border-[#ad707b]/30 bg-[#fffaf7]/85 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#8c4e59] shadow-xl backdrop-blur-md sm:flex dark:bg-[#1f1218]/88 dark:text-[#e1a5af]">
                Halle
                <br />
                Paulusviertel
              </div>
            </div>
          </SeoReveal>
        </div>
      </section>

      <section aria-label="Key facts" className="border-b border-[#d5b8bd]/35 bg-[#ead6d9] dark:border-white/10 dark:bg-[#3c2930]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-10">
          {copy.facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`min-w-0 py-7 ${index % 2 ? "border-l border-[#b98b94]/30 pl-5" : "pr-5"} lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0`}
            >
              <p className="break-words font-playfair text-2xl font-semibold text-[#543740] dark:text-[#f3dce0] sm:text-3xl">
                {fact.value}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#785b63] dark:text-white/58 sm:text-sm">{fact.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.68fr_1.32fr] lg:px-10">
          <SeoReveal direction="left">
            <div className="sticky top-24">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a15d68]">{copy.answerEyebrow}</p>
              <div className="mt-5 h-px w-20 bg-[#a15d68]/45" />
            </div>
          </SeoReveal>
          <SeoReveal direction="right" className="rounded-[2rem] border border-[#d8b6bc]/45 bg-white/80 p-7 shadow-[0_22px_80px_rgba(87,52,62,0.07)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-10 lg:p-12">
            <h2 className="max-w-3xl font-playfair text-3xl font-medium leading-tight text-[#3a272e] dark:text-white sm:text-5xl">
              {copy.answerTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#705b61] dark:text-white/65 sm:text-lg">
              {copy.answerText}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {copy.answerPoints.map((point) => (
                <li key={point} className="flex gap-3 rounded-2xl bg-[#f7ecee] p-4 text-sm leading-6 text-[#62474e] dark:bg-white/5 dark:text-white/65">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#9d5965] dark:text-[#dda0ab]" />
                  {point}
                </li>
              ))}
            </ul>
          </SeoReveal>
        </div>
      </section>

      <section id="leistungen" className="scroll-mt-20 border-y border-[#d6b5bb]/35 bg-[#f4e8e8] py-20 dark:border-white/10 dark:bg-[#140f12] sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SeoReveal>
            <SectionHeading eyebrow={copy.catalogEyebrow} title={copy.catalogTitle} text={copy.catalogText} />
          </SeoReveal>

          <div className="mt-16 space-y-20">
            {grouped.map((group) => {
              const Icon = GROUP_ICONS[group.key];
              return (
                <section key={group.key} id={group.key} className="scroll-mt-24">
                  <SeoReveal className="grid gap-5 border-b border-[#cfaeb4]/55 pb-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                    <div>
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8d4e5a] text-white shadow-[0_12px_30px_rgba(141,78,90,0.2)] dark:bg-[#cb7b89] dark:text-[#251418]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#9b5864] dark:text-[#dda0aa]">{group.eyebrow}</p>
                    </div>
                    <div>
                      <h3 className="font-playfair text-3xl font-semibold text-[#3e2930] dark:text-white sm:text-4xl">{group.title}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#735e64] dark:text-white/60 sm:text-base">{group.description}</p>
                    </div>
                  </SeoReveal>

                  <SeoStagger className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.services.map((service) => (
                      <SeoStaggerItem key={service.id} className="h-full">
                        <ServiceCard service={service} copy={copy} locale={locale} />
                      </SeoStaggerItem>
                    ))}
                  </SeoStagger>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SeoReveal>
            <SectionHeading eyebrow={copy.processEyebrow} title={copy.processTitle} text={copy.processText} />
          </SeoReveal>
          <SeoStagger className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {copy.process.map((step) => (
              <SeoStaggerItem key={step.number} className="h-full">
                <article className="relative h-full overflow-hidden rounded-[1.7rem] border border-[#d5b3ba]/45 bg-white p-6 shadow-[0_20px_60px_rgba(82,48,58,0.06)] dark:border-white/10 dark:bg-white/[0.035] sm:p-7">
                  <span className="font-playfair text-5xl font-semibold text-[#ddbfc4] dark:text-white/12">{step.number}</span>
                  <h3 className="mt-8 font-playfair text-2xl font-semibold text-[#3e2930] dark:text-white">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#735f65] dark:text-white/60">{step.text}</p>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#4b3039] py-20 text-white dark:bg-[#28191f] sm:py-28">
        <div aria-hidden="true" className="absolute -right-24 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10">
          <SeoReveal direction="left" className="relative aspect-[4/4.3] overflow-hidden rounded-[2.2rem] shadow-[0_35px_100px_rgba(12,5,8,0.35)]">
            <Image
              src={`${FOOT_CARE_IMAGE_BASE_PATH}/mobile-intensive-fusspflege.webp`}
              alt={copy.mobileTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2b151d]/58 via-transparent to-transparent" />
            <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-xs font-semibold backdrop-blur-md">
              <House className="h-4 w-4" /> Halle (Saale)
            </span>
          </SeoReveal>
          <SeoReveal direction="right">
            <SectionHeading eyebrow={copy.mobileEyebrow} title={copy.mobileTitle} text={copy.mobileText} inverse />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.mobileFacts.map((fact) => (
                <li key={fact} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/75">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#efbdc5]" />
                  {fact}
                </li>
              ))}
            </ul>
            <Link
              href={localeHref("/booking/services", locale)}
              className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f1dadd] px-7 py-3 text-sm font-bold text-[#4b2933] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {copy.book}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SeoReveal>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SeoReveal>
            <SectionHeading eyebrow={copy.qualityEyebrow} title={copy.qualityTitle} text={copy.qualityText} />
          </SeoReveal>
          <SeoStagger className="mt-12 grid gap-4 md:grid-cols-2">
            {copy.qualityCards.map((card, index) => {
              const icons = [HeartHandshake, ShieldCheck, Gem, Languages];
              const Icon = icons[index];
              return (
                <SeoStaggerItem key={card.title} className="h-full">
                  <article className="flex h-full gap-5 rounded-[1.7rem] border border-[#d8b8be]/45 bg-[#fffdfb] p-6 dark:border-white/10 dark:bg-white/[0.035] sm:p-8">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0dfe1] text-[#8d4e59] dark:bg-[#c97987]/12 dark:text-[#dfa0ab]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-playfair text-xl font-semibold text-[#402a31] dark:text-white sm:text-2xl">{card.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[#745f65] dark:text-white/60">{card.text}</p>
                    </div>
                  </article>
                </SeoStaggerItem>
              );
            })}
          </SeoStagger>

          <SeoReveal className="mt-10 rounded-[2rem] border border-[#d6aab2]/60 bg-[linear-gradient(135deg,#f7e7e9,#efe0dc)] p-7 dark:border-[#cc7887]/20 dark:bg-[linear-gradient(135deg,rgba(126,62,76,0.15),rgba(255,255,255,0.03))] sm:p-10 lg:p-12">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.23em] text-[#9a5662] dark:text-[#dfa0ab]">{copy.safetyEyebrow}</p>
                <h3 className="mt-4 font-playfair text-3xl font-semibold leading-tight text-[#3c272e] dark:text-white">{copy.safetyTitle}</h3>
              </div>
              <div>
                <p className="text-base leading-8 text-[#684f57] dark:text-white/68">{copy.safetyText}</p>
                <p className="mt-5 border-l-2 border-[#aa6874] pl-5 text-sm leading-7 text-[#7a6269] dark:text-white/50">{copy.safetyNote}</p>
              </div>
            </div>
          </SeoReveal>
        </div>
      </section>

      <section className="border-y border-[#d7b9be]/35 bg-[#f1e3e3] py-20 dark:border-white/10 dark:bg-[#151013] sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:px-10">
          <SeoReveal direction="left">
            <SectionHeading eyebrow={copy.localEyebrow} title={copy.localTitle} text={copy.localText} />
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {[
                { icon: MapPin, label: copy.addressLabel, value: copy.address },
                { icon: Clock3, label: copy.hoursLabel, value: copy.hours },
                { icon: Languages, label: copy.languagesLabel, value: copy.languages },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-[#d4b1b7]/50 bg-white/65 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                  <Icon className="h-5 w-5 text-[#965562] dark:text-[#dda0aa]" />
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#957d83] dark:text-white/38">{label}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#4f363d] dark:text-white/75">{value}</p>
                </div>
              ))}
            </div>
          </SeoReveal>
          <SeoReveal direction="right" className="relative min-h-[420px] overflow-hidden rounded-[2.2rem] bg-[#d8b8bd] shadow-[0_30px_100px_rgba(80,45,56,0.15)]">
            <Image
              src={`${FOOT_CARE_IMAGE_BASE_PATH}/klassische-pedikuere.webp`}
              alt={`${copy.localTitle} – Salon Elen Lessingstraße 37`}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#301b22]/72 via-transparent to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 rounded-[1.4rem] border border-white/20 bg-[#2b1720]/50 p-5 text-white backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-white/58">Salon Elen</p>
                <p className="mt-1 font-playfair text-xl">Lessingstraße 37 · Halle</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://maps.google.com/?q=Lessingstra%C3%9Fe+37%2C+06114+Halle+Saale"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#4a2932] transition hover:bg-[#f5dfe2]"
                >
                  <MapPin className="h-4 w-4" />
                  {copy.route}
                </a>
                <a
                  href="tel:+491778995106"
                  aria-label="+49 177 899 51 06"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          </SeoReveal>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SeoReveal>
            <SectionHeading eyebrow={copy.faqEyebrow} title={copy.faqTitle} />
          </SeoReveal>
          <SeoStagger className="mt-10 space-y-3">
            {copy.faq.map((item) => (
              <SeoStaggerItem key={item.question}>
                <details className="group rounded-2xl border border-[#d7b7bd]/50 bg-white/78 px-5 open:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:open:bg-white/[0.055] sm:px-7">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-semibold text-[#493139] marker:content-none dark:text-white sm:text-lg">
                    <span>{item.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#9a5863] transition group-open:rotate-180 dark:text-[#dda0aa]" />
                  </summary>
                  <p className="max-w-3xl border-t border-[#e2cdd1]/55 pb-6 pt-5 text-sm leading-7 text-[#715c62] dark:border-white/10 dark:text-white/62 sm:text-base sm:leading-8">
                    {item.answer}
                  </p>
                </details>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <SeoReveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] bg-[#4c3039] px-6 py-14 text-center text-white shadow-[0_35px_100px_rgba(58,30,39,0.24)] dark:bg-[#2a1920] sm:px-10 sm:py-20">
          <div aria-hidden="true" className="absolute -left-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-[#b36b78]/18 blur-3xl" />
          <Footprints className="relative mx-auto h-8 w-8 text-[#efbdc5]" />
          <p className="relative mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#efbdc5]">{copy.finalEyebrow}</p>
          <h2 className="relative mx-auto mt-5 max-w-3xl font-playfair text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">{copy.finalTitle}</h2>
          <p className="relative mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70">{copy.finalText}</p>
          <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={localeHref("/booking/services", locale)}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#f2dadd] px-7 py-3.5 text-sm font-bold text-[#4a2831] transition hover:-translate-y-0.5 hover:bg-white"
            >
              <CalendarDays className="h-4 w-4" />
              {copy.book}
            </Link>
            <Link
              href={localeHref("/services", locale)}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/12"
            >
              {copy.allServices}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SeoReveal>
      </section>
    </main>
  );
}
