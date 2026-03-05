// src/app/admin/ai/_components/AiContentClient.tsx
'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FileText, Settings2, Plus, Pencil, Trash2, Upload, Save, X, ChevronDown, ChevronRight, ArrowLeft, Loader2, Database, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import type { SeoLocale } from '@/lib/seo-locale';

interface Block { id:string;key:string;title:string;contentDe:string;contentRu:string;contentEn:string;context:string;triggerIntent:string|null;priority:number;enabled:boolean;serviceSlug:string|null;version:number;publishedAt:string|null;createdAt:string;updatedAt:string; }
interface Service { id:string;name:string;slug:string;isParent:boolean; }
interface SvcConf { id:string;serviceId:string;showInConsultation:boolean;showInAssistantMenu:boolean;showInBooking:boolean;aiOrder:number;aiTags:string|null;aiDescriptionDe:string|null;aiDescriptionRu:string|null;aiDescriptionEn:string|null;idealForDe:string|null;idealForRu:string|null;idealForEn:string|null;createdAt:string;updatedAt:string; }

const API = '/api/admin/ai-content';
const CONTEXTS = ['faq','objection','aftercare','consultation','comparison','safety','upsell','occasion'] as const;
const LANG_TABS = ['de','ru','en'] as const;

const T = {
  de: { title:'AI Inhalt',subtitle:'Inhalte und Dienstkonfiguration',content:'Inhalte',services:'Dienste',back:'Zurück',add:'Hinzufügen',edit:'Bearbeiten',delete:'Löschen',save:'Speichern',cancel:'Abbrechen',seed:'Aus Knowledge importieren',publish:'Veröffentlichen',draft:'Entwurf',enabled:'Aktiv',disabled:'Inaktiv',key:'Schlüssel',titleL:'Titel',context:'Kontext',intent:'Trigger-Intent',priority:'Priorität',version:'Version',noBlocks:'Keine Inhaltsblöcke',confirmDel:'Wirklich löschen?',published:'Publiziert',cache:'Cache leeren',consultation:'Beratung',menu:'Menü',booking:'Buchung',order:'Reihenfolge',tags:'Tags',noConfigs:'Keine Konfiguration',seeded:'importiert',saving:'Speichern...',saved:'Gespeichert' },
  ru: { title:'AI Контент',subtitle:'Управление контентом и настройками услуг',content:'Контент',services:'Услуги',back:'Назад',add:'Добавить',edit:'Изменить',delete:'Удалить',save:'Сохранить',cancel:'Отмена',seed:'Импорт из Knowledge',publish:'Опубликовать',draft:'Черновик',enabled:'Активен',disabled:'Отключён',key:'Ключ',titleL:'Название',context:'Контекст',intent:'Trigger-Intent',priority:'Приоритет',version:'Версия',noBlocks:'Нет контент-блоков',confirmDel:'Точно удалить?',published:'Опубликован',cache:'Очистить кеш',consultation:'Консультация',menu:'Меню',booking:'Букинг',order:'Порядок',tags:'Теги',noConfigs:'Нет конфигурации',seeded:'импортировано',saving:'Сохранение...',saved:'Сохранено' },
  en: { title:'AI Content',subtitle:'Manage content blocks and service config',content:'Content',services:'Services',back:'Back',add:'Add',edit:'Edit',delete:'Delete',save:'Save',cancel:'Cancel',seed:'Seed from Knowledge',publish:'Publish',draft:'Draft',enabled:'Enabled',disabled:'Disabled',key:'Key',titleL:'Title',context:'Context',intent:'Trigger Intent',priority:'Priority',version:'Version',noBlocks:'No content blocks',confirmDel:'Really delete?',published:'Published',cache:'Clear Cache',consultation:'Consultation',menu:'Menu',booking:'Booking',order:'Order',tags:'Tags',noConfigs:'No service configs',seeded:'seeded',saving:'Saving...',saved:'Saved' },
} as const;

export default function AiContentClient({ locale, initialBlocks, services, initialConfigs }:{ locale:SeoLocale; initialBlocks:Block[]; services:Service[]; initialConfigs:SvcConf[]; }) {
  const t = T[locale];
  const [tab, setTab] = useState<'content'|'services'>('content');
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [configs, setConfigs] = useState<SvcConf[]>(initialConfigs);
  const [editing, setEditing] = useState<Block|null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCtx, setFilterCtx] = useState('');
  const [langTab, setLangTab] = useState<'de'|'ru'|'en'>('de');
  const [expandedSvc, setExpandedSvc] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    const res = await fetch(API); if (res.ok) { const d = await res.json(); setBlocks(d.blocks); }
  }, []);

  const handleSeed = async () => { const res = await fetch(`${API}?action=seed`,{method:'POST'}); if(res.ok){const d=await res.json();alert(`${d.seeded} ${t.seeded}`);await reload();} };
  const handleToggle = async (id:string, enabled:boolean) => { await fetch(`${API}?action=toggle&id=${id}&enabled=${enabled}`,{method:'POST'}); setBlocks(p=>p.map(b=>b.id===id?{...b,enabled}:b)); };
  const handlePublish = async (id:string) => { await fetch(`${API}?action=publish&id=${id}`,{method:'POST'}); await reload(); };
  const handleDelete = async (id:string) => { if(!confirm(t.confirmDel))return; await fetch(`${API}?id=${id}`,{method:'DELETE'}); setBlocks(p=>p.filter(b=>b.id!==id)); };
  const handleClearCache = async () => { await fetch(`${API}?action=invalidate-cache`,{method:'POST'}); };

  const handleSave = async () => {
    if(!editing)return; setSaving(true);
    try {
      if(isNew){ await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...editing,publish:true})}); }
      else { await fetch(`${API}?id=${editing.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...editing,publish:true})}); }
      await reload(); setEditing(null); setIsNew(false);
    } finally { setSaving(false); }
  };

  const handleSvcConfig = async (serviceId:string, data:Partial<SvcConf>) => {
    await fetch(`${API}?action=service-config`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({serviceId,...data})});
    const res = await fetch(`${API}?type=services`); if(res.ok){const d=await res.json();setConfigs(d.configs);}
  };

  const startNew = () => { setEditing({id:'',key:'',title:'',contentDe:'',contentRu:'',contentEn:'',context:'faq',triggerIntent:null,priority:0,enabled:true,serviceSlug:null,version:1,publishedAt:null,createdAt:'',updatedAt:''}); setIsNew(true); };
  const startEdit = (b:Block) => { setEditing({...b}); setIsNew(false); };
  const filtered = filterCtx ? blocks.filter(b=>b.context===filterCtx) : blocks;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/ai" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></Link>
        <div><h1 className="text-xl font-bold">{t.title}</h1><p className="text-xs text-slate-500">{t.subtitle}</p></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {(['content','services'] as const).map(tb=>(
            <button key={tb} onClick={()=>setTab(tb)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${tab===tb?'bg-violet-500/30 text-violet-300':'text-slate-400 hover:text-white'}`}>
              {tb==='content'?<FileText className="h-3.5 w-3.5"/>:<Settings2 className="h-3.5 w-3.5"/>}{t[tb]}
            </button>
          ))}
        </div>
        <div className="flex-1"/>
        {tab==='content'&&<>
          <Btn onClick={handleSeed} icon={<Database className="h-3.5 w-3.5"/>} label={t.seed}/>
          <Btn onClick={handleClearCache} icon={<RefreshCw className="h-3.5 w-3.5"/>} label={t.cache}/>
          <Btn onClick={startNew} icon={<Plus className="h-3.5 w-3.5"/>} label={t.add} accent/>
        </>}
      </div>

      {/* Editor modal */}
      <AnimatePresence>{editing&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-20 backdrop-blur-sm">
          <motion.div initial={{y:20,scale:0.98}} animate={{y:0,scale:1}} exit={{y:20,scale:0.98}} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{isNew?t.add:t.edit}</h2><button onClick={()=>{setEditing(null);setIsNew(false);}} className="text-slate-500 hover:text-white"><X className="h-5 w-5"/></button></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Inp label={t.key} value={editing.key} disabled={!isNew} onChange={v=>setEditing({...editing,key:v})} mono/>
                <Inp label={t.titleL} value={editing.title} onChange={v=>setEditing({...editing,title:v})}/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Sel label={t.context} value={editing.context} options={CONTEXTS.map(c=>({value:c,label:c}))} onChange={v=>setEditing({...editing,context:v})}/>
                <Inp label={t.intent} value={editing.triggerIntent||''} onChange={v=>setEditing({...editing,triggerIntent:v||null})}/>
                <Inp label={t.priority} value={String(editing.priority)} type="number" onChange={v=>setEditing({...editing,priority:parseInt(v)||0})}/>
              </div>
              <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
                {LANG_TABS.map(l=><button key={l} onClick={()=>setLangTab(l)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${langTab===l?'bg-violet-500/30 text-violet-300':'text-slate-400 hover:text-white'}`}>{l.toUpperCase()}</button>)}
              </div>
              <textarea value={langTab==='de'?editing.contentDe:langTab==='ru'?editing.contentRu:editing.contentEn}
                onChange={e=>{const f=langTab==='de'?'contentDe':langTab==='ru'?'contentRu':'contentEn';setEditing({...editing,[f]:e.target.value});}}
                rows={8} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40" placeholder={`Content (${langTab.toUpperCase()})...`}/>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={editing.enabled} onChange={e=>setEditing({...editing,enabled:e.target.checked})}/>{editing.enabled?t.enabled:t.disabled}</label>
                <div className="flex gap-2">
                  <Btn onClick={()=>{setEditing(null);setIsNew(false);}} label={t.cancel}/>
                  <Btn onClick={handleSave} icon={saving?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Save className="h-3.5 w-3.5"/>} label={saving?t.saving:t.save} accent disabled={saving}/>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Content list */}
      {tab==='content'&&<div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          <FC active={!filterCtx} onClick={()=>setFilterCtx('')} label="All"/>
          {CONTEXTS.map(c=><FC key={c} active={filterCtx===c} onClick={()=>setFilterCtx(c)} label={c} count={blocks.filter(b=>b.context===c).length}/>)}
        </div>
        {filtered.length===0?<div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-slate-500">{t.noBlocks}</div>:
        <div className="space-y-2">{filtered.map(b=>(
          <motion.div key={b.id} layout initial={{opacity:0}} animate={{opacity:1}} className={`rounded-xl border bg-white/5 px-4 py-3 ${b.enabled?'border-white/10':'border-white/5 opacity-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${b.enabled&&b.publishedAt?'bg-emerald-500':b.enabled?'bg-amber-500':'bg-slate-600'}`}/>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-200">{b.title}</span><span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">{b.key}</span></div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-400">{b.context}</span>
                  {b.triggerIntent&&<span>→ {b.triggerIntent}</span>}
                  <span>v{b.version}</span>
                  {b.publishedAt?<span className="text-emerald-500">✓ {t.published}</span>:<span className="text-amber-500">{t.draft}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <IBtn onClick={()=>handleToggle(b.id,!b.enabled)} icon={b.enabled?<ToggleRight className="h-4 w-4 text-emerald-400"/>:<ToggleLeft className="h-4 w-4 text-slate-500"/>}/>
                {!b.publishedAt&&<IBtn onClick={()=>handlePublish(b.id)} icon={<Upload className="h-3.5 w-3.5 text-amber-400"/>}/>}
                <IBtn onClick={()=>startEdit(b)} icon={<Pencil className="h-3.5 w-3.5"/>}/>
                <IBtn onClick={()=>handleDelete(b.id)} icon={<Trash2 className="h-3.5 w-3.5 text-red-400"/>}/>
              </div>
            </div>
          </motion.div>
        ))}</div>}
      </div>}

      {/* Services tab */}
      {tab==='services'&&<div className="space-y-2">{services.filter(s=>!s.isParent).map(svc=>{
        const conf=configs.find(c=>c.serviceId===svc.id);
        const exp=expandedSvc.has(svc.id);
        return(<div key={svc.id} className="rounded-xl border border-white/10 bg-white/5">
          <button onClick={()=>setExpandedSvc(p=>{const n=new Set(p);if(n.has(svc.id))n.delete(svc.id);else n.add(svc.id);return n;})} className="flex w-full items-center gap-3 px-4 py-3 text-left">
            {exp?<ChevronDown className="h-3.5 w-3.5 text-slate-500"/>:<ChevronRight className="h-3.5 w-3.5 text-slate-500"/>}
            <span className="flex-1 text-sm text-slate-200">{svc.name}</span>
            <span className="text-[10px] font-mono text-slate-500">{svc.slug}</span>
            {conf&&<div className="flex gap-1">
              {conf.showInConsultation&&<span className="rounded bg-violet-500/15 px-1 py-0.5 text-[9px] text-violet-400">{t.consultation}</span>}
              {conf.showInAssistantMenu&&<span className="rounded bg-sky-500/15 px-1 py-0.5 text-[9px] text-sky-400">{t.menu}</span>}
              {conf.showInBooking&&<span className="rounded bg-emerald-500/15 px-1 py-0.5 text-[9px] text-emerald-400">{t.booking}</span>}
            </div>}
          </button>
          <AnimatePresence>{exp&&(
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden border-t border-white/5 px-4 py-3">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <Tgl label={t.consultation} checked={conf?.showInConsultation??true} onChange={v=>handleSvcConfig(svc.id,{showInConsultation:v})}/>
                  <Tgl label={t.menu} checked={conf?.showInAssistantMenu??true} onChange={v=>handleSvcConfig(svc.id,{showInAssistantMenu:v})}/>
                  <Tgl label={t.booking} checked={conf?.showInBooking??true} onChange={v=>handleSvcConfig(svc.id,{showInBooking:v})}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Inp label={t.order} value={String(conf?.aiOrder??100)} type="number" onChange={v=>handleSvcConfig(svc.id,{aiOrder:parseInt(v)||100})}/>
                  <Inp label={t.tags} value={conf?.aiTags||''} onChange={v=>handleSvcConfig(svc.id,{aiTags:v||null})} placeholder="pmu,brows"/>
                </div>
              </div>
            </motion.div>
          )}</AnimatePresence>
        </div>);
      })}</div>}
    </div>
  );
}

function Btn({onClick,icon,label,accent,disabled}:{onClick:()=>void;icon?:React.ReactNode;label:string;accent?:boolean;disabled?:boolean}){
  return <button onClick={onClick} disabled={disabled} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${accent?'border-violet-500/30 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25':'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>{icon}{label}</button>;
}
function IBtn({onClick,icon}:{onClick:()=>void;icon:React.ReactNode}){
  return <button onClick={onClick} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white">{icon}</button>;
}
function FC({active,onClick,label,count}:{active:boolean;onClick:()=>void;label:string;count?:number}){
  return <button onClick={onClick} className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${active?'bg-violet-500/25 text-violet-300':'bg-white/5 text-slate-400 hover:text-white'}`}>{label}{count!=null&&` (${count})`}</button>;
}
function Inp({label,value,onChange,type,placeholder,mono,disabled}:{label:string;value:string;onChange:(v:string)=>void;type?:string;placeholder?:string;mono?:boolean;disabled?:boolean}){
  return <label className="grid gap-1"><span className="text-[10px] text-slate-500">{label}</span><input type={type||'text'} value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} placeholder={placeholder} className={`rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-violet-500/40 disabled:opacity-50 ${mono?'font-mono':''}`}/></label>;
}
function Sel({label,value,options,onChange}:{label:string;value:string;options:{value:string;label:string}[];onChange:(v:string)=>void}){
  return <label className="grid gap-1"><span className="text-[10px] text-slate-500">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 outline-none">{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
function Tgl({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){
  return <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer"><div onClick={()=>onChange(!checked)} className={`relative h-5 w-9 rounded-full transition-colors ${checked?'bg-violet-500/40':'bg-white/10'}`}><div className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${checked?'left-4 bg-violet-400':'left-0.5 bg-slate-500'}`}/></div>{label}</label>;
}
