import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import DocumentsTab from '../components/DocumentsTab'
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, ChevronRight, Lock, LockOpen,
  Link2, ExternalLink, Info, RefreshCw, Flag, FileText, Ban, Trash2,
  Store, ShieldCheck, KeyRound, Settings, ShieldAlert, UserCheck, Link as LinkIcon,
  Shield, DollarSign, Users, Scale, Rocket, Clock, ArrowUpRight, X, Plus, Check
} from 'lucide-react'

/* ─── Department menu icons (Lucide) ─── */
const DEPT_ICON_MAP = {
  compliance: Shield,
  fraud: ShieldAlert,
  finances: DollarSign,
  sales: Users,
  legal: Scale,
  kickoff: Rocket,
  golive: Flag,
  review: Clock,
}

/* ─── Config ─── */
const DEPARTMENTS = [
  { key: 'compliance', name: 'Compliance', status: 'complete' },
  { key: 'fraud', name: 'Fraud', status: 'complete' },
  { key: 'finances', name: 'Finance', status: 'complete' },
  { key: 'sales', name: 'Sales', status: 'complete' },
  { key: 'legal', name: 'Legal and Contract', status: 'complete' },
  { key: 'kickoff', name: 'Kickoff & Integration', status: 'complete' },
  { key: 'golive', name: 'Go Live', status: 'pending' },
]

const TABS = ['Resumen', 'Revisión por áreas', 'Features', 'Contactos', 'Documentos', 'Timeline']

/* ─── Shared UI ─── */

/* Status dot: 16px circle — completed (green+check), in_progress (yellow+loading), not_started (grey+minus) */
const STATUS_TOOLTIPS = {
  completed: 'Completado',
  in_progress: 'En progreso',
  not_started: 'Sin iniciar',
  completed_conditions: 'Completado con condiciones',
}

function StatusDot({ status }) {
  const tooltip = STATUS_TOOLTIPS[status] || STATUS_TOOLTIPS.not_started
  const dot = status === 'completed' ? (
    <span className="w-[16px] h-[16px] rounded-full bg-[#2ecc71] flex items-center justify-center shrink-0">
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  ) : status === 'completed_conditions' ? (
    <span className="w-[16px] h-[16px] rounded-full bg-[#5a6dd7] flex items-center justify-center shrink-0">
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  ) : status === 'in_progress' ? (
    <span className="w-[16px] h-[16px] rounded-full bg-[#f5a623] flex items-center justify-center shrink-0">
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5" stroke="white" strokeWidth="1.8" fill="none" strokeDasharray="3 2" strokeLinecap="round" strokeDashoffset="4"/>
      </svg>
    </span>
  ) : (
    <span className="w-[16px] h-[16px] rounded-full border-[1.5px] border-[#C4C4C4] bg-white flex items-center justify-center shrink-0">
      <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7" width="10" height="2" rx="1" fill="#C4C4C4"/>
      </svg>
    </span>
  )

  return (
    <div className="relative group/status shrink-0">
      {dot}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#1F2937] text-white text-[11px] rounded-[6px] whitespace-nowrap opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none z-20">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent border-t-[4px] border-t-[#1F2937]" />
      </div>
    </div>
  )
}

/* Department tag badge for checklist items */
const DEPT_TAG_STYLES = {
  FINANCE: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  FRAUD: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  COMPLIANCE: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  SALES: { bg: '#d1fae5', text: '#047857', border: '#6ee7b7' },
  LEGAL: { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' },
}

function DeptTag({ dept }) {
  const style = DEPT_TAG_STYLES[dept] || DEPT_TAG_STYLES.FINANCE
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0" style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      {dept}
    </span>
  )
}

/* Department icon: 32px circle with border, Lucide icon inside */
function DeptIcon({ deptKey }) {
  const IconComponent = DEPT_ICON_MAP[deptKey] || RefreshCw
  return (
    <div className="w-[32px] h-[32px] rounded-full border border-[#dee2e6] flex items-center justify-center shrink-0 bg-white">
      <IconComponent size={16} className="text-[#374151]" />
    </div>
  )
}

/* ─── Checklist Item (Edit mode) - pill shape, expandable ─── */
function ChecklistItemEdit({ label, tag, checked, isOpen, onToggle, onMarkDone, waived, onWaive, addLog }) {
  const [linkValue, setLinkValue] = useState('')
  const [noteValue, setNoteValue] = useState('')
  const [linkSaved, setLinkSaved] = useState(false)
  const hasLink = linkValue.trim().length > 0

  return (
    <div className={`rounded-[8px] transition-all ${
      isOpen ? 'border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-2' : 'border border-[#E5E7EB] bg-white mb-2'
    }`}>
      {/* Header row - pill shape */}
      <div
        className={`flex items-center gap-3 cursor-pointer ${
          isOpen ? 'px-4 pt-4 pb-3' : 'px-4 py-2.5'
        }`}
        onClick={onToggle}
      >
        <div
          className={`w-[20px] h-[20px] rounded-[5px] shrink-0 flex items-center justify-center ${
            waived
              ? 'border-[1.5px] border-[#E5E7EB] bg-[#F3F4F6] cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:opacity-80'
          } ${checked && !waived ? 'bg-[#180047]' : !waived ? 'border-[1.5px] border-[#D1D5DB] bg-white' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (!waived) onMarkDone() }}
        >
          {checked && !waived && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className={`text-[14px] ${checked ? 'text-[#374151]' : 'text-[#1F2937]'}`}>{label}</span>
        {tag && <DeptTag dept={tag} />}
        {waived && (
          <span className="text-[11px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2.5 py-0.5 rounded-full uppercase tracking-wide">EXIMIDO</span>
        )}
        <span className="flex-1" />
        {isOpen
          ? <ChevronUp size={18} className="text-[#374151] shrink-0" />
          : <ChevronDown size={18} className="text-[#9CA3AF] shrink-0" />
        }
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* Document link input */}
          <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-3.5 py-2.5 bg-white focus-within:border-[#5a6dd7] transition-colors">
            <Link2 size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              type="url"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://"
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] placeholder:text-[#9CA3AF] min-w-0"
              onClick={(e) => e.stopPropagation()}
              onBlur={() => {
                if (linkValue.trim() && !linkSaved) {
                  setLinkSaved(true)
                  addLog?.(`Link agregado a '${label}'`)
                }
              }}
            />
          </div>

          {/* Note textarea */}
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="Write a note here"
            rows={3}
            className="w-full border border-[#E5E7EB] rounded-[12px] px-3.5 py-3 text-[13px] bg-white outline-none focus:border-[#5a6dd7] placeholder:text-[#9CA3AF] resize-none"
            onClick={(e) => e.stopPropagation()}
            onBlur={() => {
              if (noteValue.trim()) addLog?.(`Nota agregada a '${label}'`)
            }}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              className="text-[13px] font-semibold text-white bg-[#180047] px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#2a0066] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onMarkDone()
                if (isOpen) onToggle?.()
              }}
            >
              Guardar
            </button>
            {waived ? (
              <button
                className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-white px-5 py-2.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                onClick={(e) => { e.stopPropagation(); onWaive() }}
              >
                <RefreshCw size={14} />
                Deshacer
              </button>
            ) : (
              <button
                className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-white px-5 py-2.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                onClick={(e) => { e.stopPropagation(); onWaive() }}
              >
                <Ban size={14} />
                Eximir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Checklist Item (View mode) - pill shape, grayed out ─── */
function ChecklistItemView({ label, tag, checked, waived }) {
  return (
    <div className="flex items-center gap-3 border border-[#E5E7EB] rounded-[8px] px-4 py-2.5 mb-2 bg-white">
      <div className={`w-[20px] h-[20px] rounded-[5px] shrink-0 flex items-center justify-center ${
        checked ? 'bg-[#180047]' : 'border-[1.5px] border-[#E5E7EB] bg-[#F9FAFB]'
      }`}>
        {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className={`text-[14px] ${checked ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>{label}</span>
      {tag && <DeptTag dept={tag} />}
      {waived && (
        <span className="text-[11px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2.5 py-0.5 rounded-full uppercase tracking-wide">EXIMIDO</span>
      )}
      <span className="flex-1" />
      <ChevronDown size={18} className="text-[#D1D5DB] shrink-0" />
    </div>
  )
}

/* ─── Info Field (View mode) - label + value stacked ─── */
function InfoField({ label, value, info, tooltip }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[12px] text-[#374151] font-medium">{label}</span>
        {info && (
          <span className="relative group/ifo shrink-0">
            <Info size={12} className="text-[#D1D5DB] cursor-pointer" />
            {tooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] w-[260px] whitespace-normal leading-relaxed opacity-0 group-hover/ifo:opacity-100 transition-opacity pointer-events-none z-20">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center h-[28px] text-[13px] text-[#0A0B0D] font-medium">
        {value ? value : <EmptyBadge />}
      </div>
    </div>
  )
}

/* ─── Si/No pill badge for view mode ─── */
function SiNoPill({ value }) {
  if (!value) return <EmptyBadge />
  const isSi = value.toLowerCase() === 'si' || value.toLowerCase() === 'sí'
  return (
    <span className={`inline-flex items-center justify-center min-w-[36px] h-[22px] px-2.5 rounded-full text-[12px] font-medium leading-none ${
      isSi ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#F3F4F6] text-[#374151]'
    }`}>
      {isSi ? 'Si' : 'No'}
    </span>
  )
}

/* ─── InfoField for Si/No values (shows pill instead of text) ─── */
function InfoFieldSiNo({ label, value, info, tooltip }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[12px] text-[#374151] font-medium">{label}</span>
        {info && (
          <span className="relative group/ifo shrink-0">
            <Info size={12} className="text-[#D1D5DB] cursor-pointer" />
            {tooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] w-[260px] whitespace-normal leading-relaxed opacity-0 group-hover/ifo:opacity-100 transition-opacity pointer-events-none z-20">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center h-[28px]">
        <SiNoPill value={value} />
      </div>
    </div>
  )
}

/* ─── Tag pills for view mode (countries, etc.) ─── */
function TagPills({ label, values = [] }) {
  return (
    <div className="min-w-0">
      <span className="text-[12px] text-[#374151] font-medium block mb-1">{label}</span>
      <div className="flex items-center h-[28px] gap-1 flex-wrap">
        {values.length > 0 ? values.map((v, i) => (
          <span key={i} className="inline-flex items-center text-[12px] text-[#0A0B0D] font-medium bg-[#F3F4F6] px-2.5 py-0.5 rounded-full">
            {v}
          </span>
        )) : <EmptyBadge />}
      </div>
    </div>
  )
}

/* ─── Empty placeholder badge (when no info) ─── */
/* ─── PDF file icon ─── */
function DocMenuButton({ onDelete, onRequestSales, onAttach }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  return (
    <div className="relative shrink-0" ref={btnRef}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev) }} className="w-[28px] h-[28px] rounded-full border border-[#180047] flex items-center justify-center bg-white cursor-pointer hover:bg-[#F9FAFB]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#180047"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1.5 z-30 min-w-[180px]">
            {onAttach && (
              <button onClick={() => { setOpen(false); onAttach() }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-[#1F2937] bg-transparent border-none cursor-pointer hover:bg-[#F9FAFB] text-left">
                <Plus size={14} className="text-[#374151]" /> Agregar nuevo doc
              </button>
            )}
            <button onClick={() => { setOpen(false); onRequestSales?.() }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-[#1F2937] bg-transparent border-none cursor-pointer hover:bg-[#F9FAFB] text-left">
              <ArrowUpRight size={14} className="text-[#374151]" /> Solicitar a sales
            </button>
            {onDelete && (
              <button onClick={() => { setOpen(false); onDelete() }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-[#DC2626] bg-transparent border-none cursor-pointer hover:bg-[#FEF2F2] text-left">
                <Trash2 size={14} className="text-[#DC2626]" /> Eliminar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function PdfFileIcon() {
  return (
    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FEE2E2] flex items-center justify-center shrink-0">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
        <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
        <path d="M17 18h2" />
        <path d="M20 15h-3v6" />
        <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1" />
      </svg>
    </div>
  )
}

function EmptyBadge() {
  return (
    <span className="inline-flex items-center justify-center min-w-[44px] h-[22px] px-2 rounded-full bg-[#E5E7EB] text-[#9CA3AF] text-[12px] font-medium leading-none">
      —
    </span>
  )
}

/* ─── Radio group (Edit mode) ─── */
function RadioField({ label, info, tooltip }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[12px] text-[#374151] font-medium">{label}</span>
        {info && (
          <span className="relative group/rfo shrink-0">
            <Info size={12} className="text-[#D1D5DB] cursor-pointer" />
            {tooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/rfo:opacity-100 transition-opacity pointer-events-none z-20">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 h-[28px]">
        <label className="flex items-center gap-1.5 text-[12px] text-[#374151] cursor-pointer">
          <input type="radio" name={label} className="accent-[#180047] w-[14px] h-[14px]" /> Si
        </label>
        <label className="flex items-center gap-1.5 text-[12px] text-[#374151] cursor-pointer">
          <input type="radio" name={label} className="accent-[#180047] w-[14px] h-[14px]" /> No
        </label>
      </div>
    </div>
  )
}

/* ─── Text Input (Edit mode) ─── */
function TextInput({ label, placeholder, info, tooltip }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[12px] text-[#374151] font-medium">{label}</span>
        {info && (
          <span className="relative group/ti shrink-0">
            <Info size={12} className="text-[#D1D5DB] cursor-pointer" />
            {tooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/ti:opacity-100 transition-opacity pointer-events-none z-20">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            )}
          </span>
        )}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]"
      />
    </div>
  )
}

/* ─── Activity Panel (real log) ─── */
function formatNow() {
  const d = new Date()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function ActivityPanel({ logs }) {
  const activityIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a6dd7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <img src="/empty-activity.svg" alt="No activity" className="w-full max-w-[200px]" />
        <p className="text-[14px] font-semibold text-[#0A0B0D] mt-4">Aún no se registró actividad</p>
        <p className="text-[13px] text-[#9CA3AF] mt-1">Las acciones que realices aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="max-h-[500px] overflow-y-auto">
      {logs.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 py-2.5 relative">
          {i < logs.length - 1 && (
            <div className="absolute left-[11px] top-[30px] bottom-0 w-[2px] bg-[#5a6dd7]" />
          )}
          <span className="w-[22px] h-[22px] rounded-full bg-[#5a6dd7] flex items-center justify-center shrink-0 z-10">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[13px] text-[#1F2937] font-medium leading-snug">{item.text}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.user} · {item.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Status Dropdown (standalone) ─── */
const STATUS_OPTIONS = [
  { value: 'not_started', label: 'No iniciado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'completed_conditions', label: 'Completado con condiciones', separator: true },
]

function StatusDropdown({ deptStatus, onStatusChange, disabled }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const current = STATUS_OPTIONS.find(o => o.value === deptStatus) || STATUS_OPTIONS[0]

  const borderColor = disabled ? '#D1D5DB' : '#5a6dd7'
  const textColor = disabled ? '#9CA3AF' : '#5a6dd7'

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
        className={`text-[13px] font-medium h-[34px] inline-flex items-center gap-1.5 px-4 rounded-full border transition-colors ${
          disabled ? 'cursor-default' : 'cursor-pointer'
        }`}
        style={{ borderColor, color: textColor }}
      >
        {current.label} <ChevronDown size={12} />
      </button>

      {dropdownOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1 z-30 min-w-[240px]">
            {STATUS_OPTIONS.map((opt, idx) => (
              <div key={opt.value}>
                {opt.separator && idx > 0 && <div className="border-t border-[#E5E7EB] my-1" />}
                <button
                  onClick={() => {
                    onStatusChange(opt.value)
                    setDropdownOpen(false)
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 text-[14px] text-[#1F2937] bg-transparent border-none cursor-pointer hover:bg-[#F9FAFB] text-left"
                >
                  {opt.label}
                  {deptStatus === opt.value && (
                    <svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Conditions Modal (Aprobado con condiciones) ─── */
function ConditionsModal({ initialConditions = [], onCancel, onConfirm }) {
  const [conditions, setConditions] = useState(initialConditions.length ? initialConditions : [])
  const [draft, setDraft] = useState('')
  const canConfirm = conditions.length > 0 || draft.trim().length > 0

  const handleAdd = () => {
    const v = draft.trim()
    if (!v) return
    setConditions(prev => [...prev, v])
    setDraft('')
  }
  const handleRemove = (i) => setConditions(prev => prev.filter((_, idx) => idx !== i))
  const handleConfirm = () => {
    if (!canConfirm) return
    const final = draft.trim() ? [...conditions, draft.trim()] : conditions
    onConfirm(final)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[16px] w-[560px] max-w-[90vw] shadow-xl p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[18px] font-semibold text-[#0A0B0D] m-0">Aprobado con condiciones</h3>
          <button onClick={onCancel} className="text-[#9CA3AF] hover:text-[#374151] bg-transparent border-none cursor-pointer"><X size={18} /></button>
        </div>
        <p className="text-[13px] text-[#374151] leading-relaxed mb-5">
          Listá las condiciones que el cliente debe cumplir para avanzar. Este campo es obligatorio.*
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {conditions.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                readOnly
                value={c}
                className="flex-1 border border-[#D1D5DB] rounded-full px-4 h-[40px] text-[13px] text-[#0A0B0D] outline-none bg-white"
              />
              <button
                onClick={() => handleRemove(i)}
                className="w-[40px] h-[40px] rounded-[8px] bg-[#F3F4F6] text-[#9CA3AF] border-none cursor-pointer hover:bg-[#E5E7EB] flex items-center justify-center shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
              placeholder="Agregar condición"
              className="flex-1 border border-[#D1D5DB] rounded-full px-4 h-[40px] text-[13px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]"
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#180047] bg-white px-4 h-[40px] rounded-full border border-[#180047] cursor-pointer hover:bg-[#F3F0FF] whitespace-nowrap shrink-0"
            >
              Agregar <Plus size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="text-[13px] font-medium text-[#374151] bg-white px-5 py-2 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB]">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`text-[13px] font-medium text-white px-5 py-2 rounded-full border-none transition-colors ${
              canConfirm ? 'bg-[#180047] cursor-pointer hover:bg-[#2a0066]' : 'bg-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Request Document to Sales Modal ─── */
function RequestToSalesModal({ documentName = '', onCancel, onSend }) {
  const [doc, setDoc] = useState(documentName)
  const [message, setMessage] = useState('')
  const [channels, setChannels] = useState(new Set(['slack']))
  const [sent, setSent] = useState(false)
  const canSend = doc.trim().length > 0 && message.trim().length > 0

  const toggleChannel = (ch) => {
    setChannels(prev => {
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch); else next.add(ch)
      return next
    })
  }

  const handleSend = () => {
    if (!canSend) return
    onSend({ document: doc.trim(), message: message.trim(), channels: Array.from(channels) })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-[16px] w-[620px] max-w-[90vw] shadow-xl p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-[#0A0B0D] m-0 leading-tight">Solicitar documento a Sales</h3>
            <button onClick={onCancel} className="text-[#9CA3AF] hover:text-[#374151] bg-transparent border-none cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <img src="/link-success.svg" alt="Success" className="w-[120px] h-[120px]" />
            <p className="text-[16px] font-medium text-[#0A0B0D] m-0">La solicitud fue enviada con éxito</p>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={onCancel}
              className="text-[14px] font-normal text-[#212529] bg-white px-5 h-[36px] rounded-full border border-[#dee2e6] cursor-pointer hover:bg-[#F9FAFB]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[16px] w-[620px] max-w-[90vw] shadow-xl p-5 flex flex-col gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[20px] font-semibold text-[#0A0B0D] m-0 leading-tight">Solicitar documento a Sales</h3>
            <button onClick={onCancel} className="text-[#9CA3AF] hover:text-[#374151] bg-transparent border-none cursor-pointer"><X size={18} /></button>
          </div>
          <p className="text-[14px] text-[#868e96] leading-[20px] m-0">
            Sales recibirá una notificación y quedará registrado en el Activity del cliente.
          </p>
        </div>

        <div>
          <label className="flex items-center text-[16px] font-semibold text-[#0A0B0D] mb-1">
            Documento requerido <span className="text-[#fa5252] ml-0.5">*</span>
          </label>
          <input
            value={doc}
            onChange={e => setDoc(e.target.value)}
            className="w-full border border-[#dee2e6] rounded-[4px] px-4 py-2 text-[14px] text-[#0A0B0D] outline-none focus:border-[#180047] bg-white"
          />
        </div>

        <div>
          <label className="flex items-center text-[16px] font-semibold text-[#0A0B0D] mb-1">
            Mensaje <span className="text-[#fa5252] ml-0.5">*</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Escribí un mensaje..."
            className="w-full border border-[#dee2e6] rounded-[4px] px-4 py-2 text-[14px] text-[#0A0B0D] outline-none focus:border-[#180047] bg-white resize-none placeholder:text-[#adb5bd]"
          />
        </div>

        <div>
          <p className="text-[14px] font-semibold text-[#0A0B0D] m-0 mb-2">Notificar por</p>
          <div className="flex items-center gap-2">
            {['slack', 'email'].map(ch => {
              const isOn = channels.has(ch)
              return (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`flex items-center gap-2 text-[14px] px-4 h-[28px] rounded-full cursor-pointer transition-colors ${
                    isOn
                      ? 'bg-[#e6e4ec] text-[#180047] border-none'
                      : 'bg-white text-[#212529] border border-[#dee2e6]'
                  }`}
                >
                  {isOn && <Check size={14} />}
                  {ch === 'slack' ? 'Slack' : 'Email'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-[14px] font-normal text-[#212529] bg-white px-4 h-[32px] rounded-full border border-[#dee2e6] cursor-pointer hover:bg-[#F9FAFB]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`text-[14px] font-normal text-white px-4 h-[32px] rounded-full border-none ${
              canSend ? 'bg-[#180047] cursor-pointer hover:bg-[#2a0066]' : 'bg-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Conditions Banner (shown when dept is Completado con condiciones) ─── */
function ConditionsBanner({ title = 'Aprobado con condiciones', conditions = [] }) {
  if (!conditions || conditions.length === 0) return null
  return (
    <div className="p-4 rounded-[10px] bg-[#EDF0FF]">
      <p className="text-[14px] font-semibold text-[#0A0B0D] m-0 mb-2">{title}</p>
      <ul className="list-disc pl-5 text-[13px] text-[#1F2937] m-0 leading-relaxed">
        {conditions.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </div>
  )
}

/* ─── Generic Section Card (checkbox + title + form fields + link/note + buttons) ─── */
function SectionCard({
  title, subtitle, info, tooltip, tag,
  checked, waived,
  isOpen, onToggle,
  onMarkDone, onWaive,
  editable,
  children,
  addLog,
  onRequestSales,
  requestedToSales,
  hideLinkNote,
  headerBadge,
}) {
  const [linkValue, setLinkValue] = useState('')
  const [noteValue, setNoteValue] = useState('')

  return (
    <div className={`rounded-[10px] border border-[#E5E7EB] bg-white mb-3 ${isOpen ? 'shadow-[0_1px_4px_rgba(0,0,0,0.06)]' : ''}`}>
      <div
        className={`flex items-center gap-3 cursor-pointer ${isOpen ? 'px-4 pt-4 pb-2' : 'px-4 py-3'}`}
        onClick={() => onToggle?.()}
      >
        <div
          className={`w-[18px] h-[18px] rounded-[4px] shrink-0 flex items-center justify-center ${
            waived
              ? 'border-[1.5px] border-[#E5E7EB] bg-[#F3F4F6] cursor-not-allowed opacity-50'
              : editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
          } ${checked && !waived ? 'bg-[#180047]' : !waived ? 'border-[1.5px] border-[#D1D5DB] bg-white' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (editable && !waived) onMarkDone?.() }}
        >
          {checked && !waived && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className={`text-[14px] font-medium ${checked ? 'text-[#374151]' : 'text-[#0A0B0D]'}`}>{title}</span>
        {info && (
          <span className="relative group/sci shrink-0" onClick={e => e.stopPropagation()}>
            <Info size={14} className="text-[#9CA3AF] cursor-pointer" />
            {tooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/sci:opacity-100 transition-opacity pointer-events-none z-20">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            )}
          </span>
        )}
        {tag && <DeptTag dept={tag} />}
        {headerBadge && <LegalStatusBadge badge={headerBadge} />}
        {waived && (
          <span className="text-[10px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2 py-0.5 rounded-full uppercase tracking-wide">EXIMIDO</span>
        )}
        {requestedToSales && (
          <span className="text-[10px] font-semibold text-[#dc6038] bg-[#FFE9D9] px-2 py-0.5 rounded-full uppercase tracking-wide">SOLICITADO A SALES</span>
        )}
        <span className="flex-1" />
        {isOpen
          ? <ChevronUp size={18} className="text-[#374151] shrink-0" />
          : <ChevronDown size={18} className="text-[#9CA3AF] shrink-0" />
        }
      </div>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-4">
          {subtitle && <p className="text-[12px] text-[#6B7280] leading-relaxed -mt-1">{subtitle}</p>}

          {children}

          {!hideLinkNote && (
            <>
              <hr className="border-t border-[#E5E7EB] m-0 mt-2" />
              <div className="flex flex-col gap-4 mt-1">
                <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-4 py-3 bg-white focus-within:border-[#5a6dd7] transition-colors">
                  <Link2 size={16} className="text-[#9CA3AF] shrink-0" />
                  <input
                    type="url"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    placeholder="Add document link"
                    disabled={!editable}
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#374151] placeholder:text-[#9CA3AF] min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Write a note here"
                  rows={5}
                  disabled={!editable}
                  className="w-full border border-[#E5E7EB] rounded-[12px] px-4 py-3 text-[14px] bg-white outline-none focus:border-[#5a6dd7] placeholder:text-[#9CA3AF] resize-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </>
          )}

          {editable && (
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#180047] px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#2a0066] transition-colors"
                onClick={(e) => { e.stopPropagation(); onMarkDone?.(); onToggle?.() }}
              >
                <Check size={14} strokeWidth={2.5} /> Guardar
              </button>
              {waived ? (
                <button
                  className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-white px-5 py-2.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB]"
                  onClick={(e) => { e.stopPropagation(); onWaive?.() }}
                >
                  <RefreshCw size={14} /> Deshacer
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-[#E6E4EC] px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#d9d6e2]"
                  onClick={(e) => { e.stopPropagation(); onWaive?.() }}
                >
                  <Ban size={14} /> Eximir
                </button>
              )}
              {onRequestSales && (
                <>
                  <span className="flex-1" />
                  <button
                    className="flex items-center gap-1 text-[13px] font-medium text-[#180047] bg-transparent border-none cursor-pointer hover:text-[#2a0066]"
                    onClick={(e) => { e.stopPropagation(); onRequestSales(title) }}
                  >
                    Solicitar a sales <ArrowUpRight size={13} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── COMPLIANCE CONTENT ─── */
const COMPLIANCE_STEPS = [
  {
    title: 'KYB: Revisión documental',
    subItems: [
      { label: 'Estatutos y modificaciones', pdfName: 'Estatutos y modificaciones.pdf', pdfSize: '2.4 MB' },
      { label: 'Certificado de existencia y representación', pdfName: 'Certificado de existencia y representación.pdf', pdfSize: '1.1 MB' },
      { label: 'Regularidad fiscal y laboral', pdfName: 'Regularidad fiscal y laboral.pdf', pdfSize: '890 KB' },
      { label: 'Licencias operativas', pdfName: 'Licencias operativas.pdf', pdfSize: '3.2 MB' },
      { label: 'Estados financieros auditados', pdfName: 'Estados financieros auditados.pdf', pdfSize: '2.4 MB' },
    ],
  },
  {
    title: 'Estructura societaria y UBO',
    subItems: [
      { label: 'Organigrama completo', pdfName: 'Organigrama completo.pdf', pdfSize: '1.8 MB' },
      { label: 'UBOs identificados', pdfName: 'UBOs identificados.pdf', pdfSize: '760 KB' },
      { label: 'Estructuras complejas documentadas (offshore, trusts, camadas)', pdfName: 'Estructuras complejas documentadas (offshore, trusts, camadas).pdf', pdfSize: '2.1 MB' },
      { label: 'Documentos societarios adjuntos', pdfName: 'Documentos societarios adjuntos.pdf', pdfSize: '4.5 MB' },
    ],
  },
  {
    title: 'KYC de representantes y firmantes',
    special: 'kyc_firmantes',
  },
  {
    title: 'Screening en listas restrictivas',
    subItems: [
      { label: 'Empresa verificada' },
      { label: 'Representante legal verificado' },
      { label: 'UBOs verificados' },
    ],
  },
  {
    title: 'Evaluación del negocio',
    subItems: [
      { label: 'Revisión sitio web con Ballerine', isLink: true },
      { label: 'MCC contrastado' },
      { label: 'Actividades prohibidas' },
    ],
  },
  {
    title: 'Perfil de riesgo',
    special: 'risk_profile',
  },
  {
    title: 'Programa de compliance',
    badge: 'SOLO PAYFAC / PSP / FINTECH',
    showStepComment: true,
    subItems: [
      { label: 'Políticas AML/KYC revisadas' },
      { label: 'Estructura interna de compliance revisada' },
      { label: 'Histórico regulatorio revisado' },
    ],
  },
  {
    title: 'Final decision',
    special: 'final_decision',
  },
  {
    title: 'Inscripción en franquicias',
    badge: 'POST GO-LIVE',
    special: 'franchise_signup',
  },
  {
    title: 'Próxima revisión',
    special: 'compliance_proxima_revision',
  },
]

const COMPLIANCE_CHECKLIST = COMPLIANCE_STEPS.map(s => ({ label: s.title }))

/* ─── Compliance Sub-item (non-collapsible) ─── */
function ComplianceSubItem({ label, pdfName, pdfSize, isLink, checked, waived, onMarkDone, onWaive, editable, onRequestSales, requestedToSales, showViewComment, defaultComment }) {
  const [noteValue, setNoteValue] = useState(defaultComment || '')
  const [linkValue, setLinkValue] = useState('')
  const [extraDocs, setExtraDocs] = useState([])
  const fileInputRef = useRef(null)

  const handleAttachDoc = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setExtraDocs(prev => [...prev, { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }])
    }
    e.target.value = ''
  }

  // Checkbox-only items (step 5 non-link sub-items)
  const isCheckboxOnly = !pdfName && !isLink && !editable

  const [menuOpen, setMenuOpen] = useState(false)
  const mockComments = editable ? (pdfName ? [
    { text: 'Este es un comentario hecho por Agustina Romagnoli', time: '1 min ago' },
  ] : []) : (showViewComment ? [
    { text: 'Este es un comentario hecho por Agustina Romagnoli', time: '1 min ago' },
  ] : [])

  return (
    <div className={`group/sub relative ${pdfName ? 'border-b border-[#DEE2E6] pb-3 -mx-[46px] px-[46px]' : ''}`}>
      {/* Header row: checkbox + label + badges + three-dot menu */}
      <div className={`flex items-center gap-3 py-[6px] ${pdfName ? 'bg-[#F8F9FA] border-y border-[#DEE2E6] -mx-[46px] px-[46px]' : ''}`}>
        <div
          className={`w-[18px] h-[18px] rounded-[4px] shrink-0 flex items-center justify-center ${
            !editable
              ? 'border-[1.5px] border-[#E5E7EB] bg-[#F3F4F6] cursor-default'
              : waived
                ? 'border-[1.5px] border-[#E5E7EB] bg-[#F3F4F6] cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:opacity-80'
          } ${checked && !waived && editable ? 'bg-[#180047]' : !editable ? '' : !waived ? 'border-[1.5px] border-[#D1D5DB] bg-white' : ''}`}
          onClick={() => { if (editable && !waived) onMarkDone() }}
        >
          {checked && !waived && editable && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className={`text-[13px] flex-1 ${!editable ? 'text-[#9CA3AF]' : checked ? 'text-[#374151]' : 'text-[#1F2937]'}`}>{label}</span>
        {waived && (
          <span className="text-[10px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2 py-0.5 rounded-full uppercase tracking-wide">EXIMIDO</span>
        )}
        {requestedToSales && (
          <span className="text-[10px] font-semibold text-[#dc6038] bg-[#FFE9D9] px-2 py-0.5 rounded-full uppercase tracking-wide">SOLICITADO A SALES</span>
        )}
        {editable && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="opacity-0 group-hover/sub:opacity-100 text-[#9CA3AF] bg-transparent border-none cursor-pointer hover:text-[#374151] transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1.5 z-30 min-w-[180px]">
                  <button onClick={() => { setMenuOpen(false); fileInputRef.current?.click() }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-[#1F2937] bg-transparent border-none cursor-pointer hover:bg-[#F9FAFB] text-left">
                    <FileText size={14} className="text-[#9CA3AF]" /> Adjuntar documento
                  </button>
                  <button onClick={() => { setMenuOpen(false); onRequestSales?.(label) }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-[#1F2937] bg-transparent border-none cursor-pointer hover:bg-[#F9FAFB] text-left">
                    <ArrowUpRight size={14} className="text-[#9CA3AF]" /> Solicitar a sales
                  </button>
                  <button onClick={() => { setMenuOpen(false); onWaive() }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-[#1F2937] bg-transparent border-none cursor-pointer hover:bg-[#F9FAFB] text-left">
                    <Ban size={14} className="text-[#9CA3AF]" /> Eximir
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input for attaching docs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleAttachDoc} />

      {/* PDF preview row */}
      {pdfName && (
        <div className={`flex items-center gap-3 py-3 ${!showViewComment && !editable ? '' : 'border-b border-[#DEE2E6] -mx-[46px] px-[46px]'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-[#0A0B0D] font-medium truncate m-0">Documento_{(pdfName || label).replace(/\.pdf$/i, '').replace(/\s+/g, ' ')}</p>
            <p className="text-[11px] text-[#9CA3AF] m-0">{pdfSize}</p>
          </div>
          <button className="flex items-center gap-1 text-[12px] font-medium text-[#180047] bg-white px-3 py-1 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">
            Abrir <ExternalLink size={12} />
          </button>
          {editable && <DocMenuButton onAttach={() => fileInputRef.current?.click()} onDelete={() => {}} />}
        </div>
      )}

      {/* Extra attached docs */}
      {extraDocs.map((doc, i) => (
        <div key={i} className={`flex items-center gap-3 py-3 -mx-[46px] px-[46px] ${i > 0 ? 'border-t border-[#DEE2E6]' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-[#0A0B0D] font-medium truncate m-0">{doc.name}</p>
            <p className="text-[11px] text-[#9CA3AF] m-0">{doc.size}</p>
          </div>
          <button className="flex items-center gap-1 text-[12px] font-medium text-[#180047] bg-white px-3 py-1 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">
            Abrir <ExternalLink size={12} />
          </button>
          <DocMenuButton onDelete={() => setExtraDocs(prev => prev.filter((_, idx) => idx !== i))} onAttach={() => fileInputRef.current?.click()} />
        </div>
      ))}

      {/* Link input row (for step 5 first sub-item) */}
      {isLink && (
        <div className="pb-2">
          <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-3.5 py-2 bg-white focus-within:border-[#5a6dd7] transition-colors">
            <Link2 size={14} className="text-[#9CA3AF] shrink-0" />
            <input type="url" value={linkValue} onChange={(e) => setLinkValue(e.target.value)} placeholder="Agregar link" disabled={!editable}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] placeholder:text-[#9CA3AF] min-w-0 disabled:cursor-default" />
          </div>
        </div>
      )}

      {/* Comments + input */}
      {(pdfName || isLink || showViewComment) && (mockComments.length > 0 || editable) && (
        <div className="flex flex-col gap-4 pt-3">
          {/* Existing comments */}
          {mockComments.map((c, i) => (
            <div key={i}>
              {i > 0 && <hr className="border-t border-[#DEE2E6] m-0 mb-2 -mx-[46px]" />}
              <div className="flex items-start gap-2">
                <div className="w-[20px] h-[20px] rounded-full bg-[#6EE7B7] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[8px] font-bold text-white">AR</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-[#0A0B0D]">Agustina Romagnoli</span>
                    <span className="text-[12px] text-[#9CA3AF]">{c.time}</span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] m-0 mt-0.5">{c.text}</p>
                </div>
              </div>
            </div>
          ))}
          {/* Comment input */}
          {editable && (
            <>
              <hr className="border-t border-[#DEE2E6] m-0 -mx-[46px]" />
              <textarea
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Dejar un comentario..."
                rows={2}
                className="w-full border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#5a6dd7] placeholder:text-[#9CA3AF] resize-none"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Compliance Step (outer collapsible card) ─── */
function ComplianceStepCard({ step, stepIdx, isOpen, onToggle, subChecked, onSubCheck, subWaived, onSubWaive, onToggleAllSubs, onRequestSales, salesRequested, addLog, editable }) {
  // Auto-check main when all sub-items are checked or eximidos
  const totalSubs = step.subItems?.length || 0
  const completedSubs = totalSubs
    ? step.subItems.filter((_, j) => subChecked.has(j) || subWaived.has(j)).length
    : 0
  const [localChecked, setLocalChecked] = useState(false)
  const checked = totalSubs > 0 ? completedSubs === totalSubs : localChecked
  return (
    <div className="border border-[#E5E7EB] rounded-[10px] bg-white overflow-x-hidden">
      <div
        className={`flex items-center gap-3 cursor-pointer ${isOpen ? 'px-4 pt-4 pb-3' : 'px-4 py-3'}`}
        onClick={onToggle}
      >
        {editable && <div
          className={`w-[20px] h-[20px] rounded-[5px] shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 ${checked ? 'bg-[#180047]' : 'border-[1.5px] border-[#D1D5DB] bg-white'}`}
          onClick={(e) => {
            e.stopPropagation()
            if (totalSubs > 0 && onToggleAllSubs) onToggleAllSubs(!checked)
            else setLocalChecked(prev => !prev)
          }}
        >
          {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>}
        {/* Green numbered circle */}
        <div className="w-[20px] h-[20px] rounded-full bg-[#F2EDF9] shrink-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#180047] leading-none">{stepIdx + 1}</span>
        </div>
        <span className="text-[14px] font-medium text-[#0A0B0D]">{step.title}</span>
        {step.badge && (
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
            step.badge === 'BLOQUEADO' ? 'text-[#DC2626] bg-[#FEE2E2]' : 'text-[#1E40AF] bg-[#DBEAFE]'
          }`}>{step.badge}</span>
        )}
        <span className="flex-1" />
        {isOpen
          ? <ChevronUp size={18} className="text-[#374151] shrink-0" />
          : <ChevronDown size={18} className="text-[#9CA3AF] shrink-0" />
        }
      </div>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col pl-[46px]">
          {step.subtitle && <p className="text-[12px] text-[#6B7280] italic -mt-1 mb-1">{step.subtitle}</p>}

          {step.subItems && step.subItems.map((sub, j) => (
            <ComplianceSubItem
              key={j}
              label={sub.label}
              pdfName={sub.pdfName}
              pdfSize={sub.pdfSize}
              isLink={sub.isLink}
              checked={subChecked.has(j)}
              waived={subWaived.has(j)}
              onMarkDone={() => onSubCheck(j)}
              onWaive={() => onSubWaive(j)}
              addLog={addLog}
              editable={editable}
              onRequestSales={onRequestSales ? (label) => onRequestSales(stepIdx, j, label) : undefined}
              requestedToSales={salesRequested?.has?.(`${stepIdx}.${j}`)}
              showViewComment={!editable && stepIdx === 0 && j === 0}
              defaultComment={(stepIdx === 0 && j === 0) ? 'Este es un comentario hecho por Agustina Romagnoli' : ''}
            />
          ))}

          {step.special === 'kyc_firmantes' && <KycFirmantesFields editable={editable} />}
          {step.special === 'risk_profile' && <RiskProfileFields editable={editable} />}
          {step.special === 'final_decision' && <FinalDecisionFields editable={editable} />}
          {step.special === 'franchise_signup' && <FranchiseSignupFields editable={editable} />}
          {step.special === 'compliance_proxima_revision' && <ComplianceProximaRevisionFields editable={editable} />}

          {step.note && (
            <p className="text-[12px] text-[#6B7280] italic mt-1">{step.note}</p>
          )}

          {step.showStepComment && editable && (
            <div className="mt-2">
              <textarea
                placeholder="Dejar un comentario..."
                rows={2}
                className="w-full border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#5a6dd7] placeholder:text-[#9CA3AF] resize-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KycDocCard({ label, pdfSize }) {
  return (
    <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-[8px] px-3 py-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-[#0A0B0D] font-medium m-0">{label}</p>
        {pdfSize && <p className="text-[10px] text-[#9CA3AF] m-0">{pdfSize}</p>}
      </div>
      <button className="flex items-center gap-1 text-[11px] font-medium text-[#180047] bg-white px-2.5 py-0.5 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">
        Abrir <ExternalLink size={10} />
      </button>
      <DocMenuButton onDelete={() => {}} />
    </div>
  )
}

function KycFirmantesFields({ editable }) {
  const [noteValue, setNoteValue] = useState('')
  return (
    <div className="flex flex-col gap-4">
      {/* Organigrama completo checkbox */}
      <div className="flex items-center gap-3 py-1">
        {editable && <div className="w-[18px] h-[18px] rounded-[4px] shrink-0 flex items-center justify-center border-[1.5px] border-[#D1D5DB] bg-white cursor-pointer hover:opacity-80" />}
        <span className="text-[13px] text-[#1F2937]">Organigrama completo</span>
      </div>

      {/* Person 1 */}
      <div>
        <p className="text-[13px] text-[#0A0B0D] m-0 mb-2">
          <span className="font-semibold">Alan Juárex</span>
          <span className="text-[#9CA3AF] font-normal"> · Representante legal</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <KycDocCard label="ID frente" pdfSize="2.4 MB" />
          <KycDocCard label="ID dorso" pdfSize="2.4 MB" />
        </div>
      </div>

      {/* Person 2 */}
      <div>
        <p className="text-[13px] text-[#0A0B0D] m-0 mb-2">
          <span className="font-semibold">María López</span>
          <span className="text-[#9CA3AF] font-normal"> · Firmante</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <KycDocCard label="ID frente" pdfSize="2.4 MB" />
          <KycDocCard label="ID frente" pdfSize="2.4 MB" />
        </div>
      </div>

      {/* Comment */}
      <div className="flex items-start gap-2">
        <div className="w-[20px] h-[20px] rounded-full bg-[#6EE7B7] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[8px] font-bold text-white">AR</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-[#0A0B0D]">Agustina Romagnoli</span>
            <span className="text-[12px] text-[#9CA3AF]">1 min ago</span>
          </div>
          <p className="text-[13px] text-[#6B7280] m-0 mt-0.5">Este es un comentario hecho por Agustina Romagnoli</p>
        </div>
      </div>

      {/* Comment input */}
      {editable && (
        <>
        <hr className="border-t border-[#DEE2E6] m-0 -mx-[46px]" />
        <textarea
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          placeholder="Dejar un comentario..."
          rows={2}
          className="w-full border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#5a6dd7] placeholder:text-[#9CA3AF] resize-none"
        />
        </>
      )}
    </div>
  )
}

function RiskProfileFields({ editable }) {
  const [riskLevel, setRiskLevel] = useState('')
  const [comment, setComment] = useState('')
  const RISK_LEVELS = ['Alto', 'Medio', 'Bajo']
  return (
    <div className="flex flex-col gap-3 mt-2">
      <div>
        <span className="text-[12px] text-[#374151] font-medium block mb-2">Clasificación de riesgo</span>
        <div className="flex gap-2">
          {riskLevel && !editable ? (
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#180047] bg-[#E6E4EC] px-4 py-1.5 rounded-full">
              <Check size={12} /> {riskLevel}
            </span>
          ) : (
            RISK_LEVELS.map(level => {
              const isSelected = riskLevel === level
              return (
                <button
                  key={level}
                  disabled={!editable}
                  onClick={() => editable && setRiskLevel(prev => prev === level ? '' : level)}
                  className={`flex items-center gap-1.5 text-[13px] font-medium px-4 py-1.5 rounded-full border transition-colors cursor-pointer disabled:cursor-default ${
                    isSelected
                      ? 'bg-[#E6E4EC] text-[#180047] border-[#E6E4EC]'
                      : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  {level}
                </button>
              )
            })
          )}
        </div>
      </div>
      <hr className="border-t border-[#DEE2E6] m-0 -mx-[46px]" />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Dejar un comentario..."
        rows={2}
        disabled={!editable}
        className="w-full border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#374151] outline-none focus:border-[#5a6dd7] bg-white resize-none placeholder:text-[#9CA3AF] disabled:cursor-default disabled:bg-[#F9FAFB]"
      />
    </div>
  )
}

function FinalDecisionFields({ editable }) {
  const [decision, setDecision] = useState('')
  const [responsible, setResponsible] = useState('')
  const [nextReview, setNextReview] = useState('')
  return (
    <div className="grid grid-cols-3 gap-x-6">
      <div>
        <span className="text-[12px] text-[#374151] font-medium block mb-1">Decisión</span>
        {editable ? (
          <select value={decision} onChange={e => setDecision(e.target.value)} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[34px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option value="">Seleccionar</option>
            <option>Aprobado</option>
            <option>Aprobado con condiciones</option>
            <option>Reprobado</option>
          </select>
        ) : (
          <InfoField label="" value={decision} />
        )}
      </div>
      <div>
        <span className="text-[12px] text-[#374151] font-medium block mb-1">Responsable</span>
        {editable ? (
          <input type="text" value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Nombre" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[34px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        ) : (
          <InfoField label="" value={responsible} />
        )}
      </div>
      <div>
        <span className="text-[12px] text-[#374151] font-medium block mb-1">Fecha de próxima revisión</span>
        {editable ? (
          <input type="text" value={nextReview} onChange={e => setNextReview(e.target.value)} placeholder="DD/MM/AAAA" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[34px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        ) : (
          <InfoField label="" value={nextReview} />
        )}
      </div>
    </div>
  )
}

function FranchiseSignupFields({ editable }) {
  const [mc, setMc] = useState('')
  const [visa, setVisa] = useState('')
  if (editable) {
    return (
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <span className="text-[12px] text-[#374151] font-semibold block mb-1">Inscripción Mastercard — ID de registro</span>
          <input type="text" value={mc} onChange={e => setMc(e.target.value)} placeholder="Ingresar número" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-semibold block mb-1">Inscripción Visa — ID de registro</span>
          <input type="text" value={visa} onChange={e => setVisa(e.target.value)} placeholder="Ingresar número" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        </div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-x-6">
      <InfoField label="Inscripción Mastercard — ID de registro" value={mc} />
      <InfoField label="Inscripción Visa — ID de registro" value={visa} />
    </div>
  )
}

function ComplianceProximaRevisionFields({ editable }) {
  const [frecuencia, setFrecuencia] = useState('60 días')
  const [alertar, setAlertar] = useState('')
  if (editable) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[12px] text-[#6B7280] m-0">Define cuándo se debe revisar este departamento para este cliente</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-2">
          <div>
            <span className="text-[12px] text-[#374151] font-medium block mb-1">Frecuencia de revisión</span>
            <select value={frecuencia} onChange={e => setFrecuencia(e.target.value)} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
              <option value="">Seleccionar</option>
              {FRECUENCIA_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <span className="text-[12px] text-[#374151] font-medium block mb-1">Alertar con anticipación</span>
            <select value={alertar} onChange={e => setAlertar(e.target.value)} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
              <option value="">Seleccionar</option>
              {ALERTAR_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div />
        </div>
        {alertar && (
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <Info size={14} className="text-[#9CA3AF] shrink-0" />
            Con la anticipación configurada, aparecerá un aviso para iniciar la nueva review
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-[#6B7280] m-0">Define cuándo se debe revisar este departamento para este cliente</p>
      <div className="grid grid-cols-3 gap-x-6">
        <InfoField label="Frecuencia de revisión" value={frecuencia} />
        <InfoField label="Alertar con anticipación" value={alertar || '—'} />
        <div />
      </div>
    </div>
  )
}

function ComplianceEdit({ addLog, subChecked, subWaived, onSubCheck, onSubWaive, onToggleAllSubs, salesRequested, onRequestSalesConfirm }) {
  const [openStepIdx, setOpenStepIdx] = useState(0)
  const [requestModal, setRequestModal] = useState(null) // { stepIdx, subIdx, label }
  return (
    <div className="flex flex-col gap-3">
        {COMPLIANCE_STEPS.map((step, i) => (
            <ComplianceStepCard
              key={i}
              step={step}
              stepIdx={i}
              isOpen={openStepIdx === i}
              onToggle={() => setOpenStepIdx(openStepIdx === i ? null : i)}
              subChecked={subChecked[i] || new Set()}
              subWaived={subWaived[i] || new Set()}
              onSubCheck={(j) => onSubCheck(i, j)}
              onSubWaive={(j) => onSubWaive(i, j)}
              onToggleAllSubs={(nextChecked) => onToggleAllSubs(i, nextChecked)}
              onRequestSales={(stepIdx, subIdx, label) => setRequestModal({ stepIdx, subIdx, label })}
              salesRequested={salesRequested}
              addLog={addLog}
              editable
            />
        ))}
      {requestModal && (
        <RequestToSalesModal
          documentName={requestModal.label}
          onCancel={() => setRequestModal(null)}
          onSend={(data) => {
            addLog?.(`Solicitud a Sales: '${data.document}' (${data.channels.join(', ')})`)
            onRequestSalesConfirm?.(requestModal.stepIdx, requestModal.subIdx)
          }}
        />
      )}
    </div>
  )
}

function ComplianceView({ subChecked = {}, subWaived = {}, salesRequested }) {
  const [openStepIdx, setOpenStepIdx] = useState(null)
  return (
    <div className="flex flex-col gap-3">
        {COMPLIANCE_STEPS.map((step, i) => (
            <ComplianceStepCard
              key={i}
              step={step}
              stepIdx={i}
              isOpen={openStepIdx === i}
              onToggle={() => setOpenStepIdx(openStepIdx === i ? null : i)}
              subChecked={subChecked[i] || new Set()}
              subWaived={subWaived[i] || new Set()}
              onSubCheck={() => {}}
              onSubWaive={() => {}}
              salesRequested={salesRequested}
              addLog={() => {}}
              editable={false}
            />
        ))}
    </div>
  )
}

/* ─── FRAUD CONTENT ─── */
const FRAUD_CHECKLIST = [
  { label: 'Datos del cliente' },
  { label: 'Vertical de negocio' },
  { label: 'Perfil Transaccional Esperado', tag: 'FINANCE', sharedId: 'perfil_transaccional' },
  { label: 'Tipo de Operatoria' },
  { label: 'Historial de Riesgo', tag: 'FINANCE', sharedId: 'historial_riesgo' },
  { label: 'Apetito de Riesgo del Cliente' },
  { label: 'Próxima revisión' },
]

const FRECUENCIA_OPTIONS = ['30 días', '60 días', '90 días', '180 días']
const ALERTAR_OPTIONS = ['15 días', '20 días', '25 días']

function FraudSections({ editable, review, onReviewChange }) {
  const datosDelCliente = editable ? (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      <TextInput label="Nombre" placeholder="Ingresar nombre" />
      <TextInput label="Cliente ID" placeholder="Text" />
      <TextInput label="Fraud Prevention / Risk Manager" placeholder="Text" />
      <TextInput label="Fecha de solicitud" placeholder="Ingresar fecha" />
      <TextInput label="Fecha estimada de Go-Live" placeholder="Ingresar fecha" />
      <div className="invisible"><TextInput label="" placeholder="" /></div>
    </div>
  ) : (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      <InfoField label="Nombre" value="Este es el nombre del cliente" />
      <InfoField label="Cliente ID" value="text" />
      <InfoField label="Fraud Prevention / Risk Manager" value="Nombre" />
      <InfoField label="Fecha de solicitud" value="Nombre" />
      <InfoField label="Fecha estimada de Go-Live" value="22/04/2026" />
      <div />
    </div>
  )

  const verticalDeNegocio = editable ? (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Vertical" placeholder="Text" />
        <TextInput label="MCCs esperados" placeholder="Text" />
      </div>
      <TextInput label="Descripción del producto/servicio" placeholder="Text" />
    </>
  ) : (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Vertical" value="Text" />
        <InfoField label="MCCs esperados" value="Text" />
      </div>
      <InfoField label="Descripción del producto/servicio" value="Text" />
    </>
  )

  const perfilTransaccional = editable ? (
    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
      <TextInput label="Volumen mensual" placeholder="Ingresar monto" info tooltip="Estimado por cantidad de transacciones" />
      <TextInput label="Monto procesado mensual" placeholder="Ingresar monto" info tooltip="Estimado en USD" />
      <TextInput label="Ticket promedio USD" placeholder="1000 usd" />
      <TextInput label="Ticket mínimo USD" placeholder="400 usd" />
      <TextInput label="Ticket máximo USD" placeholder="1000 usd" />
      <TextInput label="Mix estimado" placeholder="Text" info tooltip="Tarjetas domésticas vs. internacionales" />
      <div className="col-span-2">
        <span className="text-[12px] text-[#374151] font-medium block mb-1">Países de origen tarjetas frecuentes</span>
        <div className="flex items-center gap-1 border border-[#D1D5DB] rounded-[6px] px-2 h-[28px] bg-white">
          {['Perú', 'Chile', 'Brasil'].map(t => (
            <span key={t} className="inline-flex items-center gap-1 text-[11px] bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded-full">
              {t} <X size={10} className="text-[#9CA3AF] cursor-pointer" />
            </span>
          ))}
          <ChevronDown size={12} className="text-[#9CA3AF] ml-auto shrink-0" />
        </div>
      </div>
      <TextInput label="Monedas de transacción" placeholder="Text" />
    </div>
  ) : (
    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
      <InfoField label="Volumen mensual" value="Text" info tooltip="Estimado por cantidad de transacciones" />
      <InfoField label="Monto procesado mensual" value="Text" info tooltip="Estimado en USD" />
      <InfoField label="Ticket promedio USD" value="8000 usd" />
      <InfoField label="Ticket mínimo USD" value="400 usd" />
      <InfoField label="Ticket máximo USD" value="1000 usd" />
      <InfoField label="Mix estimado" value="Text" info tooltip="Tarjetas domésticas vs. internacionales" />
      <div className="col-span-2">
        <TagPills label="Países de origen tarjetas frecuentes" values={['Perú', 'Chile', 'Brasil']} />
      </div>
      <InfoField label="Monedas de transacción" value="Text" />
    </div>
  )

  const tipoOperatoria = editable ? (
    <div className="grid grid-cols-3 gap-x-6 gap-y-5">
      <RadioField label="Pagos únicos" />
      <RadioField label="Pagos recurrentes" info tooltip="Suscripciones / cobros automáticos" />
      <TextInput label="Frecuencia de cobro" placeholder="Mensual" />
      <RadioField label="Tarjetahabiente presente en el mome..." />
      <RadioField label="Tokenización de tarjetas (instruments)" />
    </div>
  ) : (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      <InfoFieldSiNo label="Pagos únicos" value="Si" />
      <InfoFieldSiNo label="Pagos recurrentes" value="Si" info tooltip="Suscripciones / cobros automáticos" />
      <InfoField label="Frecuencia de cobro" value="Mensual" />
      <InfoField label="Presencia del tarjetahabiente" value="Siempre" />
      <InfoFieldSiNo label="Tokenización de tarjetas" value="Si" />
    </div>
  )

  const historialRiesgo = editable ? (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-5">
        <RadioField label="Historial de procesamiento" />
        <RadioField label="Tasa de chargebacks" info tooltip="Promedio (últimos 3 meses)" />
        <RadioField label="Chargebacks > 0.9%" />
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-5">
        <TextInput label="Fecha" placeholder="Mes" />
        <RadioField label="Participación de monitoreo" info tooltip="Entre Visa o Mastercard (VAMP, ECP, FMP)" />
        <RadioField label="Incidentes de fraude" />
      </div>
      <TextInput label="Descripción del incidente" placeholder="Descripción del incidente" />
    </>
  ) : (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <InfoFieldSiNo label="Historial de procesamiento" value="Si" />
        <InfoFieldSiNo label="Tasa de chargebacks" value="Si" info tooltip="Promedio (últimos 3 meses)" />
        <InfoFieldSiNo label="Chargebacks > 0.9%" value="Si" />
        <InfoField label="Fecha" value="01/12/2023" />
        <InfoFieldSiNo label="Participación de monitoreo" value="Si" info tooltip="Entre Visa o Mastercard (VAMP, ECP, FMP)" />
        <InfoFieldSiNo label="Incidentes de fraude" value="No" />
      </div>
      <InfoField label="Descripción del incidente" value="Descripción del incidente" />
    </>
  )

  const apetitoRiesgo = editable ? (
    <>
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[12px] text-[#374151] font-medium">Prioridad del cliente</span>
            <span className="relative group/pc shrink-0">
              <Info size={12} className="text-[#D1D5DB] cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] w-[280px] whitespace-normal opacity-0 group-hover/pc:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed">
                Máxima protección / Balance / Máxima conversión
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[12px] text-[#374151] cursor-pointer">
              <input type="radio" name="prioridad" className="accent-[#180047] w-[14px] h-[14px]" /> Máxima protección (acepta menor conversión)
            </label>
            <label className="flex items-center gap-2 text-[12px] text-[#374151] cursor-pointer">
              <input type="radio" name="prioridad" className="accent-[#180047] w-[14px] h-[14px]" /> Balance protección-conversión
            </label>
            <label className="flex items-center gap-2 text-[12px] text-[#374151] cursor-pointer">
              <input type="radio" name="prioridad" className="accent-[#180047] w-[14px] h-[14px]" /> Máxima conversión (acepta mayor riesgo)
            </label>
          </div>
        </div>
        <RadioField label="Restricciones contractuales o regulatorias" info tooltip="Exigencia de 3DS en ciertos flujos" />
      </div>
      <TextInput label="Detalle" placeholder="Añadé detalle de las restricciones" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <RadioField label="Exención específica" info tooltip="TRA, low-value, whitelist" />
        <TextInput label="Detalle de exención específica" placeholder="Añadé detalle de las restricciones" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <RadioField label="Fallo de autenticación (fail-closed)" info tooltip="Si falla la autenticación, se declina la transacción" />
        <TextInput label="Observaciones adicionales" placeholder="Añadé observaciones adicionales" />
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Prioridad del cliente" value="Máxima protección" info tooltip="Máxima protección / Balance / Máxima conversión" />
        <InfoFieldSiNo label="Restricciones contractuales o regulatorias" value="No" info tooltip="Exigencia de 3DS en ciertos flujos" />
      </div>
      <InfoField label="Detalles" value="Detalles de las restricciones" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoFieldSiNo label="Exención específica" value="No" info tooltip="TRA, low-value, whitelist" />
        <InfoField label="Detalle de exención específica" value="Máxima protección" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoFieldSiNo label="Fallo de autenticación (fail-closed)" value="No" info tooltip="Si falla la autenticación, se declina la transacción" />
        <InfoField label="Observaciones adicionales" value="Más observaciones del cliente sobre pagos" />
      </div>
    </>
  )

  const proximaRevision = editable ? (
    <>
      <div className="grid grid-cols-3 gap-x-6">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Frecuencia de revisión</span>
          <select
            value={review?.frecuencia || ''}
            onChange={e => onReviewChange?.({ ...review, frecuencia: e.target.value })}
            className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white"
          >
            <option value="">Seleccionar</option>
            {FRECUENCIA_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Alertar con anticipación</span>
          <select
            value={review?.alertar || ''}
            onChange={e => onReviewChange?.({ ...review, alertar: e.target.value })}
            className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white"
          >
            <option value="">Seleccionar</option>
            {ALERTAR_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      {review?.alertar && (
        <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
          <Info size={14} className="text-[#9CA3AF] shrink-0" />
          Con la anticipación configurada, aparecerá un aviso para iniciar la nueva review
        </div>
      )}
    </>
  ) : (
    <div className="grid grid-cols-3 gap-x-6">
      <InfoField label="Frecuencia de revisión" value={review?.frecuencia} />
      <InfoField label="Alertar con anticipación" value={review?.alertar} />
    </div>
  )

  return [
    { content: datosDelCliente, subtitle: null },
    { content: verticalDeNegocio, subtitle: 'Indicar el tipo de negocio principal del cliente. Esta información determina el nivel de riesgo base y los MCCs involucrados.' },
    { content: perfilTransaccional, subtitle: 'Esta sección permite calibrar los umbrales de monto y el mix de tarjetas.', info: true, tooltip: 'Estimado por cantidad de transacciones' },
    { content: tipoOperatoria, subtitle: 'Indicar cómo el cliente procesa sus pagos. Esta sección determina si aplica el Perfil D (recurrencia) y cómo se trata el primer cobro.' },
    { content: historialRiesgo, subtitle: 'Esta sección es obligatoria para clientes que migran desde otro procesador o que ya tienen operatoria previa.' },
    { content: apetitoRiesgo, subtitle: 'Esta sección recoge la preferencia explícita del cliente respecto a la relación entre protección y tasa de aprobación.' },
    { content: proximaRevision, subtitle: 'Define cuándo se debe revisar este departamento para este cliente' },
  ]
}

function FraudSectionRow({ item, secIdx, sec, checked, waived, isOpen, onToggle, onCheck, onWaive, addLog, editable }) {
  return (
    <div className="border border-[#E5E7EB] rounded-[10px] bg-white overflow-x-hidden">
      <div
        className={`flex items-center gap-3 cursor-pointer ${isOpen ? 'px-4 pt-4 pb-3' : 'px-4 py-3'}`}
        onClick={onToggle}
      >
        <div
          className={`w-[20px] h-[20px] rounded-[5px] shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 ${checked && !waived ? 'bg-[#180047]' : !waived ? 'border-[1.5px] border-[#D1D5DB] bg-white' : 'border-[1.5px] border-[#E5E7EB] bg-[#F3F4F6] opacity-50'}`}
          onClick={(e) => { e.stopPropagation(); if (editable && !waived) onCheck?.() }}
          style={!editable ? { display: 'none' } : {}}
        >
          {checked && !waived && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <div className="w-[20px] h-[20px] rounded-full bg-[#F2EDF9] shrink-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#180047] leading-none">{secIdx + 1}</span>
        </div>
        <span className={`text-[14px] font-medium ${checked ? 'text-[#374151]' : 'text-[#0A0B0D]'}`}>{item.label}</span>
        {item.tag && <DeptTag dept={item.tag} />}
        {item.badge && (
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
            item.badge.includes('VENCER') || item.badge.includes('SIN AVANCE') ? 'text-[#DC2626] bg-[#FEE2E2]' : 'text-[#1E40AF] bg-[#DBEAFE]'
          }`}>{item.badge}</span>
        )}
        {waived && (
          <span className="text-[10px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2 py-0.5 rounded-full uppercase tracking-wide">EXIMIDO</span>
        )}
        <span className="flex-1" />
        {isOpen
          ? <ChevronUp size={18} className="text-[#374151] shrink-0" />
          : <ChevronDown size={18} className="text-[#9CA3AF] shrink-0" />
        }
      </div>
      {isOpen && (
        <>
        <hr className="border-t border-[#DEE2E6] m-0" />
        <div className="px-4 pb-4 flex flex-col gap-3 pl-[52px] pt-3">
          {sec.subtitle && <p className="text-[12px] text-[#6B7280] leading-relaxed -mt-1">{sec.subtitle}</p>}
          {sec.content}
          {editable && (
            <>
              <hr className="border-t border-[#DEE2E6] m-0 -mx-[52px]" />
              <textarea
                placeholder="Dejar un comentario..."
                rows={2}
                className="w-full border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#5a6dd7] placeholder:text-[#9CA3AF] resize-none"
              />
            </>
          )}
        </div>
        </>
      )}
    </div>
  )
}

function FraudEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog, review, onReviewChange }) {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = FraudSections({ editable: true, review, onReviewChange })
  return (
    <div className="flex flex-col gap-3">
        {FRAUD_CHECKLIST.map((item, i) => {
          const sec = sections[i] || {}
          return (
              <FraudSectionRow
                key={i}
                item={item}
                secIdx={i}
                sec={sec}
                checked={checkedItems.has(i)}
                waived={waivedItems.has(i)}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
                onCheck={() => onCheck(i)}
                onWaive={() => onWaive(i)}
                addLog={addLog}
                editable
              />
          )
        })}
    </div>
  )
}

function FraudView({ checkedItems, waivedItems, review }) {
  const sections = FraudSections({ editable: false, review: review || {} })
  const defaultOpen = new Set()
  const [openSet, setOpenSet] = useState(defaultOpen)
  const toggleIdx = (i) => setOpenSet(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })
  return (
    <div className="flex flex-col gap-3">
        {FRAUD_CHECKLIST.map((item, i) => {
          const sec = sections[i] || {}
          return (
              <FraudSectionRow
                key={i}
                item={item}
                secIdx={i}
                sec={sec}
                checked={checkedItems.has(i)}
                waived={waivedItems.has(i)}
                isOpen={openSet.has(i)}
                onToggle={() => toggleIdx(i)}
                editable={false}
              />
          )
        })}
    </div>
  )
}

/* ─── FINANCES CONTENT ─── */
const FINANCES_CHECKLIST = [
  { label: "Información administrativa" },
  { label: "Perfil Transaccional Esperado", tag: "FRAUD", sharedId: "perfil_transaccional" },
  { label: "Definición del colateral" },
]

const FINANCES_DOC_LABELS = ['EEFF', 'Balance sheet', 'Income Statement', 'Histórico transaccional', 'Modelo transaccional']

function DocLinkInput({ label, disabled }) {
  const [val, setVal] = useState('')
  const hasVal = val.trim().length > 0
  return (
    <div className="mb-3">
      {label && <p className="text-[12px] font-semibold text-[#1F2937] mb-1.5">{label}</p>}
      <div className={`group/link relative flex items-center border rounded-full px-3.5 py-2 transition-colors ${
        disabled
          ? 'border-[#E5E7EB] bg-[#F9FAFB]'
          : 'border-[#E5E7EB] bg-white focus-within:border-[#5a6dd7]'
      }`}>
        <Link2 size={13} className="text-[#9CA3AF] shrink-0 mr-2" />
        {hasVal && !disabled && (
          <button
            onClick={() => window.open(val.startsWith('http') ? val : `https://${val}`, '_blank')}
            className="items-center gap-1 text-[11px] text-[#6B7280] font-medium bg-[#F3F4F6] border border-[#E5E7EB] rounded-[4px] px-2 py-0.5 cursor-pointer hover:bg-[#E5E7EB] mr-2 shrink-0 hidden group-hover/link:flex"
          >
            <ExternalLink size={10} /> OPEN
          </button>
        )}
        <input
          type="url" value={val} onChange={e => !disabled && setVal(e.target.value)}
          placeholder="https://"
          readOnly={disabled}
          className={`flex-1 bg-transparent border-none outline-none text-[12px] min-w-0 ${
            disabled ? 'text-[#9CA3AF] cursor-not-allowed placeholder:text-[#D1D5DB]' : 'text-[#374151] placeholder:text-[#9CA3AF]'
          }`}
        />
      </div>
    </div>
  )
}

function FinancesSections({ editable }) {
  const infoAdmin = editable ? (
    <div>
      <span className="text-[12px] text-[#374151] font-medium block mb-1">Correo de facturación</span>
      <div className="flex items-center gap-2 border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] bg-white focus-within:border-[#180047]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <input type="email" placeholder="mail@mail.com" className="flex-1 bg-transparent border-none outline-none text-[12px] text-[#374151] placeholder:text-[#9CA3AF] min-w-0" />
      </div>
    </div>
  ) : (
    <InfoField label="Correo de facturación" value="mail@mail.com" />
  )

  const perfilTransaccional = editable ? (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      <TextInput label="Volumen mensual" placeholder="Text" info tooltip="Estimado por cantidad de transacciones" />
      <TextInput label="Monto procesado mensual" placeholder="Text" info tooltip="Estimado en USD" />
      <TextInput label="Ticket promedio USD" placeholder="1000 usd" />
      <TextInput label="Ticket mínimo USD" placeholder="400 usd" />
      <TextInput label="Ticket máximo USD" placeholder="1000 usd" />
      <TextInput label="Mix estimado" placeholder="Text" info tooltip="Tarjetas domésticas vs. internacionales" />
      <TextInput label="Países de origen de tarjetas frecuentes" placeholder="Text" />
      <TextInput label="Monedas de transacción" placeholder="Text" />
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      <InfoField label="Volumen mensual" value="Text" info tooltip="Estimado por cantidad de transacciones" />
      <InfoField label="Monto procesado mensual" value="Text" info tooltip="Estimado en USD" />
      <InfoField label="Ticket promedio USD" value="1000 usd" />
      <InfoField label="Ticket mínimo USD" value="400 usd" />
      <InfoField label="Ticket máximo USD" value="1000 usd" />
      <InfoField label="Mix estimado" value="Text" info tooltip="Tarjetas domésticas vs. internacionales" />
      <InfoField label="Países de origen de tarjetas frecuentes" value="Colombia" />
      <InfoField label="Monedas de transacción" value="Text" />
    </div>
  )

  const defColateral = editable ? (
    <>
      <DocLinkInput label="Certificado bancario" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">Estados Financieros</p>
      <DocLinkInput label="EEFF" />
      <DocLinkInput label="Balance sheet" />
      <DocLinkInput label="Income Statement" />
      <hr className="border-t border-[#E5E7EB] my-3" />
      <DocLinkInput label="Histórico transaccional" />
      <DocLinkInput label="Contracargos" />
    </>
  ) : (
    <>
      <DocLinkInput label="Certificado bancario" disabled />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">Estados Financieros</p>
      <DocLinkInput label="EEFF" disabled />
      <DocLinkInput label="Balance sheet" disabled />
      <DocLinkInput label="Income Statement" disabled />
      <hr className="border-t border-[#E5E7EB] my-3" />
      <DocLinkInput label="Histórico transaccional" disabled />
      <DocLinkInput label="Contracargos" disabled />
    </>
  )

  return [
    { content: infoAdmin, subtitle: null },
    { content: perfilTransaccional, subtitle: 'Esta sección permite calibrar los umbrales de monto y el mix de tarjetas.' },
    { content: defColateral, subtitle: null },
  ]
}

function FinancesEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = FinancesSections({ editable: true })
  return (
    <div className="flex flex-col gap-3">
      {FINANCES_CHECKLIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={checkedItems.has(i)}
            waived={waivedItems.has(i)}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
            onCheck={() => onCheck(i)}
            onWaive={() => onWaive(i)}
            addLog={addLog}
            editable
          />
        )
      })}
    </div>
  )
}

function FinancesView({ checkedItems, waivedItems }) {
  const sections = FinancesSections({ editable: false })
  const [openSet, setOpenSet] = useState(new Set())
  const toggleIdx = (i) => setOpenSet(prev => {
    const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n
  })
  return (
    <div className="flex flex-col gap-3">
      {FINANCES_CHECKLIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={checkedItems.has(i)}
            waived={waivedItems.has(i)}
            isOpen={openSet.has(i)}
            onToggle={() => toggleIdx(i)}
            editable={false}
          />
        )
      })}
    </div>
  )
}

/* ─── SALES CONTENT ─── */
const SALES_CHECKLIST = [
  "Checklist de implementación",
  "Pruebas Productivas Completadas & Document...",
  "Handoff soporte",
  "Capacitaciones (Soporte, Fraude & CBs, Reconci...",
]

const SALES_DOC_LABELS = ['Contrato firmado', 'Pagos', 'Cargos de impuestos', 'Depósito']

const SALES_OTROS_SERVICIOS = [
  'Merchants Engine',
  '3DS Secure (3DS)',
  'Account Updater (ABU)',
  'Settlement Engine',
  'Fraud Prevention',
  'KYB/KYC Checks',
  'Payment Links',
]

/* Upload zone component for Sales docs */
function UploadZone({ label }) {
  const [file, setFile] = useState(null)
  const fileRef = useRef(null)
  return (
    <div>
      <p className="text-[12px] font-semibold text-[#1F2937] mb-1.5">{label}</p>
      <div
        onClick={() => fileRef.current?.click()}
        className="border border-dashed border-[#D1D5DB] rounded-[8px] py-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#9CA3AF] transition-colors bg-white"
      >
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]) }} />
        {file ? (
          <p className="text-[12px] text-[#0A0B0D] font-medium">{file.name}</p>
        ) : (
          <>
            <ArrowUpRight size={16} className="text-[#9CA3AF] mb-1 rotate-45" />
            <p className="text-[12px] text-[#374151]">Arrastra o hace click para subir</p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">Sólo archivos PDF - Máx 10 mb</p>
          </>
        )}
      </div>
    </div>
  )
}

const SALES_SECTIONS_LIST = [
  { label: 'Información general' },
  { label: 'Configuración de servicio' },
  { label: 'Definición del colateral' },
]

function SalesSections({ editable }) {
  const infoGeneral = editable ? (
    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
      <TextInput label="Nombre legal" placeholder="Nombre" />
      <TextInput label="Tenant" placeholder="20/03/2026" />
      <TextInput label="Website" placeholder="www.hola.com" />
    </div>
  ) : (
    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
      <InfoField label="Nombre legal" value="Nombre legal" />
      <InfoField label="Tenant" value="Nombre Tenant" />
      <InfoField label="Website" value="www.hola.com" />
    </div>
  )

  const configServicio = editable ? (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Deal Type</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Processing</option><option>Acquiring</option><option>Issuing</option>
          </select>
        </div>
        <TextInput label="3DS incluido" placeholder="No" />
        <TextInput label="Tap on Phone incluído" placeholder="Si" />
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        <TextInput label="Set Up Fee" placeholder="1000 USD" />
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Colateral</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Depósito</option><option>Garantía bancaria</option><option>Sin colateral</option>
          </select>
        </div>
        <div className="invisible"><TextInput label="" placeholder="" /></div>
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6]">
        <p className="text-[13px] font-medium text-[#0A0B0D] m-0">Otros servicios</p>
      </div>
      <div className="flex items-center gap-2">
        <select className="flex-1 border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
          <option>Seleccionar</option>
          {SALES_OTROS_SERVICIOS.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="text-[12px] font-medium text-[#180047] bg-white px-3 py-1.5 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F3F0FF] whitespace-nowrap shrink-0">+ Agregar otro</button>
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        <InfoField label="Deal Type" value="Processing" />
        <InfoField label="3DS Incluido" value="No" />
        <InfoField label="Tap on Phone incluido" value="Sí" />
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        <InfoField label="Set Up Fee" value="1000 USD" />
        <InfoField label="Colateral" value="Depósito" />
        <div />
      </div>
    </>
  )

  const docFilenames = { 'Contrato firmado': 'contrato_firmado.pdf', 'Pagos': 'pagos.pdf', 'Cargos de impuestos': 'cargos de impuestos.pdf', 'Depósito': 'documento_depósito.pdf' }
  const documentacion = editable ? (
    <>{SALES_DOC_LABELS.map((label, i) => <UploadZone key={i} label={label} />)}</>
  ) : (
    <>
      {SALES_DOC_LABELS.map((label, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 py-[6px] bg-[#F8F9FA] -mx-[52px] px-[52px] border-y border-[#F3F4F6]">
            <span className="text-[13px] text-[#1F2937]">{label}</span>
          </div>
          <div className="flex items-center gap-3 py-3 border-b border-[#F3F4F6]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-[#0A0B0D] font-medium truncate m-0">{docFilenames[label] || `${label.toLowerCase()}.pdf`}</p>
              <p className="text-[11px] text-[#9CA3AF] m-0">2.4 MB</p>
            </div>
            <button className="flex items-center gap-1 text-[12px] font-medium text-[#180047] bg-white px-3 py-1 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">
              Abrir <ExternalLink size={12} />
            </button>
          </div>
        </div>
      ))}
    </>
  )

  return [
    { content: infoGeneral, subtitle: null },
    { content: configServicio, subtitle: null },
    { content: documentacion, subtitle: null },
  ]
}

function SalesEdit({ addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = SalesSections({ editable: true })
  return (
    <div className="flex flex-col gap-3">
      {SALES_SECTIONS_LIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={false}
            waived={false}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
            addLog={addLog}
            editable
          />
        )
      })}
    </div>
  )
}

function SalesView() {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = SalesSections({ editable: false })
  return (
    <div className="flex flex-col gap-3">
      {SALES_SECTIONS_LIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={false}
            waived={false}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
            editable={false}
          />
        )
      })}
    </div>
  )
}

/* ─── LEGAL AND CONTRACT CONTENT ─── */
const LEGAL_CHECKLIST = [
  { label: 'Contrato', badge: 'POR VENCER' },
  { label: 'NDA', badge: 'SIN AVANCE · 12 DÍAS' },
  { label: 'Cargo de implementación' },
  { label: 'Cargo recurrentes mensuales' },
  { label: 'Cargos 3DS' },
  { label: 'Forma de pago' },
  { label: 'Depósito de garantía' },
]

function LegalSections({ editable }) {
  /* ── 0: Contrato ── */
  const contrato = editable ? (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Fecha de firma" placeholder="18/02/2029" />
        <TextInput label="Fecha de vencimiento" placeholder="30/09/2026" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Tipo de contrato</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Seleccionar</option>
            <option>Marco</option>
            <option>Específico</option>
          </select>
        </div>
        <TextInput label="Contraparte" placeholder="Efecty S.A" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Entidad Akua" placeholder="Akua Colombia S.A" />
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">País</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Seleccionar</option>
            <option>Colombia</option>
            <option>Argentina</option>
            <option>Uruguay</option>
          </select>
        </div>
      </div>
      <UploadZone label="Contrato V5 completo" />
      <UploadZone label="Anexo I – Descripción técnica y alcance" />
      <div className="flex flex-wrap gap-1.5">
        {['99% DISPONIBILIDAD', '<1S AUTORIZACIÓN', 'VISA & MASTERCARD', 'PCI DSS · AML · KYC'].map(b => (
          <span key={b} className="text-[10px] font-medium uppercase px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">{b}</span>
        ))}
      </div>
      <UploadZone label="Anexo II – SLA" />
      <div className="flex flex-wrap gap-1.5">
        {['PENALIDAD MÁX. 30%', 'PROCESAMIENTO TRANSACCIONAL'].map(b => (
          <span key={b} className="text-[10px] font-medium uppercase px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">{b}</span>
        ))}
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Fecha de firma" value="20/03/2025" />
        <InfoField label="Fecha de vencimiento" value="20/03/2025" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Tipo de contrato" value="Text" />
        <InfoField label="Contraparte" value="Efecty S.A" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Entidad Akua" value="Akua Colombia S.A" />
        <InfoField label="País" value="Colombia" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#DEE2E6] mt-3">
        <p className="text-[13px] font-medium text-[#0A0B0D] m-0">Contrato V5 completo</p>
      </div>
      <div className="flex items-center gap-3 py-2.5 border-b border-[#F3F4F6]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/></svg>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[#0A0B0D] font-medium m-0">Contrato V5 completo.pdf</p>
          <p className="text-[11px] text-[#9CA3AF] m-0">2.4 MB</p>
        </div>
        <button className="flex items-center gap-1 text-[12px] font-medium text-[#180047] bg-white px-3 py-1 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">Abrir <ExternalLink size={12} /></button>
        <DocMenuButton onDelete={() => {}} />
      </div>
      <div className="flex flex-wrap gap-1.5 py-3 border-b border-[#F3F4F6]">
        {['99% DISPONIBILIDAD', '<1S AUTORIZACIÓN', 'VISA & MASTERCARD', 'PCI DSS · AML · KYC'].map(b => (
          <span key={b} className="text-[10px] font-medium uppercase px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">{b}</span>
        ))}
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#DEE2E6]">
        <p className="text-[13px] font-medium text-[#0A0B0D] m-0">Anexo II – SLA</p>
      </div>
      <div className="flex items-center gap-3 py-2.5 border-b border-[#F3F4F6]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/></svg>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[#0A0B0D] font-medium m-0">Contrato V5 completo.pdf</p>
          <p className="text-[11px] text-[#9CA3AF] m-0">2.4 MB</p>
        </div>
        <button className="flex items-center gap-1 text-[12px] font-medium text-[#180047] bg-white px-3 py-1 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">Abrir <ExternalLink size={12} /></button>
        <DocMenuButton onDelete={() => {}} />
      </div>
      <div className="flex flex-wrap gap-1.5 py-3">
        {['PENALIDAD MÁX. 30%', 'PROCESAMIENTO TRANSACCIONAL'].map(b => (
          <span key={b} className="text-[10px] font-medium uppercase px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">{b}</span>
        ))}
      </div>
    </>
  )

  /* ── 1: NDA ── */
  const nda = editable ? (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Fecha de entrada" placeholder="18/11/2029" />
        <TextInput label="Nombre" placeholder="Escribir nombre" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Estado actual</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>En negociación</option>
            <option>Firmado</option>
            <option>Vencido</option>
          </select>
        </div>
        <TextInput label="Desde" placeholder="01/03/2024" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6]">
        <p className="text-[13px] font-medium text-[#0A0B0D] m-0">NDA Vigente</p>
      </div>
      <div className="flex items-center gap-3 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[#0A0B0D] font-medium truncate m-0">documenti.pdf</p>
          <p className="text-[11px] text-[#9CA3AF] m-0">2.4 MB</p>
        </div>
        <button className="flex items-center gap-1 text-[12px] font-medium text-[#180047] bg-white px-3 py-1 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">
          Abrir <ExternalLink size={12} />
        </button>
        <DocMenuButton onDelete={() => {}} onAttach={() => {}} />
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Fecha de entrada" value="20/03/2025" />
        <InfoField label="Nombre" value="Text" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Estado actual" value="En negociación" />
        <InfoField label="Desde" value="01/03/2026" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#DEE2E6] mt-3">
        <p className="text-[13px] font-medium text-[#0A0B0D] m-0">NDA Vigente</p>
      </div>
      <div className="flex items-center gap-3 py-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/></svg>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[#0A0B0D] font-medium m-0">documenti.pdf</p>
          <p className="text-[11px] text-[#9CA3AF] m-0">2.4 MB</p>
        </div>
        <button className="flex items-center gap-1 text-[12px] font-medium text-[#180047] bg-white px-3 py-1 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F9FAFB] shrink-0">Abrir <ExternalLink size={12} /></button>
        <DocMenuButton onDelete={() => {}} />
      </div>
    </>
  )

  /* ── 2: Cargo de implementación ── */
  const cargoImpl = editable ? (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <TextInput label="Monto" placeholder="USD 15,000 + IVA" />
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Tipo de cambio</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Pago único</option>
            <option>Mensual</option>
          </select>
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Estatus</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Pendiente</option>
            <option>Pagado</option>
          </select>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Facturación: 30 días post-firma o día siguiente del kickoff (lo que ocurra primero).</p>
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <InfoField label="Monto" value="USD 15,000 + IVA" />
        <InfoField label="Tipo de cambio" value="Pago único" />
        <InfoField label="Estatus" value="Pendiente" />
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Facturación: 30 días post-firma o día siguiente del kickoff (lo que ocurra primero).</p>
      </div>
    </>
  )

  /* ── 3: Cargo recurrentes mensuales ── */
  const cargoRec = editable ? (
    <>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6]"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Adquirencia como Servicio</p></div>
      <div className="flex justify-between text-[11px] text-[#9CA3AF] pb-1 border-b border-[#F3F4F6]">
        <span>Rango de transacciones</span><span>Monto negociado</span>
      </div>
      {['0 – 200K', '200K – 1M', '1M – 3M', '+3M'].map(r => (
        <div key={r} className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
          <span className="text-[13px] text-[#1F2937]">{r}</span>
          <input type="text" placeholder="Ingresar monto" className="w-[140px] border border-[#E5E7EB] rounded-[6px] px-2 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        </div>
      ))}
      <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
        <span className="text-[13px] text-[#1F2937] font-semibold">Rango activo actual</span>
        <input type="text" placeholder="Ingresar monto" className="w-[140px] border border-[#E5E7EB] rounded-[6px] px-2 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6] mt-2"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Procesamiento Transaccional (Cloud)</p></div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Monto mensual" placeholder="USD 6,000" />
        <TextInput label="Corte hasta (julio)" placeholder="25/06/2026" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6] mt-2"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Fees EASPBV + Tarifa de Intercambio</p></div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Base" placeholder="Proporcional según MCC" />
        <TextInput label="Adicional fijo" placeholder="+00.03%" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6] mt-2"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Servicios adicionales</p></div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Tokenización</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white"><option>Inactivo</option><option>Activo</option></select>
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Análisis de fraude</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white"><option>Inactivo</option><option>Activo</option></select>
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Compensación real time</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white"><option>Inactivo</option><option>Activo</option></select>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6]"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Adquirencia como Servicio</p></div>
      <div className="flex justify-between text-[11px] text-[#9CA3AF] pb-1 border-b border-[#F3F4F6]">
        <span>Rango de transacciones</span><span>Monto negociado</span>
      </div>
      {['0 – 200K', '200K – 1M', '1M – 3M', '+3M'].map(r => (
        <div key={r} className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
          <span className="text-[13px] text-[#1F2937]">{r}</span>
          <span className="text-[13px] text-[#0A0B0D] font-semibold">—</span>
        </div>
      ))}
      <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
        <span className="text-[13px] text-[#1F2937] font-semibold">Rango activo actual</span>
        <span className="text-[13px] text-[#0A0B0D] font-semibold">—</span>
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6] mt-2"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Procesamiento Transaccional (Cloud)</p></div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Monto mensual" value="USD 6,000" />
        <InfoField label="Corte hasta (julio)" value="25/06/2026" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6] mt-2"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Fees EASPBV + Tarifa de Intercambio</p></div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Base" value="Proporcional según MCC" />
        <InfoField label="Adicional fijo" value="+00.03%" />
      </div>
      <div className="bg-[#F8F9FA] -mx-[52px] px-[52px] py-2 border-y border-[#F3F4F6] mt-2"><p className="text-[13px] font-medium text-[#0A0B0D] m-0">Servicios adicionales</p></div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <InfoField label="Tokenización" value="Inactivo" />
        <InfoField label="Análisis de fraude" value="Inactivo" />
        <InfoField label="Compensación real time" value="Inactivo" />
      </div>
    </>
  )

  /* ── 4: Cargos 3DS ── */
  const cargos3ds = editable ? (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      <TextInput label="Implementación" placeholder="USD $ 2,000 + IVA" />
      <TextInput label="Mantenimiento" placeholder="US$ 250 + IVA" />
      <TextInput label="Por transacción autenticada" placeholder="USD 50.85 + IVA" />
    </div>
  ) : (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
      <InfoField label="Implementación" value="USD $ 2,000 + IVA" />
      <InfoField label="Mantenimiento" value="US$ 250 + IVA" />
      <InfoField label="Por transacción autenticada" value="USD 50.85 + IVA" />
    </div>
  )

  /* ── 5: Forma de pago ── */
  const formaPago = editable ? (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <TextInput label="Plazo para vencimiento" placeholder="6 días calendario" />
        <TextInput label="Plazo pago déficit" placeholder="8 días" />
        <TextInput label="Retención sobre settlements" placeholder="8 días calendario" />
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <InfoField label="Plazo para vencimiento" value="8 días calendario" />
        <InfoField label="Plazo pago déficit" value="8 días" />
        <InfoField label="Retención sobre settlements" value="8 días calendario" />
      </div>
    </>
  )

  /* ── 6: Depósito de garantía ── */
  const deposito = editable ? (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <TextInput label="Monto USD" placeholder="Ingresar monto en USD" />
        <TextInput label="Equivalente COP (TRM día)" placeholder="A definir" />
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Estado</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Pendiente</option>
            <option>Constituido</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <TextInput label="Fecha límite constitución (auto 24 hs)" placeholder="Ingresar fecha límite" />
        <TextInput label="Vigencia post-terminación" placeholder="1 meses" />
        <div className="invisible"><TextInput label="" placeholder="" /></div>
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Akua puede ajustarlo por riesgo, volumen o requerimiento de franquicias. Ejecución directa sin requerimiento judicial.</p>
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <InfoField label="Monto USD" value="USD $1,000" />
        <InfoField label="Equivalente COP (TRM día)" value="A definir" />
        <InfoField label="Estado" value="Pendiente" />
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <InfoField label="Fecha límite constitución (auto 24 hs)" value="25/02/2027" />
        <InfoField label="Vigencia post-terminación" value="1 meses" />
        <div />
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Akua puede ajustarlo por riesgo, volumen o requerimiento de franquicias. Ejecución directa sin requerimiento judicial.</p>
      </div>
    </>
  )

  return [
    { content: contrato, subtitle: null },
    { content: nda, subtitle: null },
    { content: cargoImpl, subtitle: null },
    { content: cargoRec, subtitle: null },
    { content: cargos3ds, subtitle: null },
    { content: formaPago, subtitle: null },
    { content: deposito, subtitle: null },
  ]
}

function LegalStatusBadge({ badge }) {
  if (!badge) return null
  const isAlert = badge.includes('VENCER') || badge.includes('SIN AVANCE') || badge.includes('BLOQUEADO')
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
      isAlert ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]' : 'bg-[#DBEAFE] text-[#1E40AF]'
    }`}>
      {badge}
    </span>
  )
}

function LegalEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = LegalSections({ editable: true })
  return (
    <div className="flex flex-col gap-3">
      {LEGAL_CHECKLIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={checkedItems.has(i)}
            waived={waivedItems.has(i)}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
            onCheck={() => onCheck(i)}
            onWaive={() => onWaive(i)}
            addLog={addLog}
            editable
          />
        )
      })}
    </div>
  )
}

function LegalView({ checkedItems, waivedItems }) {
  const sections = LegalSections({ editable: false })
  const defaultOpen = new Set()
  const [openSet, setOpenSet] = useState(defaultOpen)
  const toggleIdx = (i) => setOpenSet(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })
  return (
    <div className="flex flex-col gap-3">
      {LEGAL_CHECKLIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={checkedItems.has(i)}
            waived={waivedItems.has(i)}
            isOpen={openSet.has(i)}
            onToggle={() => toggleIdx(i)}
            editable={false}
          />
        )
      })}
    </div>
  )
}

/* ─── KICKOFF & INTEGRATION CONTENT ─── */
const KICKOFF_CHECKLIST = [
  { label: 'Documentación' },
]

const KICKOFF_DOC_LABELS = ['Contrato firmado', 'Pagos', 'Cargos de impuestos', 'Depósito']

function KickoffSections({ editable }) {
  const documentacion = editable ? (
    <>
      {KICKOFF_DOC_LABELS.map((label, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 py-[6px] bg-[#F8F9FA] -mx-[52px] px-[52px] border-y border-[#F3F4F6]">
            <div className="w-[18px] h-[18px] rounded-[4px] shrink-0 border-[1.5px] border-[#D1D5DB] bg-white cursor-pointer hover:opacity-80" />
            <span className="text-[13px] text-[#1F2937]">{label}</span>
          </div>
          <div className="py-2">
            <UploadZone label="" />
          </div>
        </div>
      ))}
    </>
  ) : (
    <>
      {KICKOFF_DOC_LABELS.map((label, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 py-[6px] bg-[#F8F9FA] -mx-[52px] px-[52px] border-y border-[#F3F4F6]">
            <span className="text-[13px] text-[#1F2937]">{label}</span>
          </div>
          <div className="flex flex-col items-center justify-center py-6 border border-[#E5E7EB] rounded-[8px] my-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" className="mb-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
            </svg>
            <p className="text-[12px] text-[#9CA3AF] m-0">No existen archivos</p>
          </div>
        </div>
      ))}
    </>
  )

  return [
    { content: documentacion, subtitle: null },
  ]
}

function KickoffEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = KickoffSections({ editable: true })
  return (
    <div className="flex flex-col gap-3">
      {KICKOFF_CHECKLIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={checkedItems.has(i)}
            waived={waivedItems.has(i)}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
            onCheck={() => onCheck(i)}
            onWaive={() => onWaive(i)}
            addLog={addLog}
            editable
          />
        )
      })}
    </div>
  )
}

function KickoffView({ checkedItems, waivedItems }) {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = KickoffSections({ editable: false })
  return (
    <div className="flex flex-col gap-3">
      {KICKOFF_CHECKLIST.map((item, i) => {
        const sec = sections[i] || {}
        return (
          <FraudSectionRow
            key={i}
            item={item}
            secIdx={i}
            sec={sec}
            checked={checkedItems.has(i)}
            waived={waivedItems.has(i)}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
            editable={false}
          />
        )
      })}
    </div>
  )
}

/* ─── Placeholder for other departments ─── */
function PlaceholderDept({ name, isEditing }) {
  return (
    <div className="text-center py-16 text-[#9CA3AF] text-[13px]">
      <p className="font-medium text-[#6B7280]">{name}</p>
      <p className="mt-1">Department content — {isEditing ? 'Edit mode' : 'View mode'}</p>
    </div>
  )
}

/* ─── CONTACTS TAB ─── */
const CONTACT_TYPE_COLORS = {
  Ventas: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  Legal: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  'Soporte técnico': { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  Finanzas: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  Compliance: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
}

function ContactsTab() {
  const [contactsEditing, setContactsEditing] = useState(false)
  const [contacts, setContacts] = useState([
    { name: 'Alan Juárez', email: 'alan@efecty.com', phone: '1223445566', type: 'Ventas' },
    { name: 'María López', email: 'mlopez@efecty.com', phone: '1223445567', type: 'Legal' },
    { name: 'Carlos Ríos', email: 'crios@efecty.com', phone: '1223445568', type: 'Soporte técnico' },
    { name: 'Sandra Mora', email: 'smora@efecty.com', phone: '1223445569', type: 'Finanzas' },
    { name: 'Pedro Gómez', email: 'pgomez@efecty.com', phone: '1223445570', type: 'Compliance' },
  ])
  const [autorizados, setAutorizados] = useState([
    { name: 'Alan Juárez', email: 'alan@efecty.com', phone: '1223445566', requerimientos: 'Cambio MCC, Razón social' },
    { name: 'María López', email: 'mlopez@efecty.com', phone: '1223445567', requerimientos: 'Datos de contacto, Otros' },
  ])
  const [editingRow, setEditingRow] = useState(null)
  const [editingRowAuth, setEditingRowAuth] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', type: '' })
  const [editFormAuth, setEditFormAuth] = useState({ name: '', email: '', phone: '', requerimientos: '' })

  const handleAddContact = () => {
    setContacts(prev => [...prev, { name: '', email: '', phone: '', type: '' }])
    setEditingRow(contacts.length)
    setEditForm({ name: '', email: '', phone: '', type: '' })
  }

  const handleSaveRow = (idx) => {
    setContacts(prev => prev.map((c, i) => i === idx ? { ...editForm } : c))
    setEditingRow(null)
  }

  const handleEditRow = (idx) => {
    setEditingRow(idx)
    setEditForm({ ...contacts[idx] })
  }

  return (
    <div className="border border-[#E5E7EB] rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-semibold text-[#0A0B0D] m-0">Contacts</h2>
        <div className="flex items-center gap-2">
          {contactsEditing && (
            <button onClick={handleAddContact} className="text-[13px] font-medium text-[#374151] bg-white px-4 py-2 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB] transition-colors">
              + Agregar contacto
            </button>
          )}
          {!contactsEditing ? (
            <button onClick={() => setContactsEditing(true)} className="text-[13px] font-medium text-white bg-[#180047] px-5 py-2 rounded-full border-none cursor-pointer hover:bg-[#2a0066] transition-colors">
              Editar
            </button>
          ) : (
            <button onClick={() => { setContactsEditing(false); setEditingRow(null) }} className="text-[13px] font-medium text-white bg-[#180047] px-5 py-2 rounded-full border-none cursor-pointer hover:bg-[#2a0066] transition-colors">
              Guardar cambios
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-4">Por tipo de gestión</p>
      <table className="w-full text-left table-fixed">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[25%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[13%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Nombre</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Email</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Teléfono</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Área</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3" />
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, idx) => (
            <tr key={idx} className="border-b border-[#F3F4F6]">
              {editingRow === idx ? (
                <>
                  <td className="py-3 pr-4"><input value={editForm.name} onChange={e => setEditForm(p => ({...p, name: e.target.value}))} placeholder="Nombre" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3 pr-4"><input value={editForm.email} onChange={e => setEditForm(p => ({...p, email: e.target.value}))} placeholder="Email" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3 pr-4"><input value={editForm.phone} onChange={e => setEditForm(p => ({...p, phone: e.target.value}))} placeholder="Teléfono" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3 pr-4"><input value={editForm.type} onChange={e => setEditForm(p => ({...p, type: e.target.value}))} placeholder="Área" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3">
                    <button onClick={() => handleSaveRow(idx)} className="text-[12px] font-medium text-white bg-[#180047] px-3 py-1.5 rounded-full border-none cursor-pointer hover:bg-[#2a0066]">Guardar</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-4 pr-4 text-[14px] font-semibold text-[#0A0B0D]">{contact.name || '—'}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#374151]">{contact.email || '—'}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#374151]">{contact.phone || '—'}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#374151]">{contact.type || '—'}</td>
                  <td className="py-4">
                    {contactsEditing && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditRow(idx)} className="text-[13px] font-medium text-[#374151] bg-white px-4 py-1.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB]">Editar</button>
                        <button onClick={() => setContacts(prev => prev.filter((_, i) => i !== idx))} className="flex items-center justify-center w-[30px] h-[30px] rounded-full border border-[#E5E7EB] bg-white cursor-pointer hover:bg-[#FEE2E2] hover:border-[#fa5252] transition-colors">
                          <Trash2 size={14} className="text-[#6B7280] hover:text-[#fa5252]" />
                        </button>
                      </div>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Second section: Autorizados para requerimientos oficiales */}
      <hr className="border-t border-[#E5E7EB] my-6" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-4">Autorizados para requerimientos oficiales</p>
      <table className="w-full text-left table-fixed">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[25%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[13%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Nombre</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Email</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Teléfono</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3 pr-4">Requerimientos</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3" />
          </tr>
        </thead>
        <tbody>
          {autorizados.map((contact, idx) => (
            <tr key={idx} className="border-b border-[#F3F4F6]">
              {editingRowAuth === idx ? (
                <>
                  <td className="py-3 pr-4"><input value={editFormAuth.name} onChange={e => setEditFormAuth(p => ({...p, name: e.target.value}))} placeholder="Nombre" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3 pr-4"><input value={editFormAuth.email} onChange={e => setEditFormAuth(p => ({...p, email: e.target.value}))} placeholder="Email" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3 pr-4"><input value={editFormAuth.phone} onChange={e => setEditFormAuth(p => ({...p, phone: e.target.value}))} placeholder="Teléfono" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3 pr-4"><input value={editFormAuth.requerimientos} onChange={e => setEditFormAuth(p => ({...p, requerimientos: e.target.value}))} placeholder="Requerimientos" className="w-full border border-[#D1D5DB] rounded-[6px] px-2 h-[32px] text-[13px] outline-none focus:border-[#180047] bg-white" /></td>
                  <td className="py-3">
                    <button onClick={() => { setAutorizados(prev => prev.map((c, i) => i === idx ? { ...editFormAuth } : c)); setEditingRowAuth(null) }} className="text-[12px] font-medium text-white bg-[#180047] px-3 py-1.5 rounded-full border-none cursor-pointer hover:bg-[#2a0066]">Guardar</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-4 pr-4 text-[14px] font-semibold text-[#0A0B0D]">{contact.name || '—'}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#374151]">{contact.email || '—'}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#374151]">{contact.phone || '—'}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#374151]">{contact.requerimientos || '—'}</td>
                  <td className="py-4">
                    {contactsEditing && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingRowAuth(idx); setEditFormAuth({ ...contact }) }} className="text-[13px] font-medium text-[#374151] bg-white px-4 py-1.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB]">Editar</button>
                        <button onClick={() => setAutorizados(prev => prev.filter((_, i) => i !== idx))} className="flex items-center justify-center w-[30px] h-[30px] rounded-full border border-[#E5E7EB] bg-white cursor-pointer hover:bg-[#FEE2E2] hover:border-[#fa5252] transition-colors">
                          <Trash2 size={14} className="text-[#6B7280]" />
                        </button>
                      </div>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {contactsEditing && (
        <button
          onClick={() => {
            setAutorizados(prev => [...prev, { name: '', email: '', phone: '', requerimientos: '' }])
            setEditingRowAuth(autorizados.length)
            setEditFormAuth({ name: '', email: '', phone: '', requerimientos: '' })
          }}
          className="mt-3 text-[13px] font-medium text-[#374151] bg-white px-4 py-2 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
        >
          + Agregar autorizado
        </button>
      )}
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function ClientDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Revisión por áreas')
  const [activeDept, setActiveDept] = useState('compliance')
  const [isEditing, setIsEditingRaw] = useState(false)
  const setIsEditing = (val) => { setIsEditingRaw(val); if (!val) setHasChanges(false) }
  const [innerTab, setInnerTab] = useState('information')
  const [checkedItems, setCheckedItems] = useState({ compliance: new Set(), fraud: new Set(), finances: new Set(), sales: new Set(), legal: new Set(), kickoff: new Set() })
  const [waivedItems, setWaivedItems] = useState({ compliance: new Set(), fraud: new Set(), finances: new Set(), sales: new Set(), legal: new Set(), kickoff: new Set() })
  const [deptStatuses, setDeptStatuses] = useState({
    compliance: 'not_started',
    fraud: 'not_started',
    finances: 'not_started',
    sales: 'not_started',
    legal: 'not_started',
    kickoff: 'not_started',
    golive: 'not_started',
  })
  const [activityLogs, setActivityLogs] = useState({
    compliance: [], fraud: [], finances: [], sales: [], legal: [], kickoff: [], golive: [],
  })

  // Compliance sub-items state: per-step Sets of sub-indices
  const [complianceSubChecked, setComplianceSubChecked] = useState({})
  const [complianceSubWaived, setComplianceSubWaived] = useState({})
  const [complianceSalesRequested, setComplianceSalesRequested] = useState(new Set())
  const handleComplianceSalesConfirm = (stepIdx, subIdx) => {
    setComplianceSalesRequested(prev => {
      const next = new Set(prev)
      next.add(`${stepIdx}.${subIdx}`)
      return next
    })
  }
  const handleComplianceSubCheck = (stepIdx, subIdx) => {
    setComplianceSubChecked(prev => {
      const s = new Set(prev[stepIdx] || [])
      if (s.has(subIdx)) s.delete(subIdx); else s.add(subIdx)
      return { ...prev, [stepIdx]: s }
    })
    const step = COMPLIANCE_STEPS[stepIdx]
    const sub = step?.subItems?.[subIdx]
    if (sub) {
      const subLabel = typeof sub === 'object' ? sub.label : sub
      const was = (complianceSubChecked[stepIdx] || new Set()).has(subIdx)
      addLog(was ? `'${subLabel}' desmarcado` : `'${subLabel}' se ha marcado como lista`)
    }
  }
  const handleComplianceSubWaive = (stepIdx, subIdx) => {
    setComplianceSubWaived(prev => {
      const s = new Set(prev[stepIdx] || [])
      if (s.has(subIdx)) s.delete(subIdx); else s.add(subIdx)
      return { ...prev, [stepIdx]: s }
    })
  }
  const handleComplianceToggleAllSubs = (stepIdx, nextChecked) => {
    const step = COMPLIANCE_STEPS[stepIdx]
    const total = step?.subItems?.length || 0
    setComplianceSubChecked(prev => ({
      ...prev,
      [stepIdx]: nextChecked
        ? new Set(Array.from({ length: total }, (_, j) => j))
        : new Set(),
    }))
    setComplianceSubWaived(prev => ({ ...prev, [stepIdx]: new Set() }))
    addLog(nextChecked
      ? `'${step.title}' marcado como completo (todos los sub-ítems)`
      : `'${step.title}' desmarcado (todos los sub-ítems)`)
  }

  // Fraud review/version state
  const [fraudReview, setFraudReview] = useState({ frecuencia: '60 días', alertar: '' })
  const [fraudShowBanner, setFraudShowBanner] = useState(false)
  const [fraudSnapshots, setFraudSnapshots] = useState([]) // historical snapshots [{ id, name, checked, waived, review }]
  const [activeFraudVersion, setActiveFraudVersion] = useState('current')

  const fraudVersionNames = ['Setup inicial', '1er revisión', '2da revisión', '3er revisión', '4ta revisión', '5ta revisión']
  const currentFraudVersionName = fraudVersionNames[fraudSnapshots.length] || `${fraudSnapshots.length + 1}ª revisión`
  const isViewingFraudSnapshot = activeFraudVersion !== 'current'
  const currentFraudSnapshot = fraudSnapshots.find(v => v.id === activeFraudVersion)

  const handleStartFraudReview = () => {
    const previousName = fraudVersionNames[fraudSnapshots.length] || `${fraudSnapshots.length + 1}ª revisión`
    const newSnapshotId = `v${Date.now()}`
    setFraudSnapshots(prev => [
      ...prev,
      {
        id: newSnapshotId,
        name: previousName,
        checked: new Set(checkedItems.fraud),
        waived: new Set(waivedItems.fraud),
        review: { ...fraudReview },
      },
    ])
    setCheckedItems(prev => ({ ...prev, fraud: new Set() }))
    setWaivedItems(prev => ({ ...prev, fraud: new Set() }))
    setFraudReview({ frecuencia: fraudReview.frecuencia, alertar: '' })
    setActiveFraudVersion('current')
    setFraudShowBanner(false)
    addLog(`Iniciada nueva revisión`)
  }

  const USER_NAME = 'Agustina Romagnoli'

  const addLog = (text) => {
    setActivityLogs(prev => ({
      ...prev,
      [activeDept]: [{ text, user: USER_NAME, date: formatNow() }, ...(prev[activeDept] || [])],
    }))
  }

  const [hasChanges, setHasChanges] = useState(false)

  // Dept conditions (for 'Completado con condiciones' status)
  const [deptConditions, setDeptConditions] = useState({}) // { [deptKey]: string[] }
  const [conditionsModalDept, setConditionsModalDept] = useState(null)

  const handleStatusChange = (status) => {
    const label = STATUS_OPTIONS.find(o => o.value === status)?.label
    if (status === 'completed_conditions') {
      // Open modal; status is applied when user confirms
      setConditionsModalDept(activeDept)
      return
    }
    addLog(`Cambio de estado del departamento a "${label}"`)
    setDeptStatuses(prev => ({ ...prev, [activeDept]: status }))
    setHasChanges(true)
  }

  const handleConfirmConditions = (list) => {
    const dept = conditionsModalDept
    setDeptConditions(prev => ({ ...prev, [dept]: list }))
    setDeptStatuses(prev => ({ ...prev, [dept]: 'completed_conditions' }))
    setConditionsModalDept(null)
    setHasChanges(true)
    addLog(`Cambio de estado del departamento a "Completado con condiciones" (${list.length} condiciones)`)
  }

  const CHECKLISTS = { compliance: COMPLIANCE_CHECKLIST, fraud: FRAUD_CHECKLIST, finances: FINANCES_CHECKLIST, sales: SALES_CHECKLIST, legal: LEGAL_CHECKLIST, kickoff: KICKOFF_CHECKLIST }

  const handleCheck = (idx) => {
    const list = CHECKLISTS[activeDept] || []
    const item = list[idx] || ''
    const label = typeof item === 'string' ? item : item.label
    const sharedId = typeof item === 'object' ? item.sharedId : null
    const wasChecked = (checkedItems[activeDept] || new Set()).has(idx)
    const logText = wasChecked ? `'${label}' desmarcado` : `'${label}' se ha marcado como lista`
    addLog(logText)
    setHasChanges(true)

    setCheckedItems(prev => {
      const result = { ...prev }
      // Update current dept
      const next = new Set(prev[activeDept] || [])
      if (next.has(idx)) next.delete(idx); else next.add(idx)
      result[activeDept] = next

      // Sync shared items across departments
      if (sharedId) {
        Object.entries(CHECKLISTS).forEach(([dept, deptList]) => {
          if (dept === activeDept) return
          deptList.forEach((deptItem, deptIdx) => {
            const dId = typeof deptItem === 'object' ? deptItem.sharedId : null
            if (dId === sharedId) {
              const deptSet = new Set(result[dept] || [])
              if (wasChecked) deptSet.delete(deptIdx); else deptSet.add(deptIdx)
              result[dept] = deptSet
            }
          })
        })
        // Add log to shared department too
        Object.entries(CHECKLISTS).forEach(([dept, deptList]) => {
          if (dept === activeDept) return
          deptList.forEach((deptItem) => {
            const dId = typeof deptItem === 'object' ? deptItem.sharedId : null
            if (dId === sharedId) {
              setActivityLogs(p => ({
                ...p,
                [dept]: [{ text: logText, user: USER_NAME, date: formatNow() }, ...(p[dept] || [])],
              }))
            }
          })
        })
      }
      return result
    })
  }

  const handleWaive = (idx) => {
    const list = CHECKLISTS[activeDept] || []
    const wasWaived = (waivedItems[activeDept] || new Set()).has(idx)
    const item = list[idx] || ''
    const label = typeof item === 'string' ? item : item.label
    addLog(wasWaived ? `'${label}' exención deshecha` : `'${label}' marcado como eximido`)
    setHasChanges(true)
    setWaivedItems(prev => {
      const next = new Set(prev[activeDept] || [])
      if (next.has(idx)) next.delete(idx); else next.add(idx)
      return { ...prev, [activeDept]: next }
    })
  }

  const currentDept = DEPARTMENTS.find(d => d.key === activeDept)

  return (
    <>
      {/* Sticky breadcrumbs + tabs */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA] pb-2">
        <div className="flex items-center gap-1.5 mb-3 pt-2">
          <Link to="/clients" className="text-[14px] text-[#868e96] font-medium no-underline hover:underline">Clients</Link>
          <span className="text-[14px] text-[#dee2e6]">/</span>
          <span className="text-[14px] text-[#101828] font-medium">Efecty</span>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-[#dee2e6] rounded-[16px] p-4">
        {/* Tabs row - segmented style */}
        <div className="flex items-center mb-4 sticky top-[52px] z-20 bg-white pt-1 pb-2">
          <div className="inline-flex items-center gap-0 bg-white border border-[#E5E7EB] rounded-[10px] p-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-[7px] text-[13px] border-none cursor-pointer whitespace-nowrap rounded-[8px] transition-all ${
                    isActive
                      ? 'bg-[#180047] text-white font-medium'
                      : 'bg-transparent text-[#374151] font-normal hover:bg-[#F9FAFB]'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </div>

        {activeTab === 'Revisión por áreas' && (
          <div className="flex gap-4">
            {/* Department sidebar */}
            <div className="w-[280px] shrink-0 self-start sticky top-[100px]">
              <div className="flex flex-col">
                {DEPARTMENTS.map((dept) => {
                  const isActive = activeDept === dept.key
                  return (
                    <button
                      key={dept.key}
                      onClick={() => setActiveDept(dept.key)}
                      className={`flex items-center gap-2 px-3 py-2 text-left border-none cursor-pointer w-full transition-colors rounded-[8px] ${
                        isActive ? 'bg-[#f8f9fa]' : 'bg-transparent hover:bg-[#f8f9fa]'
                      }`}
                    >
                      <DeptIcon deptKey={dept.key} />
                      <span className={`text-[14px] leading-[20px] ${
                        isActive ? 'text-black font-semibold' : 'text-[#212529]'
                      }`}>
                        {dept.name}
                      </span>
                      <StatusDot status={deptStatuses[dept.key]} />
                      <span className="flex-1" />
                      {isActive && (
                        <ChevronRight size={16} className="text-[#9CA3AF] shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Department content */}
            <div className="flex-1 min-w-0">
              {/* Sticky Header */}
              <div className="sticky top-[100px] z-10 bg-white pt-2 pb-1">
              {/* Header: Title | Right side (Edit + Status) */}
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-[18px] font-semibold text-[#0A0B0D] m-0">
                  {currentDept?.name === 'Compliance' ? 'Compliance Review' : currentDept?.name}
                </h2>
                <div className="flex items-center gap-3">
                  {activeDept === 'fraud' && fraudSnapshots.length > 0 && (
                    <>
                      <select
                        value={activeFraudVersion}
                        onChange={e => setActiveFraudVersion(e.target.value)}
                        className="border border-[#E5E7EB] rounded-full px-4 h-[34px] text-[13px] font-medium text-[#0A0B0D] bg-white outline-none cursor-pointer"
                      >
                        <option value="current">{currentFraudVersionName}</option>
                        {fraudSnapshots.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <div className="w-px h-6 bg-[#E5E7EB]" />
                    </>
                  )}
                  <StatusDropdown
                    deptStatus={deptStatuses[activeDept]}
                    onStatusChange={handleStatusChange}
                    disabled={!isEditing}
                  />
                  {!isEditing ? (
                    !(activeDept === 'fraud' && isViewingFraudSnapshot) && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-[13px] font-medium text-white bg-[#180047] px-5 py-2 rounded-full border-none cursor-pointer hover:bg-[#2a0066] transition-colors"
                      >
                        Editar
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        addLog('Cambios guardados')
                        if (activeDept === 'fraud' && fraudReview.alertar && !isViewingFraudSnapshot) {
                          setFraudShowBanner(true)
                        }
                      }}
                      className="text-[13px] font-medium px-5 py-2 rounded-full border-none text-white bg-[#180047] cursor-pointer hover:bg-[#2a0066] transition-colors"
                    >
                      Guardar cambios
                    </button>
                  )}
                </div>
              </div>

              {/* Inner tabs: Information | Activity */}
              <div className="flex items-center border-b border-[#E5E7EB] mb-5">
                {['information', 'activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInnerTab(tab)}
                    className={`px-4 py-2.5 text-[13px] border-none bg-transparent cursor-pointer -mb-px border-b-2 transition-colors ${
                      innerTab === tab
                        ? 'border-b-[#180047] text-[#0A0B0D] font-medium'
                        : 'border-b-transparent text-[#6B7280] hover:text-[#0A0B0D]'
                    }`}
                  >
                    {tab === 'information' ? 'Information' : 'Activity'}
                  </button>
                ))}
              </div>
              </div>{/* end fixed header */}

              {/* Content based on inner tab */}
              {innerTab === 'information' && (
                <>
                  {activeDept === 'compliance' && (isEditing
                    ? <ComplianceEdit
                        checkedItems={checkedItems.compliance}
                        onCheck={handleCheck}
                        waivedItems={waivedItems.compliance}
                        onWaive={handleWaive}
                        addLog={addLog}
                        subChecked={complianceSubChecked}
                        subWaived={complianceSubWaived}
                        onSubCheck={handleComplianceSubCheck}
                        onSubWaive={handleComplianceSubWaive}
                        onToggleAllSubs={handleComplianceToggleAllSubs}
                        salesRequested={complianceSalesRequested}
                        onRequestSalesConfirm={handleComplianceSalesConfirm}
                      />
                    : <ComplianceView
                        checkedItems={checkedItems.compliance}
                        waivedItems={waivedItems.compliance}
                        subChecked={complianceSubChecked}
                        subWaived={complianceSubWaived}
                        salesRequested={complianceSalesRequested}
                      />
                  )}
                  {activeDept === 'fraud' && (
                    <>
                      {fraudShowBanner && !isViewingFraudSnapshot && (
                        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-[10px] bg-[#F5F6FA] mb-4">
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-[#0A0B0D] m-0">Review requerida</p>
                            <p className="text-[13px] text-[#6B7280] mt-0.5">Este departamento requiere una nueva revisión periódica</p>
                          </div>
                          <button
                            onClick={handleStartFraudReview}
                            className="text-[13px] font-medium text-white bg-[#180047] px-5 py-2 rounded-full border-none cursor-pointer hover:bg-[#2a0066] whitespace-nowrap shrink-0"
                          >
                            Iniciar
                          </button>
                        </div>
                      )}
                      {isViewingFraudSnapshot && currentFraudSnapshot
                        ? <FraudView checkedItems={currentFraudSnapshot.checked} waivedItems={currentFraudSnapshot.waived} review={currentFraudSnapshot.review} />
                        : (isEditing
                          ? <FraudEdit checkedItems={checkedItems.fraud} onCheck={handleCheck} waivedItems={waivedItems.fraud} onWaive={handleWaive} addLog={addLog} review={fraudReview} onReviewChange={setFraudReview} />
                          : <FraudView checkedItems={checkedItems.fraud} waivedItems={waivedItems.fraud} review={fraudReview} />
                        )
                      }
                    </>
                  )}
                  {activeDept === 'finances' && (isEditing
                    ? <FinancesEdit checkedItems={checkedItems.finances} onCheck={handleCheck} waivedItems={waivedItems.finances} onWaive={handleWaive} addLog={addLog} />
                    : <FinancesView checkedItems={checkedItems.finances} waivedItems={waivedItems.finances} />
                  )}
                  {activeDept === 'sales' && (isEditing
                    ? <SalesEdit checkedItems={checkedItems.sales} onCheck={handleCheck} waivedItems={waivedItems.sales} onWaive={handleWaive} addLog={addLog} />
                    : <SalesView checkedItems={checkedItems.sales} waivedItems={waivedItems.sales} />
                  )}
                  {activeDept === 'legal' && (isEditing
                    ? <LegalEdit checkedItems={checkedItems.legal} onCheck={handleCheck} waivedItems={waivedItems.legal} onWaive={handleWaive} addLog={addLog} />
                    : <LegalView checkedItems={checkedItems.legal} waivedItems={waivedItems.legal} />
                  )}
                  {activeDept === 'kickoff' && (isEditing
                    ? <KickoffEdit checkedItems={checkedItems.kickoff} onCheck={handleCheck} waivedItems={waivedItems.kickoff} onWaive={handleWaive} addLog={addLog} />
                    : <KickoffView checkedItems={checkedItems.kickoff} waivedItems={waivedItems.kickoff} />
                  )}
                  {!['compliance','fraud','finances','sales','legal','kickoff'].includes(activeDept) && <PlaceholderDept name={currentDept?.name} isEditing={isEditing} />}
                </>
              )}

              {innerTab === 'activity' && (
                <ActivityPanel logs={activityLogs[activeDept]} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'Resumen' && (() => {
          const EmptySection = () => (
            <div className="flex flex-col items-start gap-2 p-5 bg-[#F9FAFB] rounded-[10px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p className="text-[14px] font-semibold text-[#0A0B0D]">Aun no disponible</p>
              <p className="text-[13px] text-[#9CA3AF]">Los datos aparecerán cuando el cliente esté activo</p>
            </div>
          )
          const DEPT_LABELS = { compliance: 'Compliance', fraud: 'Fraud', finances: 'Finance', sales: 'Sales', legal: 'Legal and Contract', kickoff: 'Kickoff & Integration', golive: 'Go Live' }
          const conditionsToShow = Object.entries(deptConditions)
            .filter(([dept, list]) => list?.length > 0 && deptStatuses[dept] === 'completed_conditions')
          return (
            <div className="flex flex-col gap-5">
              {conditionsToShow.length > 0 && (
                <div className="flex flex-col gap-3">
                  {conditionsToShow.map(([dept, list]) => (
                    <ConditionsBanner
                      key={dept}
                      title={`${DEPT_LABELS[dept] || dept} — Aprobado con condiciones`}
                      conditions={list}
                    />
                  ))}
                </div>
              )}
              {/* General Details */}
              <div className="border border-[#E5E7EB] rounded-[8px] p-5 bg-white">
                <h3 className="text-[15px] font-semibold text-[#0A0B0D] mb-5">General Details</h3>
                <div className="grid grid-cols-6 gap-x-4 gap-y-5">
                  <InfoField label="Name" value="Efecty" />
                  <InfoField label="Client ID" value="cli-efty789xyz456abc" />
                  <InfoField label="Tenant ID" value="efecty.com" />
                  <InfoField label="Fecha de solicitud" value="22/12/2025, 10:17:44" />
                  <div className="relative group/tip">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[12px] text-[#6B7280]">Fecha de go-live</span>
                      <Info size={12} className="text-[#D1D5DB]" />
                    </div>
                    <p className="text-[13px] text-[#0A0B0D] font-medium">22/02/2025</p>
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed">
                      Fecha disponible cuando el cliente esté activo
                      <div className="absolute top-full left-6 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[12px] text-[#6B7280] block mb-1">Status</span>
                    <span className="text-[10px] font-semibold uppercase px-3 py-1 rounded-full bg-[rgba(250,176,5,0.1)] border border-[#fab005] text-[#fab005]">EN PROGRESO</span>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-x-4 gap-y-5 mt-5">
                  <InfoField label="Fraud Prevention/R..." value="22/12/2025, 10:17:44" />
                  <InfoField label="Country" value="COL - Bogotá" />
                  <InfoField label="Language Code" value="es" />
                  <InfoField label="Client Type" value="PRODUCTIVE" />
                  <InfoField label="Created At" value="-" />
                </div>
              </div>

              {/* Auth + Style row */}
              <div className="grid grid-cols-2 gap-5">
                <div className="border border-[#E5E7EB] rounded-[8px] p-5 bg-white">
                  <h3 className="text-[15px] font-semibold text-[#0A0B0D] mb-2">Authentication Information</h3>
                  <EmptySection />
                </div>
                <div className="border border-[#E5E7EB] rounded-[8px] p-5 bg-white">
                  <h3 className="text-[15px] font-semibold text-[#0A0B0D] mb-2">Style Information</h3>
                  <EmptySection />
                </div>
              </div>

              {/* Contacts + Organization row */}
              <div className="grid grid-cols-2 gap-5">
                <div className="border border-[#E5E7EB] rounded-[8px] p-5 bg-white">
                  <h3 className="text-[15px] font-semibold text-[#0A0B0D] mb-2">Contacts</h3>
                  <EmptySection />
                </div>
                <div className="border border-[#E5E7EB] rounded-[8px] p-5 bg-white">
                  <h3 className="text-[15px] font-semibold text-[#0A0B0D] mb-2">Organization</h3>
                  <EmptySection />
                </div>
              </div>
            </div>
          )
        })()}

        {activeTab === 'Features' && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Merchants Engine', Icon: Store, status: 'enabled', desc: 'Gestión avanzada de jerarquías multinivel, comisiones personalizadas y onboarding automatizado.', badge: 'INCLUIDO EN ACUERDO' },
              { name: '3D Secure (3DS)', Icon: ShieldCheck, status: 'enabled', desc: 'Autenticación reforzada para reducir contracargos y cumplir con normativas internacionales.', fee: 'U$D 0.02' },
              { name: 'Account Updater (ABU)', Icon: KeyRound, status: 'disabled', desc: 'Autenticación reforzada para reducir contracargos y cumplir con normativas internacionales.' },
              { name: 'Settlement Engine', Icon: Settings, status: 'disabled', desc: 'Motor de liquidación flexible para dispersión de fondos a múltiples cuentas bancarias.' },
              { name: 'Fraud Prevention', Icon: ShieldAlert, status: 'disabled', desc: 'Análisis avanzado de transacciones con machine learning para detectar y prevenir fraudes en tiempo real.' },
              { name: 'KYB/KYC Checks', Icon: UserCheck, status: 'disabled', desc: 'Identity verification for merchants and customers.' },
              { name: 'Payment Links', Icon: LinkIcon, status: 'disabled', desc: 'Genera enlaces de pago seguros para enviar por WhatsApp, correo o redes sociales.' },
            ].map((f, i) => (
              <div key={i} className="border border-[#E5E7EB] rounded-[12px] p-4 bg-white flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <f.Icon size={18} className="text-[#374151] shrink-0" />
                  <span className="text-[14px] font-semibold text-[#0A0B0D]">{f.name}</span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ml-auto ${
                    f.status === 'enabled'
                      ? 'bg-[#d4edda] text-[#155724] border border-[#28a745]'
                      : 'bg-[#F3F4F6] text-[#6B7280] border border-[#D1D5DB]'
                  }`}>
                    {f.status === 'enabled' ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-[18px] flex-1">{f.desc}</p>
                {f.badge && (
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]">{f.badge}</span>
                  </div>
                )}
                {f.fee && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-[#fce4ec] text-[#c62828] border border-[#ef9a9a]">FEE ADICIONAL</span>
                    <span className="text-[12px] text-[#374151] font-medium">{f.fee}</span>
                    <Info size={12} className="text-[#9CA3AF]" />
                  </div>
                )}
                {!f.badge && !f.fee && f.status === 'disabled' && <div className="mt-3" />}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Contactos' && <ContactsTab />}

        {activeTab === 'Documentos' && <DocumentsTab />}

        {activeTab === 'Timeline' && (() => {
          const defaultTimeline = [
            { title: "Se marcó 'Documentación KYC' como completada", user: "Ingrith Velandia", dept: "Compliance", date: "Mar 10, 09:14" },
            { title: "Se agregó link al reporte de fraude", user: "Santiago Reez", dept: "Fraud & Finance", date: "Mar 11, 11:20" },
            { title: "Se subió documento NDA", user: "Ingrith Velandia", dept: "Compliance", date: "Mar 12, 09:00" },
            { title: "Se agregó link al reporte de fraude", user: "Carlos Méndez", dept: "Fraud & Finance", date: "Mar 12, 09:30" },
            { title: "Se cambió el estado de Legal and Contract a 'En progreso'", user: "Agustina Romagnoli", dept: "Legal and Contract", date: "Mar 13, 10:15" },
            { title: "Se marcó 'Revisión documental corporativa' como completada", user: "Celeste Carrizo", dept: "Compliance", date: "Mar 14, 14:00" },
            { title: "Se agregó nota a 'Validación de la estructura accionaria'", user: "Ingrith Velandia", dept: "Compliance", date: "Mar 15, 08:45" },
            { title: "Se subió contrato firmado", user: "Santiago Reez", dept: "Sales", date: "Mar 15, 16:30" },
          ]
          const deptNames = { compliance: 'Compliance', fraud: 'Fraud', finances: 'Finances', sales: 'Sales', legal: 'Legal and Contract', kickoff: 'Kickoff & Integration' }
          const realLogs = Object.entries(activityLogs).flatMap(([dept, logs]) =>
            logs.map(l => ({ title: l.text, user: l.user, dept: deptNames[dept] || dept, date: l.date }))
          ).sort((a, b) => b.date.localeCompare(a.date))
          const items = [...realLogs, ...defaultTimeline]

          return (
            <div className="max-w-[700px]">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center shrink-0 w-6">
                    {i === 0 ? (
                      <div className="w-[20px] h-[20px] rounded-full border-[3px] border-[#5a6dd7] bg-white shrink-0 z-10" />
                    ) : (
                      <div className="w-[12px] h-[12px] rounded-full border-[2px] border-[#D1D5DB] bg-white shrink-0 z-10 mt-1" />
                    )}
                    {i < items.length - 1 && (
                      <div className="w-[2px] flex-1 bg-[#E5E7EB] min-h-[40px]" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-8 ${i === 0 ? '-mt-0.5' : ''}`}>
                    <p className="text-[14px] font-semibold text-[#0A0B0D] leading-snug">{item.title}</p>
                    <p className="text-[13px] text-[#9CA3AF] mt-1">
                      {item.user}{item.dept ? ` · ${item.dept}` : ''}
                    </p>
                    <p className="text-[13px] text-[#9CA3AF]">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {conditionsModalDept && (
        <ConditionsModal
          initialConditions={deptConditions[conditionsModalDept] || []}
          onCancel={() => setConditionsModalDept(null)}
          onConfirm={handleConfirmConditions}
        />
      )}
    </>
  )
}
