import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Gift, Heart, Sparkles } from 'lucide-react';
import type { Locale } from '@/i18n/locales';
import { HOME_GIFT_COPY, homeGiftLinks } from '@/lib/home-gutschein';
import { GIFT_DESIGN_KEYS, giftDesigns } from '@/lib/gutschein-designs';
import styles from './home-gutschein-section.module.css';

export default function HomeGutscheinSection({ locale }: { locale: Locale }) {
  const t = HOME_GIFT_COPY[locale];
  const links = homeGiftLinks(locale);
  return (
    <section id="gutscheine" aria-labelledby="home-gift-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><Gift size={17} aria-hidden="true" />{t.eyebrow}</p>
          <h2 id="home-gift-title">{t.title}<br /><em>{t.accent}</em></h2>
          <p className={styles.description}>{t.description}</p>
          <ul className={styles.features}>{t.features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" />{feature}</li>)}</ul>
          <div className={styles.actions}>
            <Link href={links.create} className={styles.primary}>{t.cta}<ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link href={links.page} className={styles.secondary}>{t.details}<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <p className={styles.note}>{t.note}</p>
        </div>

        <div className={styles.artwork}>
          <div className={styles.composition} aria-hidden="true">
            <div className={styles.halo} />
            <div className={styles.backCard}>
              <Image src={giftDesigns.peony.image} alt="" fill sizes="(max-width: 600px) 55vw, 280px" className={styles.botanical} />
              <span>SALON ELEN</span><Heart size={20} />
            </div>
            <div className={styles.frontCard}>
              <Image src={giftDesigns.orchid.image} alt="" fill sizes="(max-width: 600px) 78vw, (max-width: 1024px) 470px, 42vw" className={styles.botanical} />
              <div className={styles.cardShade} />
              <div className={styles.cardContent}>
                <p className={styles.cardBrand}>SALON ELEN<Sparkles size={17} /></p>
                <p className={styles.cardTitle}>{t.cardTitle}</p>
                <p className={styles.cardMessage}>{t.cardMessage}</p>
                <div className={styles.cardFooter}><span>BEAUTY · CARE · YOU</span><Heart size={18} /></div>
              </div>
            </div>
            <div className={styles.collection}><span className={styles.swatches}>{GIFT_DESIGN_KEYS.map(key => <i key={key} style={{ backgroundColor: giftDesigns[key].background }} />)}</span><span>{t.collection}</span></div>
          </div>
          <p className={styles.preview}>{t.preview}</p>
        </div>
      </div>
    </section>
  );
}
