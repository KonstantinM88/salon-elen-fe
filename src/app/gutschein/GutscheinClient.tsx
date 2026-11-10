'use client';

import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Check, CheckCircle2, Gift, Heart, Mail, MapPin, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { giftCopy } from '@/lib/gutschein-copy';
import { GIFT_AMOUNTS } from '@/lib/gutschein';
import { GIFT_DESIGN_KEYS, giftDesigns, type GiftDesignKey } from '@/lib/gutschein-designs';
import { giftDetailsCopy, giftFaq } from '@/lib/gutschein-details-copy';
import styles from './gutschein.module.css';

export default function GutscheinClient() {
  const { locale } = useI18n();
  const t = giftCopy[locale];
  const detail = giftDetailsCopy[locale];
  const [designKey, setDesignKey] = useState<GiftDesignKey>('orchid');
  const design = giftDesigns[designKey];
  const [amount, setAmount] = useState('100');
  const [custom, setCustom] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [delivery, setDelivery] = useState('EMAIL');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; receiptSent: boolean } | null>(null);
  const requestId = useRef<string | null>(null);
  const submissionLock = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const suffix = locale === 'de' ? '' : `?lang=${locale}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLock.current) return;
    const form = new FormData(event.currentTarget);
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 25 || value > 500) { setError(t.invalid); return; }
    const phone = String(form.get('phone') || '').trim();
    if (!/^[+()\d\s./-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) { setError(detail.invalidPhone); return; }
    submissionLock.current = true;
    setPending(true);
    setError('');
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch('/api/gutschein', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: requestId.current, locale, amount: value, designKey,
          buyerName: form.get('buyerName'), email: form.get('email'), phone,
          recipientName: recipient, senderName: sender, message, delivery,
          consent: form.get('consent') === 'on', website: form.get('website'),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 429 ? t.rate : data.error === 'VALIDATION' ? t.invalid : t.error);
      setResult({ reference: data.reference, receiptSent: data.receiptSent });
      requestAnimationFrame(() => { successRef.current?.focus(); successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.error); }
    finally { setPending(false); submissionLock.current = false; }
  }

  return <div className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{t.eyebrow}</p>
        <h1><span className={styles.searchHeading}>{detail.heading}</span>{t.title}<br /><em>{t.titleAccent}</em></h1>
        <p className={styles.lead}>{t.intro}</p>
        <p className={styles.description}>{t.description}</p>
        <div className={styles.heroActions}><a href="#gestalten" className={styles.primary}>{t.cta}<ArrowUpRight size={18} /></a><a href="#ablauf" className={styles.textLink}>{t.secondary}<ArrowDown size={16} /></a></div>
        <ul className={styles.perks}>{t.perks.map(perk => <li key={perk}><Check size={14} />{perk}</li>)}</ul>
      </div>
      <div className={styles.heroArt} aria-hidden="true">
        <div className={styles.halo} /><div className={styles.envelope} />
        <div className={styles.heroCard}><div className={styles.heroBotanical}><Image src={giftDesigns.orchid.image} alt="" fill sizes="(max-width: 600px) 85vw, 440px" priority /></div><div className={styles.cardBrand}>SALON ELEN <Sparkles size={22} /></div><div className={styles.cardTitle}>{t.voucher}</div><p>{t.voucherSub}</p><div className={styles.heroCardLine} /><span>BEAUTY · CARE · YOU</span><div className={styles.seal}><Gift size={25} /></div></div>
        <div className={styles.artCaption}><Heart size={16} />{t.badge}</div>
        <span className={styles.artNumber}>01 / ELEN GIFT COLLECTION</span>
      </div>
    </section>

    <section className={styles.answer}><p className={styles.eyebrow}>HALLE (SAALE) · PAULUSVIERTEL</p><h2>{detail.answerTitle}</h2><p>{detail.answer}</p></section>

    <section className={styles.occasion}>
      <div><p className={styles.eyebrow}>A LITTLE MORE LOVE</p><h2>{t.occasionTitle}</h2></div><p>{t.occasionIntro}</p>
      <div className={styles.occasionGrid}>{t.occasions.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section id="gestalten" className={styles.builder}>
      <header className={styles.builderHeader}><p className={styles.eyebrow}>{t.formEyebrow}</p><h2>{t.formTitle}</h2><p>{t.formIntro}</p></header>
      <div className={styles.builderGrid}>
        {!result && <fieldset className={styles.designPicker} disabled={pending}>
          <legend>{detail.design}</legend>
          <div className={styles.designOptions}>{GIFT_DESIGN_KEYS.map(key => <label key={key} className={styles.designOption}>
            <input type="radio" name="designKey" value={key} checked={designKey === key} onChange={() => setDesignKey(key)} />
            <span className={styles.designSwatch}><Image src={giftDesigns[key].image} alt="" fill sizes="(max-width: 600px) 40vw, 240px" /><span className={styles.designCheck}><Check size={15} /></span></span>
            <span className={styles.designName}>{giftDesigns[key].names[locale]}</span>
          </label>)}</div><p className={styles.hint}>{detail.designHint}</p>
        </fieldset>}
        <aside className={styles.previewColumn}>
          <div className={styles.previewCard} data-design={designKey} style={{ '--gift-background': design.background, '--gift-foreground': design.foreground, '--gift-border': design.border } as CSSProperties}>
            <div className={styles.previewBotanical}><Image key={designKey} src={design.image} alt={design.names[locale]} fill sizes="(max-width: 600px) 86vw, (max-width: 850px) 36vw, 440px" /></div>
            <div className={styles.cardBrand}>SALON ELEN<Sparkles size={20} /></div>
            <p className={styles.previewLabel}>{t.voucher}</p><p className={styles.previewAmount}>{Number(amount) >= 25 && Number(amount) <= 500 ? amount : '—'} <span>€</span></p>
            <div className={styles.previewRecipient}><small>{t.to}</small><strong>{recipient || t.defaultRecipient}</strong></div>
            <p className={styles.previewMessage}>{message || t.defaultMessage}</p>
            <div className={styles.previewFrom}><small>{t.from}</small><span>{sender || t.defaultSender}</span><Heart size={20} /></div>
          </div>
          <p className={styles.previewDisclaimer}>{t.preview}</p>
          <div className={styles.previewPlace}><MapPin size={18} /><span>Salon Elen<br />Lessingstraße 37 · Halle (Saale)</span></div>
        </aside>

        {result ? <div className={styles.success} ref={successRef} tabIndex={-1} role="status"><CheckCircle2 size={46} /><h3>{t.successTitle}</h3><p>{t.success}</p><div className={styles.reference}><small>{t.reference}</small><strong>{result.reference}</strong></div><p>{result.receiptSent ? t.emailSent : t.emailNotSent}</p><p className={styles.hint}>{t.note}</p><button className={styles.primary} type="button" onClick={() => { setResult(null); requestId.current = null; }}>{t.again}<ArrowUpRight size={16} /></button></div>
          : <form className={styles.form} onSubmit={submit}>
            <fieldset disabled={pending}>
              <legend>{t.amount}</legend>
              <div className={styles.amounts}>{GIFT_AMOUNTS.map(value => <button key={value} type="button" aria-pressed={!custom && amount === String(value)} className={!custom && amount === String(value) ? styles.chosen : ''} onClick={() => { setAmount(String(value)); setCustom(false); }}>{value} €</button>)}</div>
              <button type="button" className={styles.customToggle} aria-expanded={custom} onClick={() => setCustom(!custom)}>{t.custom}<span>{custom ? '−' : '+'}</span></button>
              {custom && <label className={styles.field}><span>{t.custom} (€)</span><input aria-describedby="amount-hint" type="number" inputMode="numeric" min="25" max="500" step="1" value={amount} onChange={event => setAmount(event.target.value)} required /><small id="amount-hint">{t.amountHint}</small></label>}
            </fieldset>
            <fieldset disabled={pending}><legend>{t.personalize}</legend>
              <div className={styles.fieldGrid}><label className={styles.field}><span>{t.recipient} <small>({t.optional})</small></span><input maxLength={100} value={recipient} onChange={event => setRecipient(event.target.value)} autoComplete="off" /></label><label className={styles.field}><span>{t.sender} <small>({t.optional})</small></span><input maxLength={100} value={sender} onChange={event => setSender(event.target.value)} autoComplete="off" /></label></div>
              <label className={styles.field}><span>{t.greeting} <small>({t.optional})</small></span><textarea rows={3} maxLength={500} value={message} onChange={event => setMessage(event.target.value)} placeholder={t.defaultMessage} /><small className={styles.counter}>{message.length}/500</small></label>
            </fieldset>
            <fieldset disabled={pending}><legend>{t.contact}</legend>
              <label className={styles.field}><span>{t.buyer} *</span><input name="buyerName" autoComplete="name" minLength={2} maxLength={100} required /></label>
              <div className={styles.fieldGrid}><label className={styles.field}><span>{t.email} *</span><input name="email" autoComplete="email" type="email" maxLength={254} required /></label><label className={styles.field}><span>{t.phone} *</span><input name="phone" autoComplete="tel" type="tel" inputMode="tel" minLength={7} maxLength={40} required aria-describedby="phone-hint" /><small id="phone-hint">{detail.phoneHint}</small></label></div>
              <div role="group" aria-label={t.delivery} className={styles.delivery}><button type="button" aria-pressed={delivery === 'EMAIL'} className={delivery === 'EMAIL' ? styles.chosen : ''} onClick={() => setDelivery('EMAIL')}><Mail size={19} />{t.emailDelivery}</button><button type="button" aria-pressed={delivery === 'PICKUP'} className={delivery === 'PICKUP' ? styles.chosen : ''} onClick={() => setDelivery('PICKUP')}><MapPin size={19} />{t.pickup}</button></div><p className={styles.hint}>{t.deliveryHint}</p>
              <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
              <label className={styles.consent}><input type="checkbox" name="consent" required /><span>{t.privacy} <Link href={`/datenschutz${suffix}`} target="_blank" rel="noopener noreferrer">{t.privacyLink}<span className="sr-only"> ↗</span></Link></span></label>
              {error && <p role="alert" className={styles.error}>{error}</p>}
              <button type="submit" className={styles.primary} disabled={pending}>{pending ? t.sending : t.submit}<ArrowUpRight size={18} /></button><p className={styles.hint}>{t.note}</p>
            </fieldset>
          </form>}
      </div>
    </section>

    <section className={styles.treatments}><p className={styles.eyebrow}>BEAUTY · CARE · HALLE</p><h2>{detail.treatmentsTitle}</h2><p>{detail.treatmentsIntro}</p><div>{detail.treatments.map(([href, title, text], index) => <Link href={`${href}${suffix}`} key={href}><span>0{index + 1}</span><h3>{title}<ArrowUpRight size={20} /></h3><p>{text}</p></Link>)}</div></section>
    <section id="ablauf" className={styles.process}><h2>{t.how}</h2><div>{t.steps.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className={styles.faq}><div><p className={styles.eyebrow}>GUTSCHEIN · SALON ELEN</p><h2>{t.faqTitle}</h2></div><div>{giftFaq(locale).map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className={styles.local}><Sparkles size={28} /><h2>{t.localTitle}</h2><p>{t.localText}</p><div><Link href={`/services${suffix}`}>{t.services}<ArrowUpRight size={17} /></Link><Link href={`/contacts${suffix}`}>{t.contacts}<ArrowUpRight size={17} /></Link></div></section>
  </div>;
}
