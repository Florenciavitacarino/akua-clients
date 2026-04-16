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
  { key: 'review', name: '1st Review', status: 'pending' },
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
      isSi ? 'bg-[#d1fae5] text-[#047857]' : 'bg-[#fee2e2] text-[#dc2626]'
    }`}>
      {isSi ? 'Sí' : 'No'}
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
      <div className="bg-white border border-[#E5E7EB] rounded-[8px] w-full h-full flex flex-col">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          {activityIcon}
          <p className="text-[14px] font-semibold text-[#0A0B0D]">Actividad</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
          <img src="/empty-activity.svg" alt="No activity" className="w-full max-w-[200px]" />
          <p className="text-[14px] font-semibold text-[#0A0B0D] mt-4">Aún no se registró actividad</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Las acciones que realices aparecerán aquí.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[8px] w-full h-full">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        {activityIcon}
        <p className="text-[14px] font-semibold text-[#0A0B0D]">Actividad</p>
      </div>
      <div className="px-4 pb-3 max-h-[500px] overflow-y-auto">
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
                  className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-[#EDF0FF] px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#dde3ff]"
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
    title: '1 — KYB: revisión documental',
    subItems: [
      'Estatutos y modificaciones',
      'Certificado de existencia y representación',
      'Regularidad fiscal y laboral',
      'Licencias operativas',
      'Estados financieros auditados',
    ],
  },
  {
    title: '2 — Estructura societaria y UBO',
    subItems: [
      'Organigrama completo',
      'UBOs identificados',
      'Estructuras complejas documentadas (offshore, trusts, camadas)',
      'Documentos societarios adjuntos',
    ],
  },
  {
    title: '3 — KYC de representantes y firmantes',
    subItems: [
      'Lista de firmantes/rep legales (nombre + rol)',
      'ID foto frente — por persona',
      'ID foto dorso — por persona',
    ],
    note: 'Si falta alguno → bloquea avance',
  },
  {
    title: '4 — Screening listas restrictivas',
    subItems: [
      'Empresa verificada',
      'Rep legal verificado',
      'UBOs verificados',
    ],
    note: 'Futuro API Noto',
  },
  {
    title: '5 — Evaluación del negocio',
    subItems: [
      'Revisión sitio web con Ballerine (link + resultado)',
      'MCC contrastado',
      'Actividades prohibidas verificadas',
    ],
  },
  {
    title: '6 — Perfil de riesgo',
    special: 'risk_profile',
  },
  {
    title: '7 — Programa de compliance',
    subtitle: 'Solo Payfac/PSP/Fintech, no blocker',
    subItems: [
      'Políticas AML/KYC revisadas',
      'Estructura interna de compliance revisada',
      'Histórico regulatorio revisado',
    ],
  },
  {
    title: '8 — Final decision',
    special: 'final_decision',
  },
  {
    title: '9 — Inscripción en franquicias',
    subtitle: 'Disponible post go-live',
    special: 'franchise_signup',
  },
]

const COMPLIANCE_CHECKLIST = COMPLIANCE_STEPS.map(s => ({ label: s.title }))

/* ─── Compliance Sub-item (checkbox row with expand panel) ─── */
function ComplianceSubItem({ label, checked, waived, isOpen, onToggle, onMarkDone, onWaive, addLog, editable, onRequestSales, requestedToSales }) {
  const [linkValue, setLinkValue] = useState('')
  const [noteValue, setNoteValue] = useState('')

  return (
    <div className={`rounded-[8px] border border-[#E5E7EB] bg-white ${isOpen ? 'shadow-[0_1px_4px_rgba(0,0,0,0.06)]' : ''}`}>
      <div
        className={`flex items-center gap-3 cursor-pointer ${isOpen ? 'px-4 pt-3 pb-2' : 'px-4 py-2.5'}`}
        onClick={() => onToggle?.()}
      >
        <div
          className={`w-[18px] h-[18px] rounded-[4px] shrink-0 flex items-center justify-center ${
            waived
              ? 'border-[1.5px] border-[#E5E7EB] bg-[#F3F4F6] cursor-not-allowed opacity-50'
              : editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
          } ${checked && !waived ? 'bg-[#180047]' : !waived ? 'border-[1.5px] border-[#D1D5DB] bg-white' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (editable && !waived) onMarkDone() }}
        >
          {checked && !waived && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className={`text-[13px] ${checked ? 'text-[#374151]' : 'text-[#1F2937]'}`}>{label}</span>
        {waived && (
          <span className="text-[10px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2 py-0.5 rounded-full uppercase tracking-wide">EXIMIDO</span>
        )}
        {requestedToSales && (
          <span className="text-[10px] font-semibold text-[#dc6038] bg-[#FFE9D9] px-2 py-0.5 rounded-full uppercase tracking-wide">SOLICITADO A SALES</span>
        )}
        <span className="flex-1" />
        {isOpen
          ? <ChevronUp size={16} className="text-[#374151] shrink-0" />
          : <ChevronDown size={16} className="text-[#9CA3AF] shrink-0" />
        }
      </div>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-3.5 py-2.5 bg-white focus-within:border-[#5a6dd7] transition-colors">
            <Link2 size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              type="url"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="Add document link"
              disabled={!editable}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] placeholder:text-[#9CA3AF] min-w-0 disabled:cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="Write a note here"
            rows={3}
            disabled={!editable}
            className="w-full border border-[#E5E7EB] rounded-[12px] px-3.5 py-3 text-[13px] bg-white outline-none focus:border-[#5a6dd7] placeholder:text-[#9CA3AF] resize-none disabled:cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
          {editable && (
            <div className="flex items-center gap-3">
              <button
                className="text-[13px] font-semibold text-white bg-[#180047] px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#2a0066] transition-colors"
                onClick={(e) => { e.stopPropagation(); onMarkDone(); onToggle?.() }}
              >
                Guardar
              </button>
              {waived ? (
                <button
                  className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-white px-5 py-2.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB]"
                  onClick={(e) => { e.stopPropagation(); onWaive() }}
                >
                  <RefreshCw size={14} /> Deshacer
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-[#EDF0FF] px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-[#dde3ff]"
                  onClick={(e) => { e.stopPropagation(); onWaive() }}
                >
                  <Ban size={14} /> Eximir
                </button>
              )}
              <span className="flex-1" />
              <button
                className="flex items-center gap-1 text-[13px] font-medium text-[#180047] bg-transparent border-none cursor-pointer hover:text-[#2a0066]"
                onClick={(e) => { e.stopPropagation(); onRequestSales?.(label) }}
              >
                Solicitar a sales <ArrowUpRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Compliance Step (outer collapsible card) ─── */
function ComplianceStepCard({ step, stepIdx, isOpen, onToggle, subChecked, onSubCheck, subWaived, onSubWaive, onToggleAllSubs, onRequestSales, salesRequested, addLog, editable }) {
  const [openSubIdx, setOpenSubIdx] = useState(null)
  // Auto-check main when all sub-items are checked or eximidos
  const totalSubs = step.subItems?.length || 0
  const completedSubs = totalSubs
    ? step.subItems.filter((_, j) => subChecked.has(j) || subWaived.has(j)).length
    : 0
  const checked = totalSubs > 0 && completedSubs === totalSubs
  return (
    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] mb-3">
      <div
        className={`flex items-center gap-3 cursor-pointer ${isOpen ? 'px-4 pt-4 pb-3' : 'px-4 py-3'}`}
        onClick={onToggle}
      >
        <div
          className={`w-[20px] h-[20px] rounded-[5px] shrink-0 flex items-center justify-center ${
            editable && totalSubs > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
          } ${checked ? 'bg-[#180047]' : 'border-[1.5px] border-[#D1D5DB] bg-white'}`}
          onClick={(e) => {
            e.stopPropagation()
            if (editable && totalSubs > 0 && onToggleAllSubs) onToggleAllSubs(!checked)
          }}
        >
          {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className="text-[14px] font-medium text-[#0A0B0D]">{step.title}</span>
        <span className="flex-1" />
        {isOpen
          ? <ChevronUp size={18} className="text-[#374151] shrink-0" />
          : <ChevronDown size={18} className="text-[#9CA3AF] shrink-0" />
        }
      </div>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {step.subtitle && <p className="text-[12px] text-[#6B7280] italic -mt-1 mb-1">{step.subtitle}</p>}

          {step.subItems && step.subItems.map((sub, j) => (
            <ComplianceSubItem
              key={j}
              label={sub}
              checked={subChecked.has(j)}
              waived={subWaived.has(j)}
              isOpen={openSubIdx === j}
              onToggle={() => setOpenSubIdx(prev => prev === j ? null : j)}
              onMarkDone={() => onSubCheck(j)}
              onWaive={() => onSubWaive(j)}
              addLog={addLog}
              editable={editable}
              onRequestSales={onRequestSales ? (label) => onRequestSales(stepIdx, j, label) : undefined}
              requestedToSales={salesRequested?.has?.(`${stepIdx}.${j}`)}
            />
          ))}

          {step.special === 'risk_profile' && <RiskProfileFields editable={editable} />}
          {step.special === 'final_decision' && <FinalDecisionFields editable={editable} />}
          {step.special === 'franchise_signup' && <FranchiseSignupFields editable={editable} />}

          {step.note && (
            <p className="text-[12px] text-[#6B7280] italic mt-1">{step.note}</p>
          )}
        </div>
      )}
    </div>
  )
}

function RiskProfileFields({ editable }) {
  const [classification, setClassification] = useState('')
  const [drivers, setDrivers] = useState('')
  if (editable) {
    return (
      <div className="flex flex-col gap-3 bg-white border border-[#E5E7EB] rounded-[8px] p-4">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Clasificación</span>
          <select value={classification} onChange={e => setClassification(e.target.value)} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option value="">Seleccionar</option>
            <option>Bajo</option><option>Medio</option><option>Alto</option>
          </select>
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Drivers</span>
          <textarea value={drivers} onChange={e => setDrivers(e.target.value)} placeholder="Jurisdicción, industria, producto, canal, tipo de cliente" rows={3} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 py-2 text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white resize-none placeholder:text-[#9CA3AF]" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 bg-white border border-[#E5E7EB] rounded-[8px] p-4">
      <InfoField label="Clasificación" value={classification} />
      <InfoField label="Drivers" value={drivers} />
    </div>
  )
}

function FinalDecisionFields({ editable }) {
  const [decision, setDecision] = useState('')
  const [date, setDate] = useState('')
  const [owner, setOwner] = useState('')
  if (editable) {
    return (
      <div className="grid grid-cols-3 gap-3 bg-white border border-[#E5E7EB] rounded-[8px] p-4">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Decisión</span>
          <select value={decision} onChange={e => setDecision(e.target.value)} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option value="">Seleccionar</option>
            <option>Aprobado</option>
            <option>Aprobado con condiciones</option>
            <option>Reprobado</option>
          </select>
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Fecha próxima revisión</span>
          <input type="text" value={date} onChange={e => setDate(e.target.value)} placeholder="DD/MM/AAAA" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Responsable de la decisión</span>
          <input type="text" value={owner} onChange={e => setOwner(e.target.value)} placeholder="Nombre" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        </div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-3 bg-white border border-[#E5E7EB] rounded-[8px] p-4">
      <InfoField label="Decisión" value={decision} />
      <InfoField label="Fecha próxima revisión" value={date} />
      <InfoField label="Responsable de la decisión" value={owner} />
    </div>
  )
}

function FranchiseSignupFields({ editable }) {
  const [mc, setMc] = useState('')
  const [visa, setVisa] = useState('')
  if (editable) {
    return (
      <div className="grid grid-cols-2 gap-3 bg-white border border-[#E5E7EB] rounded-[8px] p-4">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Inscripción Mastercard — ID de registro</span>
          <input type="text" value={mc} onChange={e => setMc(e.target.value)} placeholder="MC-ID" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Inscripción Visa — ID de registro</span>
          <input type="text" value={visa} onChange={e => setVisa(e.target.value)} placeholder="VISA-ID" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
        </div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3 bg-white border border-[#E5E7EB] rounded-[8px] p-4">
      <InfoField label="Inscripción Mastercard — ID de registro" value={mc} />
      <InfoField label="Inscripción Visa — ID de registro" value={visa} />
    </div>
  )
}

function ComplianceEdit({ addLog, subChecked, subWaived, onSubCheck, onSubWaive, onToggleAllSubs, salesRequested, onRequestSalesConfirm }) {
  const [openStepIdx, setOpenStepIdx] = useState(0)
  const [requestModal, setRequestModal] = useState(null) // { stepIdx, subIdx, label }
  return (
    <div className="flex flex-col">
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
    <div className="flex flex-col">
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
  { label: "Datos de equipo de riesgo/prevención de fraude 1" },
  { label: "Vertical de negocio" },
  { label: "Perfil Transaccional Esperado", tag: "FINANCE", sharedId: "perfil_transaccional" },
  { label: "Tipo de Operatoria" },
  { label: "Historial de Riesgo", tag: "FINANCE", sharedId: "historial_riesgo" },
  { label: "Apetito de Riesgo del Cliente" },
]

const FRECUENCIA_OPTIONS = ['30 días', '60 días', '90 días', '180 días']
const ALERTAR_OPTIONS = ['15 días', '20 días', '25 días']

function ProximaRevision({ review, onReviewChange, editable }) {
  if (editable) {
    return (
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Próxima revisión</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Define cuándo se debe revisar este departamento para este cliente</p>
        <div className="grid grid-cols-3 gap-x-6">
          <div>
            <span className="text-[12px] text-[#374151] font-medium block mb-1">Frecuencia de revisión</span>
            <select
              value={review.frecuencia || ''}
              onChange={e => onReviewChange({ ...review, frecuencia: e.target.value })}
              className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white"
            >
              <option value="">Seleccionar</option>
              {FRECUENCIA_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <span className="text-[12px] text-[#374151] font-medium block mb-1">Alertar con anticipación</span>
            <select
              value={review.alertar || ''}
              onChange={e => onReviewChange({ ...review, alertar: e.target.value })}
              className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white"
            >
              <option value="">Seleccionar</option>
              {ALERTAR_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        {review.alertar && (
          <div className="flex items-center gap-2 mt-4 text-[12px] text-[#6B7280]">
            <Info size={14} className="text-[#9CA3AF] shrink-0" />
            Con la anticipación configurada, aparecerá un aviso para iniciar la nueva review
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
      <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Próxima revisión</p>
      <p className="text-[12px] text-[#6B7280] mb-4">Define cuándo se debe revisar este departamento para este cliente</p>
      <div className="grid grid-cols-3 gap-x-6">
        <InfoField label="Frecuencia de revisión" value={review.frecuencia} />
        <InfoField label="Alertar con anticipación" value={review.alertar} />
      </div>
    </div>
  )
}

function FraudSections({ editable }) {
  // Form contents per section, used as children of SectionCard
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
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <TextInput label="Volumen mensual" placeholder="Text" info tooltip="Estimado por cantidad de transacciones" />
        <TextInput label="Monto procesado mensual" placeholder="Text" info tooltip="Estimado en USD" />
        <TextInput label="Ticket promedio USD" placeholder="1000 usd" />
        <TextInput label="Ticket mínimo USD" placeholder="400 usd" />
        <TextInput label="Ticket máximo USD" placeholder="1000 usd" />
        <TextInput label="Mix estimado" placeholder="Text" info tooltip="Tarjetas domésticas vs. internacionales" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Países de origen de tarjetas frecuentes</span>
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
    </>
  ) : (
    <>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <InfoField label="Volumen mensual" value="Text" info tooltip="Estimado por cantidad de transacciones" />
        <InfoField label="Monto procesado mensual" value="Text" info tooltip="Estimado en USD" />
        <InfoField label="Ticket promedio USD" value="8000 usd" />
        <InfoField label="Ticket mínimo USD" value="400 usd" />
        <InfoField label="Ticket máximo USD" value="1000 usd" />
        <InfoField label="Mix estimado" value="Text" info tooltip="Tarjetas domésticas vs. internacionales" />
        <div className="col-span-2">
          <TagPills label="Países de origen de tarjetas frecuentes" values={['Perú', 'Chile', 'Brasil']} />
        </div>
        <InfoField label="Monedas de transacción" value="Text" />
      </div>
    </>
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

  // Section 0 (Datos de equipo) has no form — link/note/buttons only
  const datosDeEquipo = null

  return [
    { content: datosDeEquipo, subtitle: null },
    { content: verticalDeNegocio, subtitle: 'Indicar el tipo de negocio principal del cliente. Esta información determina el nivel de riesgo base y los MCCs involucrados.' },
    { content: perfilTransaccional, subtitle: 'Esta sección permite calibrar los umbrales de monto y el mix de tarjetas.', info: true, tooltip: 'Estimado por cantidad de transacciones' },
    { content: tipoOperatoria, subtitle: 'Indicar cómo el cliente procesa sus pagos. Esta sección determina si aplica el Perfil D (recurrencia) y cómo se trata el primer cobro.' },
    { content: historialRiesgo, subtitle: 'Esta sección es obligatoria para clientes que migran desde otro procesador o que ya tienen operatoria previa.' },
    { content: apetitoRiesgo, subtitle: 'Indicar cómo el cliente prioriza entre seguridad y conversión, el Perfil D (recurrencia) y cómo se trata el primer cobro.' },
  ]
}

function FraudEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog, review, onReviewChange }) {
  const [openIdx, setOpenIdx] = useState(null)
  const sections = FraudSections({ editable: true })
  return (
    <>
      <div className="flex flex-col">
        {FRAUD_CHECKLIST.map((item, i) => {
          const sec = sections[i] || {}
          return (
            <SectionCard
              key={i}
              title={item.label}
              tag={item.tag}
              subtitle={sec.subtitle}
              info={sec.info}
              tooltip={sec.tooltip}
              checked={checkedItems.has(i)}
              waived={waivedItems.has(i)}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
              onMarkDone={() => onCheck(i)}
              onWaive={() => onWaive(i)}
              addLog={addLog}
              editable
            >
              {sec.content}
            </SectionCard>
          )
        })}
      </div>
      <ProximaRevision review={review} onReviewChange={onReviewChange} editable />
    </>
  )
}

function FraudView({ checkedItems, waivedItems, review }) {
  // In view mode, all sections with content are expanded by default
  const sections = FraudSections({ editable: false })
  const defaultOpen = new Set(FRAUD_CHECKLIST.map((_, i) => i).filter(i => sections[i]?.content !== null))
  const [openSet, setOpenSet] = useState(defaultOpen)
  const toggleIdx = (i) => setOpenSet(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })
  return (
    <>
      <div className="flex flex-col">
        {FRAUD_CHECKLIST.map((item, i) => {
          const sec = sections[i] || {}
          return (
            <SectionCard
              key={i}
              title={item.label}
              tag={item.tag}
              subtitle={sec.subtitle}
              info={sec.info}
              tooltip={sec.tooltip}
              checked={checkedItems.has(i)}
              waived={waivedItems.has(i)}
              isOpen={openSet.has(i)}
              onToggle={() => toggleIdx(i)}
              editable={false}
              hideLinkNote
            >
              {sec.content}
            </SectionCard>
          )
        })}
      </div>
      <ProximaRevision review={review || {}} editable={false} />
    </>
  )
}

/* ─── FINANCES CONTENT ─── */
const FINANCES_CHECKLIST = [
  { label: "Text here" },
  { label: "Text here" },
  { label: "Text here" },
  { label: "Text here" },
  { label: "Text here" },
  { label: "Text here" },
  { label: "Perfil Transaccional Esperado", tag: "FRAUD", sharedId: "perfil_transaccional" },
  { label: "Historial de Riesgo", tag: "FRAUD", sharedId: "historial_riesgo" },
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

function FinancesEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <div className="flex gap-4">
      {/* Left column: Checklist + Info administrativa (continuous) */}
      <div className="w-1/2 min-w-0 flex flex-col">
        {FINANCES_CHECKLIST.map((item, i) => (
          <ChecklistItemEdit
            key={i} label={item.label} tag={item.tag}
            checked={checkedItems.has(i)} waived={waivedItems.has(i)}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            onMarkDone={() => onCheck(i)}
            onWaive={() => onWaive(i)}
            addLog={addLog}
          />
        ))}

        {/* Info administrativa right after checkboxes */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-2">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Información administrativa</p>
          <TextInput label="Correo de facturación" placeholder="mail@mail.com" />
        </div>

        {/* Perfil Transaccional Esperado */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[14px] font-semibold text-[#0A0B0D]">Perfil Transaccional Esperado</p>
            <span className="relative group/ptef shrink-0">
              <Info size={14} className="text-[#9CA3AF] cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/ptef:opacity-100 transition-opacity pointer-events-none z-20">
                Estimado por cantidad de transacciones
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            </span>
          </div>
          <p className="text-[12px] text-[#6B7280] mb-4">Esta sección permite calibrar los umbrales de monto y el mix de tarjetas.</p>
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
        </div>

        {/* Historial de Riesgo */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Historial de Riesgo</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <RadioField label="Historial de procesamiento" />
            <RadioField label="Tasa de chargebacks" info tooltip="Promedio (últimos 3 meses)" />
            <RadioField label="Chargebacks > 0.9%" />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-5">
            <TextInput label="Fecha" placeholder="Mes" />
            <RadioField label="Participación de monitoreo" info tooltip="Entre Visa o Mastercard (VAMP, ECP, FMP)" />
            <RadioField label="Incidentes de fraude" />
          </div>
          <div className="mt-5">
            <TextInput label="Descripción del incidente" placeholder="Descripción del incidente" />
          </div>
        </div>
      </div>

      {/* Right column: Definición del colateral + Activity */}
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Definición del colateral</p>
          <DocLinkInput label="Certificado bancario" />
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">Estados Financieros</p>
          <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p className="text-[12px] text-[#6B7280]">incluir Balance Sheet e Income Statement más recientes.</p>
          </div>
          <DocLinkInput label="EEFF" />
          <DocLinkInput label="Balance sheet" />
          <DocLinkInput label="Income Statement" />
          <hr className="border-t border-[#E5E7EB] my-3" />
          <DocLinkInput label="Histórico transaccional" />
          <DocLinkInput label="Contracargos" />
        </div>
      </div>
    </div>
  )
}

function FinancesView({ checkedItems, waivedItems }) {
  return (
    <div className="flex gap-4">
      {/* Left column: Checklist + Info administrativa (continuous) */}
      <div className="w-1/2 min-w-0 flex flex-col">
        {FINANCES_CHECKLIST.map((item, i) => (
          <ChecklistItemView key={i} label={item.label} tag={item.tag} checked={checkedItems.has(i)} waived={waivedItems.has(i)} />
        ))}

        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-2">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Información administrativa</p>
          <InfoField label="Correo de facturación" value="mail@mail.com" />
        </div>

        {/* Perfil Transaccional Esperado */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[14px] font-semibold text-[#0A0B0D]">Perfil Transaccional Esperado</p>
            <span className="relative group/ptefv shrink-0">
              <Info size={14} className="text-[#9CA3AF] cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/ptefv:opacity-100 transition-opacity pointer-events-none z-20">
                Estimado por cantidad de transacciones
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            </span>
          </div>
          <p className="text-[12px] text-[#6B7280] mb-4">Esta sección permite calibrar los umbrales de monto y el mix de tarjetas.</p>
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
        </div>

        {/* Historial de Riesgo */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Historial de Riesgo</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoField label="Historial de procesamiento" value="Si" />
            <InfoField label="Tasa de chargebacks" value="Si" info tooltip="Promedio (últimos 3 meses)" />
            <InfoField label="Chargebacks > 0.9%" value="Si" />
            <InfoField label="Fecha" value="01/12/2023" />
            <InfoField label="Participación de monitoreo" value="Si" info tooltip="Entre Visa o Mastercard (VAMP, ECP, FMP)" />
            <InfoField label="Incidentes de fraude" value="No" />
          </div>
          <div className="mt-4">
            <InfoField label="Descripción del incidente" value="Descripción del incidente" />
          </div>
        </div>
      </div>

      {/* Right column: Definición del colateral + Activity */}
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Definición del colateral</p>
          <DocLinkInput label="Certificado bancario" disabled />
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">Estados Financieros</p>
          <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p className="text-[12px] text-[#6B7280]">incluir Balance Sheet e Income Statement más recientes.</p>
          </div>
          <DocLinkInput label="EEFF" disabled />
          <DocLinkInput label="Balance sheet" disabled />
          <DocLinkInput label="Income Statement" disabled />
          <hr className="border-t border-[#E5E7EB] my-3" />
          <DocLinkInput label="Histórico transaccional" disabled />
          <DocLinkInput label="Contracargos" disabled />
        </div>
      </div>
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

function SalesEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  const defaultSections = new Set([4, 5, 6]) // Info general, Docs, Config expanded by default
  const [openSet, setOpenSet] = useState(defaultSections)
  const toggleSection = (i) => setOpenSet(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })

  return (
    <div className="flex flex-col">
      {/* 4 checklist items */}
      {SALES_CHECKLIST.map((label, i) => (
        <SectionCard
          key={i}
          title={label}
          checked={checkedItems.has(i)}
          waived={waivedItems.has(i)}
          isOpen={openIdx === i}
          onToggle={() => setOpenIdx(prev => prev === i ? null : i)}
          onMarkDone={() => onCheck(i)}
          onWaive={() => onWaive(i)}
          addLog={addLog}
          editable
        />
      ))}

      {/* Información general */}
      <SectionCard
        title="Información general"
        checked={false}
        isOpen={openSet.has(4)}
        onToggle={() => toggleSection(4)}
        editable
        hideLinkNote
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <TextInput label="Nombre legal" placeholder="Nombre" />
          <TextInput label="Tenant" placeholder="20/03/2026" />
        </div>
        <TextInput label="Website" placeholder="www.hola.com" />
      </SectionCard>

      {/* Documentación */}
      <SectionCard
        title="Documentación"
        checked={false}
        isOpen={openSet.has(5)}
        onToggle={() => toggleSection(5)}
        editable
        hideLinkNote
      >
        {SALES_DOC_LABELS.map((label, i) => <UploadZone key={i} label={label} />)}
      </SectionCard>

      {/* Configuración del servicio */}
      <SectionCard
        title="Configuración del servicio"
        checked={false}
        isOpen={openSet.has(6)}
        onToggle={() => toggleSection(6)}
        editable
        hideLinkNote
      >
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Deal Type</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Processing</option><option>Acquiring</option><option>Issuing</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <TextInput label="3DS incluido" placeholder="No" />
          <TextInput label="Tap on Phone incluído" placeholder="Si" />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <TextInput label="Set Up Fee" placeholder="1000 USD" />
          <div>
            <span className="text-[12px] text-[#374151] font-medium block mb-1">Collteral</span>
            <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
              <option>Depósito</option><option>Garantía bancaria</option><option>Sin colateral</option>
            </select>
          </div>
        </div>
        <div className="bg-[#F9FAFB] rounded-[8px] p-3">
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Otros servicios</p>
          <div className="flex items-center gap-2">
            <select className="flex-1 border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
              <option>Seleccionar</option>
              {SALES_OTROS_SERVICIOS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="text-[12px] font-medium text-[#180047] bg-white px-3 py-1.5 rounded-full border border-[#180047] cursor-pointer hover:bg-[#F3F0FF] whitespace-nowrap shrink-0">+ Agregar otro</button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function SalesView({ checkedItems, waivedItems }) {
  return (
    <div className="flex gap-4">
      {/* Left column: collapsed items + Configuración */}
      <div className="w-1/2 min-w-0 flex flex-col">
        {SALES_CHECKLIST.map((label, i) => (
          <SectionCard
            key={i}
            title={label}
            checked={checkedItems.has(i)}
            waived={waivedItems.has(i)}
            isOpen={false}
            onToggle={() => {}}
            editable={false}
            hideLinkNote
          />
        ))}
        {/* Configuración del servicio expanded */}
        <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-white mt-1">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Configuración del servicio</p>
          <div className="flex flex-col gap-3">
            <InfoField label="Deal Type" value="Processing" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoField label="3DS incluido" value="No" />
              <InfoField label="Tap on Phone incluído" value="Si" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoField label="Set Up Fee" value="1000 USD" />
              <InfoField label="Collteral" value="Depósito" />
            </div>
            <div className="bg-[#F9FAFB] rounded-[8px] p-3">
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Otros servicios</p>
              <EmptyBadge />
            </div>
          </div>
        </div>
      </div>
      {/* Right column: Documentación */}
      <div className="w-1/2 min-w-0">
        <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-white">
          <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Documentación</p>
          {SALES_DOC_LABELS.map((label, i) => <DocLinkInput key={i} label={label} disabled />)}
        </div>
      </div>
    </div>
  )
}

/* ─── LEGAL AND CONTRACT CONTENT ─── */
const LEGAL_CHECKLIST = [
  "Contrato firmado por ambas partes",
  "Depósito en garantía constituido",
  "NDA vigente",
  "Poderes del firmante verificados",
  "Cargos 3DS acordados",
  "Anexos I y II aceptados",
]

const LEGAL_DOC_LABELS = ['Certificados de Cámara de comercio', 'Poderes', 'Actas de asamblea', 'Histórico transaccional']

function LegalDocsPanel({ disabled }) {
  const Badge = ({ color, children }) => (
    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{
      background: color === 'green' ? '#d1fae5' : color === 'blue' ? '#dbeafe' : color === 'gray' ? '#F3F4F6' : '#fef3c7',
      color: color === 'green' ? '#047857' : color === 'blue' ? '#1e40af' : color === 'gray' ? '#6B7280' : '#b45309',
    }}>{children}</span>
  )
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
      <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Documentación</p>
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Cargo de Implementación</p>
      <DocLinkInput label="Certificados de Cámara de comercio" disabled={disabled} />
      <DocLinkInput label="Poderes" disabled={disabled} />
      <DocLinkInput label="Actas de asamblea" disabled={disabled} />
      <DocLinkInput label="Histórico transaccional" disabled={disabled} />
      <hr className="border-t border-[#E5E7EB] my-3" />
      <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Documentos de Constitución</p>
      <DocLinkInput label="" disabled={disabled} />
      <DocLinkInput label="" disabled={disabled} />
      <hr className="border-t border-[#E5E7EB] my-3" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Documentos del Contrato</p>
      <DocLinkInput label="Contrato V5 completo" disabled={disabled} />
      <p className="text-[13px] font-semibold text-[#0A0B0D] mt-3 mb-1.5">Anexo I – Descripción técnica y alcance</p>
      <DocLinkInput label="" disabled={disabled} />
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge color="green">99% Disponibilidad</Badge>
        <Badge color="green">{'<'}1S Autorización</Badge>
        <Badge color="blue">Visa & Mastercard</Badge>
        <Badge color="gray">PCI DSS · AML · KYC</Badge>
      </div>
      <p className="text-[13px] font-semibold text-[#0A0B0D] mt-3 mb-1.5">Anexo II – SLA</p>
      <DocLinkInput label="" disabled={disabled} />
      <div className="flex flex-wrap gap-1.5">
        <Badge color="yellow">Penalidad Máx. 30%</Badge>
        <Badge color="gray">Procesamiento Transaccional</Badge>
      </div>
    </div>
  )
}

function CargosCobroEdit() {
  return (
    <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
      <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Cargos y formas de cobro</p>

      {/* Cargo de implementación */}
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Cargo de Implementación</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <TextInput label="Monto" placeholder="USD 15.000  + IVA" info />
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Tipo de cambio</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Pago único</option>
          </select>
        </div>
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Estado</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
            <option>Pendiente</option>
            <option>Pagado</option>
          </select>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Facturación: 30 días post-firma o día siguiente del Kickoff (lo que ocurra primero).</p>
      </div>

      {/* Cargos recurrentes mensuales */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <div>
        <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Cargos Recurrentes Mensuales</p>
        <div className="flex items-stretch">
          {/* Adquirencia como Servicio - left */}
          <div className="flex-1 pr-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Adquirencia como Servicio</p>
            <div className="flex justify-between text-[11px] text-[#9CA3AF] mb-2 pb-2 border-b border-[#F3F4F6]">
              <span>Rango de transacciones</span><span>Monto negociado</span>
            </div>
            {['0 – 200K','200K – 1M','1M – 3M','+3M'].map((r) => (
              <div key={r} className="flex justify-between items-center py-2.5">
                <span className="text-[13px] text-[#1F2937]">{r}</span>
                <input type="text" placeholder="Ingresar monto" className="w-[120px] border border-[#E5E7EB] rounded-[6px] px-2 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#E5E7EB]">
              <span className="text-[13px] text-[#1F2937] font-semibold">Rango activo actual</span>
              <input type="text" placeholder="Ingresar monto" className="w-[120px] border border-[#E5E7EB] rounded-[6px] px-2 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white placeholder:text-[#9CA3AF]" />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-[#E5E7EB]" />
          {/* Right column with dividers */}
          <div className="flex-1 pl-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Procesamiento Transaccional (Cloud)</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <TextInput label="Mínimo mensual" placeholder="USD 6,000" />
              <TextInput label="Exento hasta (auto)" placeholder="20/06/2026" />
            </div>
            <hr className="border-t border-[#E5E7EB] my-4" />
            <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Fees EASPBV + Tarifa de Intercambio</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <TextInput label="Base" placeholder="Proporcional según MCC" />
              <TextInput label="Adicional fijo" placeholder="+00.02%" />
            </div>
            <hr className="border-t border-[#E5E7EB] my-4" />
            <div className="flex items-center gap-1 mb-3">
              <span className="text-[14px] font-semibold text-[#0A0B0D]">Servicios adicionales</span>
              <span className="relative group/sa shrink-0">
                <Info size={14} className="text-[#9CA3AF] cursor-pointer" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] w-[260px] whitespace-normal leading-relaxed opacity-0 group-hover/sa:opacity-100 transition-opacity pointer-events-none z-20">
                  Mensual según tarifa vigente, activables desde el Dashboard
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
                </div>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <span className="text-[12px] text-[#374151] font-medium block mb-1">Tokenización</span>
                <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none bg-white"><option>Inactivo</option><option>Activo</option></select>
              </div>
              <div>
                <span className="text-[12px] text-[#374151] font-medium block mb-1">Análisis de fraude</span>
                <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none bg-white"><option>Inactivo</option><option>Activo</option></select>
              </div>
            </div>
            <hr className="border-t border-[#E5E7EB] my-4" />
            <div>
              <span className="text-[12px] text-[#374151] font-medium block mb-1">Compensación real time</span>
              <select className="w-[calc(50%-6px)] border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none bg-white"><option>Inactivo</option><option>Activo</option></select>
            </div>
          </div>
        </div>
      </div>

      {/* CARGOS POR AUTENTICACIÓN 3DS */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Cargos por Autenticación 3DS</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-4">
        <TextInput label="Cargo" placeholder="USD $ 2,5000  + IVA" />
        <TextInput label="Mantenimiento" placeholder="USD $500 + IVA" info tooltip="Exento primeros 3 meses" />
        <TextInput label="Por transacción autenticada" placeholder="USD $0.029 + IVA" />
      </div>

      {/* FORMA DE PAGO */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Forma de Pago</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-4">
        <TextInput label="Mecanismo" placeholder="Retención sobre settlements" />
        <TextInput label="Plazo dev. excedente" placeholder="8 días calendario" />
        <TextInput label="Plazo pago déficit" placeholder="8 días" />
      </div>

      {/* DEPÓSITO EN GARANTÍA */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Depósito en Garantía</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <TextInput label="Monto USD" placeholder="USD $15,000" />
        <TextInput label="Equivalente COP (TRM día)" placeholder="A calcular" />
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Estado</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none bg-white"><option>Pendiente</option><option>Constituido</option></select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <TextInput label="Fecha límite constitución (auto 24 hs)" placeholder="21/03/2025" />
        <TextInput label="Vigencia post-terminación" placeholder="7 meses" />
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Akua puede ajustarlo por riesgo, volumen o requerimiento de franquicias. Ejecución directa sin requerimiento judicial.</p>
      </div>

      {/* ANEXOS */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Anexos</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <TextInput label="Monto USD" placeholder="USD $15,000" />
        <TextInput label="Equivalente COP (TRM día)" placeholder="A calcular" />
        <div>
          <span className="text-[12px] text-[#374151] font-medium block mb-1">Estado</span>
          <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none bg-white"><option>Pendiente</option></select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <TextInput label="Fecha límite constitución (auto 24 hs)" placeholder="21/03/2025" />
        <TextInput label="Vigencia post-terminación" placeholder="7 meses" />
      </div>
    </div>
  )
}

function CargosCobroView() {
  return (
    <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
      <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Cargos y formas de cobro</p>
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Cargo de Implementación</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <InfoField label="Monto" value="USD 15.000 + IVA" info />
        <InfoField label="Tipo de cambio" value="Pago único" />
        <InfoField label="Estado" value="Pendiente" />
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Facturación: 30 días post-firma o día siguiente del Kickoff (lo que ocurra primero).</p>
      </div>

      <hr className="border-t border-[#E5E7EB] my-5" />
      <div>
        <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Cargos Recurrentes Mensuales</p>
        <div className="flex items-stretch">
          {/* Adquirencia como Servicio - left */}
          <div className="flex-1 pr-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Adquirencia como Servicio</p>
            <div className="flex justify-between text-[11px] text-[#9CA3AF] mb-2 pb-2 border-b border-[#F3F4F6]">
              <span>Rango de transacciones</span><span>Monto negociado</span>
            </div>
            {[{r:'0 – 200K', v:'USD 1,500'},{r:'200K – 1M', v:'USD 2,000'},{r:'1M – 3M', v:'USD 3,000'},{r:'+3M', v:'USD 4,000'}].map((item) => (
              <div key={item.r} className="flex justify-between items-center py-2.5">
                <span className="text-[13px] text-[#1F2937]">{item.r}</span>
                <span className="text-[13px] text-[#0A0B0D] font-semibold">{item.v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#E5E7EB]">
              <span className="text-[13px] text-[#1F2937]">Rango activo actual</span>
              <span className="text-[13px] text-[#0A0B0D] font-semibold">0 - 200k</span>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-[#E5E7EB]" />
          {/* Right column with dividers */}
          <div className="flex-1 pl-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Procesamiento Transaccional (Cloud)</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoField label="Mínimo mensual" value="USD 6,000" />
              <InfoField label="Exento hasta (auto)" value="20/06/2026" />
            </div>
            <hr className="border-t border-[#E5E7EB] my-4" />
            <p className="text-[14px] font-semibold text-[#0A0B0D] mb-3">Fees EASPBV + Tarifa de Intercambio</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoField label="Base" value="Proporcional según MCC" />
              <InfoField label="Adicional fijo" value="+00.02%" />
            </div>
            <hr className="border-t border-[#E5E7EB] my-4" />
            <div className="flex items-center gap-1 mb-3">
              <span className="text-[14px] font-semibold text-[#0A0B0D]">Servicios adicionales</span>
              <span className="relative group/sav shrink-0">
                <Info size={14} className="text-[#9CA3AF] cursor-pointer" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] w-[260px] whitespace-normal leading-relaxed opacity-0 group-hover/sav:opacity-100 transition-opacity pointer-events-none z-20">
                  Mensual según tarifa vigente, activables desde el Dashboard
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
                </div>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoField label="Tokenización" value="Inactivo" />
              <InfoField label="Análisis de fraude" value="Inactivo" />
            </div>
            <hr className="border-t border-[#E5E7EB] my-4" />
            <InfoField label="Compensación real time" value="Inactivo" />
          </div>
        </div>
      </div>

      {/* CARGOS POR AUTENTICACIÓN 3DS */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Cargos por Autenticación 3DS</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-4">
        <InfoField label="Cargo" value="USD $ 2,5000 + IVA" />
        <InfoField label="Mantenimiento" value="USD $500 + IVA" info tooltip="Exento primeros 3 meses" />
        <InfoField label="Por transacción autenticada" value="USD $0.029 + IVA" />
      </div>

      {/* FORMA DE PAGO */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Forma de Pago</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-4">
        <InfoField label="Mecanismo" value="Retención sobre settlements" />
        <InfoField label="Plazo dev. excedente" value="8 días calendario" />
        <InfoField label="Plazo pago déficit" value="8 días" />
      </div>

      {/* DEPÓSITO EN GARANTÍA */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Depósito en Garantía</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <InfoField label="Monto USD" value="USD $15,000" />
        <InfoField label="Equivalente COP (TRM día)" value="A calcular" />
        <InfoField label="Estado" value="Pendiente" />
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <InfoField label="Fecha límite constitución (auto 24 hs)" value="21/03/2025" />
        <InfoField label="Vigencia post-terminación" value="7 meses" />
      </div>
      <div className="flex items-start gap-2 bg-[#F9FAFB] rounded-[8px] p-3 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p className="text-[11px] text-[#6B7280]">Akua puede ajustarlo por riesgo, volumen o requerimiento de franquicias. Ejecución directa sin requerimiento judicial.</p>
      </div>

      {/* ANEXOS */}
      <hr className="border-t border-[#E5E7EB] my-5" />
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Anexos</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <InfoField label="Monto USD" value="USD $15,000" />
        <InfoField label="Equivalente COP (TRM día)" value="A calcular" />
        <InfoField label="Estado" value="Pendiente" />
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-3">
        <InfoField label="Fecha límite constitución (auto 24 hs)" value="21/03/2025" />
        <InfoField label="Vigencia post-terminación" value="7 meses" />
      </div>
    </div>
  )
}

function LegalEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <>
      <div className="flex gap-4">
      {/* Left: checklist + Contrato + NDA */}
      <div className="w-1/2 min-w-0 flex flex-col">
        {LEGAL_CHECKLIST.map((label, i) => (
          <ChecklistItemEdit
            key={i} label={label}
            checked={checkedItems.has(i)} waived={waivedItems.has(i)}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            onMarkDone={() => onCheck(i)}
            onWaive={() => onWaive(i)}
            addLog={addLog}
          />
        ))}

        {/* Contrato */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-2">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D]">Contrato</p>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[#f5a623] bg-[rgba(245,166,35,0.1)] text-[#f5a623]">POR VENCER</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <TextInput label="Fecha de firma" placeholder="20/03/2025" />
            <TextInput label="Fecha de vencimiento" placeholder="20/03/2026" />
            <div>
              <span className="text-[12px] text-[#374151] font-medium block mb-1">Tipo de contrato</span>
              <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
                <option>Seleccionar</option>
              </select>
            </div>
            <TextInput label="Contraparte" placeholder="Efecty S.A" />
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
        </div>

        {/* NDA */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D]">NDA</p>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[#fa5252] bg-[rgba(250,82,82,0.1)] text-[#fa5252]">SIN AVANCE · 12 DÍAS</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <TextInput label="Fecha de entrada" placeholder="30/01/2026" />
            <TextInput label="Nombre" placeholder="Escribir nombre" />
            <div>
              <span className="text-[12px] text-[#374151] font-medium block mb-1">Estado actual</span>
              <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
                <option>En negociación</option>
                <option>En revisión</option>
                <option>Firmado</option>
                <option>En borrador</option>
              </select>
            </div>
            <div>
              <span className="text-[12px] text-[#374151] font-medium block mb-1">Desde</span>
              <select className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[28px] text-[12px] text-[#374151] outline-none focus:border-[#180047] bg-white">
                <option>01/03/2026</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Docs */}
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <LegalDocsPanel disabled={false} />
      </div>
      </div>

      {/* Cargos y formas de cobro - full width below */}
      <CargosCobroEdit />
    </>
  )
}

function LegalView({ checkedItems, waivedItems }) {
  return (
    <>
      <div className="flex gap-4">
      {/* Left: checklist + Contrato + NDA */}
      <div className="w-1/2 min-w-0 flex flex-col">
        {LEGAL_CHECKLIST.map((label, i) => (
          <ChecklistItemView key={i} label={label} checked={checkedItems.has(i)} waived={waivedItems.has(i)} />
        ))}

        {/* Contrato */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-2">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D]">Contrato</p>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[#f5a623] bg-[rgba(245,166,35,0.1)] text-[#f5a623]">POR VENCER</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <InfoField label="Fecha de firma" value="20/03/2025" />
            <InfoField label="Fecha de vencimiento" value="20/03/2026" />
            <InfoField label="Tipo de contrato" value="Contrato" />
            <InfoField label="Contraparte" value="Efecty S.A" />
            <InfoField label="Entidad Akua" value="Akua Colombia S.A" />
            <InfoField label="País" value="Colombia" />
          </div>
        </div>

        {/* NDA */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-4 bg-white mt-4">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[14px] font-semibold text-[#0A0B0D]">NDA</p>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[#fa5252] bg-[rgba(250,82,82,0.1)] text-[#fa5252]">SIN AVANCE · 12 DÍAS</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <InfoField label="Fecha de entrada" value="30/01/2026" />
            <InfoField label="Nombre" value="Text" />
            <InfoField label="Estado actual" value="En negociación" />
            <InfoField label="Desde" value="01/03/2026" />
          </div>
        </div>
      </div>

      {/* Right: Docs */}
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <LegalDocsPanel disabled={true} />
      </div>
      </div>

      {/* Cargos y formas de cobro - full width below */}
      <CargosCobroView />
    </>
  )
}

/* ─── KICKOFF & INTEGRATION CONTENT ─── */
const KICKOFF_CHECKLIST = [
  "Text here", "Text here", "Text here", "Text here", "Text here", "Text here",
]

const KICKOFF_DOC_LABELS = ['Contrato firmado', 'Pagos', 'Cargos de impuestos', 'Depósito']

function KickoffEdit({ checkedItems, onCheck, waivedItems, onWaive, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <div className="flex gap-4">
      <div className="w-1/2 min-w-0 flex flex-col">
        {KICKOFF_CHECKLIST.map((label, i) => (
          <ChecklistItemEdit
            key={i} label={label}
            checked={checkedItems.has(i)} waived={waivedItems.has(i)}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            onMarkDone={() => onCheck(i)}
            onWaive={() => onWaive(i)}
            addLog={addLog}
          />
        ))}
      </div>
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="text-[13px] font-semibold text-[#0A0B0D] mb-3">Documentación</p>
          {KICKOFF_DOC_LABELS.map((label, i) => <DocLinkInput key={i} label={label} />)}
        </div>
      </div>
    </div>
  )
}

function KickoffView({ checkedItems, waivedItems }) {
  return (
    <div className="flex gap-4">
      <div className="w-1/2 min-w-0 flex flex-col">
        {KICKOFF_CHECKLIST.map((label, i) => (
          <ChecklistItemView key={i} label={label} checked={checkedItems.has(i)} waived={waivedItems.has(i)} />
        ))}
      </div>
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="text-[13px] font-semibold text-[#0A0B0D] mb-3">Documentación</p>
          {KICKOFF_DOC_LABELS.map((label, i) => <DocLinkInput key={i} label={label} disabled />)}
        </div>
      </div>
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
    review: 'not_started',
  })
  const [activityLogs, setActivityLogs] = useState({
    compliance: [], fraud: [], finances: [], sales: [], legal: [], kickoff: [], golive: [], review: [],
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
      const was = (complianceSubChecked[stepIdx] || new Set()).has(subIdx)
      addLog(was ? `'${sub}' desmarcado` : `'${sub}' se ha marcado como lista`)
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
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 mb-3">
        <Link to="/clients" className="text-[14px] text-[#868e96] font-medium no-underline hover:underline">Clients</Link>
        <span className="text-[14px] text-[#dee2e6]">/</span>
        <span className="text-[14px] text-[#101828] font-medium">Efecty</span>
      </div>

      {/* Main card */}
      <div className="bg-white border border-[#dee2e6] rounded-[16px] p-4 min-h-[640px]">
        {/* Tabs row - segmented style */}
        <div className="flex items-center mb-4">
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
            {/* Department sidebar - 252px */}
            <div className="w-[280px] shrink-0">
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
            <div className="flex-1 min-w-0 border border-[#E5E7EB] rounded-[12px] p-5">
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

              {/* Content based on inner tab */}
              {innerTab === 'information' && (
                <>
                  {(() => {
                    const DEPT_LABELS = { compliance: 'Compliance', fraud: 'Fraud', finances: 'Finance', sales: 'Sales', legal: 'Legal and Contract', kickoff: 'Kickoff & Integration', golive: 'Go Live', review: '1st Review' }
                    const activeBanners = Object.entries(deptConditions)
                      .filter(([dept, list]) => list?.length > 0 && deptStatuses[dept] === 'completed_conditions')
                    // On legal/finances, show ALL banners from any dept. On the owner dept, show its own. Otherwise hidden.
                    const bannersToShow = (activeDept === 'legal' || activeDept === 'finances')
                      ? activeBanners
                      : activeBanners.filter(([dept]) => dept === activeDept)
                    return bannersToShow.length > 0 ? (
                      <div className="flex flex-col gap-3 mb-4">
                        {bannersToShow.map(([dept, list]) => (
                          <ConditionsBanner
                            key={dept}
                            title={dept === activeDept ? 'Aprobado con condiciones' : `${DEPT_LABELS[dept] || dept} — Aprobado con condiciones`}
                            conditions={list}
                          />
                        ))}
                      </div>
                    ) : null
                  })()}
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
          const DEPT_LABELS = { compliance: 'Compliance', fraud: 'Fraud', finances: 'Finance', sales: 'Sales', legal: 'Legal and Contract', kickoff: 'Kickoff & Integration', golive: 'Go Live', review: '1st Review' }
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
