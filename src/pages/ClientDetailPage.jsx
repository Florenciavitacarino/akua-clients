import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, ChevronRight, Lock, LockOpen,
  Link2, ExternalLink, Info, RefreshCw, Flag, FileText, Ban, Trash2,
  Store, ShieldCheck, KeyRound, Settings, ShieldAlert, UserCheck, Link as LinkIcon
} from 'lucide-react'

/* ─── Figma icon assets for department menu ─── */
const DEPT_ICONS = {
  compliance: 'https://www.figma.com/api/mcp/asset/ca6aee76-26ee-4b78-a22d-79b30e25cb10',
  fraud: 'https://www.figma.com/api/mcp/asset/f54bf299-f001-4208-88ab-9836eec2fbaf',
  finances: 'https://www.figma.com/api/mcp/asset/28d9b875-1517-411c-82f7-dfa54903ad28',
  sales: 'https://www.figma.com/api/mcp/asset/c3010f7a-be54-4e59-9a34-eff03b76f4ac',
  legal: 'https://www.figma.com/api/mcp/asset/ebaf2414-1f44-4fa8-8d05-fefd163cadf7',
  kickoff: 'https://www.figma.com/api/mcp/asset/2e85f120-8344-47fc-9739-c29135c91bf6',
  golive: 'https://www.figma.com/api/mcp/asset/55598504-5c4b-4332-b978-ac17faccb2d0',
  review: 'https://www.figma.com/api/mcp/asset/55598504-5c4b-4332-b978-ac17faccb2d0',
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

const TABS = ['Resumen', 'Revisión por áreas', 'Features', 'Timeline', 'Documentos']

/* ─── Shared UI ─── */

/* Status dot: 16px circle — completed (green+check), in_progress (yellow+loading), not_started (grey+minus) */
const STATUS_TOOLTIPS = { completed: 'Completado', in_progress: 'En progreso', not_started: 'Sin iniciar' }

function StatusDot({ status }) {
  const tooltip = STATUS_TOOLTIPS[status] || STATUS_TOOLTIPS.not_started
  const dot = status === 'completed' ? (
    <span className="w-[16px] h-[16px] rounded-full bg-[#2ecc71] flex items-center justify-center shrink-0">
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

/* Department icon: 32px circle with border, icon image inside */
function DeptIcon({ deptKey }) {
  const src = DEPT_ICONS[deptKey]
  return (
    <div className="w-[32px] h-[32px] rounded-full border border-[#dee2e6] flex items-center justify-center shrink-0 bg-white">
      {src ? (
        <img src={src} alt="" className="w-[16px] h-[16px] object-contain" />
      ) : (
        <RefreshCw size={16} className="text-[#9CA3AF]" />
      )}
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
          <span className="text-[11px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2.5 py-0.5 rounded-full uppercase tracking-wide">WAIVED</span>
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
              }}
            >
              Mark as done
            </button>
            {waived ? (
              <button
                className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-white px-5 py-2.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                onClick={(e) => { e.stopPropagation(); onWaive() }}
              >
                <RefreshCw size={14} />
                Undo waive
              </button>
            ) : (
              <button
                className="flex items-center gap-2 text-[13px] font-medium text-[#374151] bg-white px-5 py-2.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                onClick={(e) => { e.stopPropagation(); onWaive() }}
              >
                <Ban size={14} />
                Waive
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
        <span className="text-[11px] font-semibold text-[#5a6dd7] bg-[#EDF0FF] px-2.5 py-0.5 rounded-full uppercase tracking-wide">WAIVED</span>
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
        <span className="text-[12px] text-[#6B7280]">{label}</span>
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
      <p className="text-[13px] text-[#0A0B0D] font-medium">{value || '—'}</p>
    </div>
  )
}

/* ─── Radio group (Edit mode) ─── */
function RadioField({ label, info, tooltip }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[12px] text-[#374151]">{label}</span>
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
      <div className="flex items-center gap-3">
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
        className={`text-[13px] font-normal h-[28px] inline-flex items-center gap-1.5 px-3 rounded-[18px] border transition-colors ${
          disabled ? 'cursor-default' : 'cursor-pointer'
        }`}
        style={{ borderColor, color: textColor }}
      >
        {current.label} <ChevronDown size={12} />
      </button>

      {dropdownOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1 z-30 min-w-[180px]">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
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
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ─── COMPLIANCE CONTENT ─── */
const COMPLIANCE_CHECKLIST = [
  { label: "Revisión documental corporativa" },
  { label: "Verificación de identidad de representantes" },
  { label: "Validación de la estructura accionaria y UBO" },
  { label: "Screening de sanciones, PEP y Adverse Media (Noto)" },
  { label: "Ballerine -Evaluación del sitio web" },
  { label: "Evaluación del perfil de riesgo del negocio" },
  { label: "Revisión del programa de compliance del cliente" },
  { label: "Inscripción del cliente en Mastercard y Visa como Pay..." },
  { label: "Apetito de Riesgo del Cliente", tag: "FRAUD" },
]

function ComplianceEdit({ checkedItems, onCheck, waivedItems, onWaive, logs, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <>
      {/* Top area: Checklist + Activity side by side - 50/50 */}
      <div className="flex gap-4">
        <div className="w-1/2 min-w-0 flex flex-col">
          {COMPLIANCE_CHECKLIST.map((item, i) => (
            <ChecklistItemEdit
              key={i}
              label={item.label} tag={item.tag}
              checked={checkedItems.has(i)}
              waived={waivedItems.has(i)}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              onMarkDone={() => onCheck(i)}
              onWaive={() => onWaive(i)}
              addLog={addLog}
            />
          ))}
        </div>
        <div className="w-1/2 min-w-0">
          <ActivityPanel logs={logs} />
        </div>
      </div>

      {/* Historial de Riesgo */}
      <div className="mt-6 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Historial de Riesgo</p>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <RadioField label="Historial de procesamiento" />
          <RadioField label="Tasa de chargebacks" info />
          <RadioField label="Chargebacks > 0.9%" />
        </div>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5 mt-5">
          <TextInput label="Fecha" placeholder="Mes" />
          <RadioField label="Participación de monitoreo" info />
          <RadioField label="Incidentes de fraude" />
        </div>
        <div className="mt-5">
          <TextInput label="Descripción del incidente" placeholder="Descripción del incidente" />
        </div>
      </div>

      {/* Apetito de Riesgo del Cliente */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Apetito de Riesgo del Cliente</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar cómo el cliente prioriza entre seguridad y conversión, el Perfil D (recurrencia) y cómo se trata el primer cobro.</p>
        <div className="mb-5">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[12px] text-[#374151]">Prioridad del cliente</span>
            <span className="relative group/pcc shrink-0">
              <Info size={12} className="text-[#D1D5DB] cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] w-[280px] whitespace-normal opacity-0 group-hover/pcc:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed">
                Máxima protección (acepta menor conversión) / Balance protección-conversión / Máxima conversión (acepta mayor riesgo)
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
              </div>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[12px] text-[#374151] cursor-pointer">
              <input type="radio" name="prioridad_c" className="accent-[#180047] w-[14px] h-[14px]" /> Máxima protección (acepta menor conversión)
            </label>
            <label className="flex items-center gap-2 text-[12px] text-[#374151] cursor-pointer">
              <input type="radio" name="prioridad_c" className="accent-[#180047] w-[14px] h-[14px]" /> Balance protección-conversión
            </label>
            <label className="flex items-center gap-2 text-[12px] text-[#374151] cursor-pointer">
              <input type="radio" name="prioridad_c" className="accent-[#180047] w-[14px] h-[14px]" /> Máxima conversión (acepta mayor riesgo)
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <RadioField label="Restricciones contractuales o regulatorias" info tooltip="Exigencia de 3DS en ciertos flujos" />
        </div>
        <div className="mt-5">
          <TextInput label="Detalles" placeholder="Detalles de las restricciones" />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-5">
          <RadioField label="Exención específica" info tooltip="TRA, low-value, whitelist" />
          <TextInput label="Cuál" placeholder="Detalle de las restricciones" />
        </div>
        <div className="mt-5">
          <RadioField label="Fallo de autenticación (fail-closed)" info tooltip="Si falla la autenticación, se declina la transacción" />
        </div>
        <div className="mt-5">
          <TextInput label="Observaciones adicionales" placeholder="Más observaciones del cliente sobre pagos" />
        </div>
      </div>
    </>
  )
}

function ComplianceView({ checkedItems, waivedItems, logs }) {
  return (
    <>
      {/* Top area: Checklist + Activity side by side - 50/50 */}
      <div className="flex gap-4">
        <div className="w-1/2 min-w-0 flex flex-col">
          {COMPLIANCE_CHECKLIST.map((item, i) => (
            <ChecklistItemView key={i} label={item.label} tag={item.tag} checked={checkedItems.has(i)} waived={waivedItems.has(i)} />
          ))}
        </div>
        <div className="w-1/2 min-w-0">
          <ActivityPanel logs={logs} />
        </div>
      </div>

      {/* Historial de Riesgo - VIEW mode: label/value pairs */}
      <div className="mt-6 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Historial de Riesgo</p>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Historial de procesamiento" value="No" />
          <InfoField label="Tasa de chargebacks" value="Si" info />
          <InfoField label="Chargebacks > 0.9%" value="No" />
        </div>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5 mt-5">
          <InfoField label="Fecha" value="21/03/2025" />
          <InfoField label="Participación de monitoreo" value="Si" info />
          <InfoField label="Incidentes de fraude" value="No" />
        </div>
        <div className="mt-5">
          <InfoField label="Descripción del incidente" value="Descripción del incidente" />
        </div>
      </div>

      {/* Apetito de Riesgo del Cliente */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Apetito de Riesgo del Cliente</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar cómo el cliente prioriza entre seguridad y conversión, el Perfil D (recurrencia) y cómo se trata el primer cobro.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Prioridad del cliente" value="Máxima protección (acepta menor conversión)" info tooltip="Máxima protección (acepta menor conversión) / Balance protección-conversión / Máxima conversión (acepta mayor riesgo)" />
          <InfoField label="Restricciones contractuales o regulatorias" value="No" info tooltip="Exigencia de 3DS en ciertos flujos" />
          <InfoField label="Detalles" value="Detalles de las restricciones" />
          <InfoField label="Exención específica" value="No" info tooltip="TRA, low-value, whitelist" />
          <InfoField label="Cuál" value="Detalle de las restricciones" />
          <div />
          <InfoField label="Fallo de autenticación (fail-closed)" value="No" info tooltip="Si falla la autenticación, se declina la transacción" />
          <InfoField label="Observaciones adicionales" value="Más observaciones del cliente sobre pagos" />
        </div>
      </div>
    </>
  )
}

/* ─── FRAUD CONTENT ─── */
const FRAUD_CHECKLIST = [
  { label: "Datos de equipo de riesgo/prevención de fraude 1" },
  { label: "Vertical de negocio" },
  { label: "Perfil Transaccional Esperado", tag: "FINANCE", sharedId: "perfil_transaccional" },
  { label: "Tipo de Operatoria" },
  { label: "Historial de Riesgo", tag: "FINANCE", sharedId: "historial_riesgo" },
  { label: "Apetito de Riesgo del Cliente", tag: "COMPLIANCE" },
]

function FraudEdit({ checkedItems, onCheck, waivedItems, onWaive, logs, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <>
      <div className="flex gap-4">
        <div className="w-1/2 min-w-0 flex flex-col">
          {FRAUD_CHECKLIST.map((item, i) => (
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
        </div>
        <div className="w-1/2 min-w-0">
          <ActivityPanel logs={logs} />
        </div>
      </div>

      {/* Vertical de negocio */}
      <div className="mt-6 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Vertical de negocio</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar el tipo de negocio principal del cliente. Esta información determina el nivel de riesgo base y los MCCs involucrados.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <TextInput label="Vertical" placeholder="Text" />
          <TextInput label="MCCs esperados" placeholder="Text" />
          <TextInput label="Descripción del producto o servicio" placeholder="Text" />
        </div>
      </div>

      {/* Perfil Transaccional Esperado */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[14px] font-semibold text-[#0A0B0D]">Perfil Transaccional Esperado</p>
          <span className="relative group/pte shrink-0">
            <Info size={14} className="text-[#9CA3AF] cursor-pointer" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/pte:opacity-100 transition-opacity pointer-events-none z-20">
              Estimado por cantidad de transacciones
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
            </div>
          </span>
        </div>
        <p className="text-[12px] text-[#6B7280] mb-4">Esta sección permite calibrar los umbrales de monto y el mix de tarjetas.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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

      {/* Tipo de Operatoria */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Tipo de Operatoria</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar cómo el cliente procesa sus pagos. Esta sección determina si aplica el Perfil D (recurrencia) y cómo se trata el primer cobro.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          <RadioField label="Pagos únicos" />
          <RadioField label="Pagos recurrentes" info tooltip="Suscripciones / cobros automáticos" />
          <TextInput label="Frecuencia de cobro" placeholder="Mensual" />
          <RadioField label="Tarjetahabiente presente en el mome..." />
          <RadioField label="Tokenización de tarjetas (instruments)" />
        </div>
      </div>

      {/* Historial de Riesgo */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Historial de Riesgo</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          <RadioField label="Historial de procesamiento" />
          <RadioField label="Tasa de chargebacks" info tooltip="Promedio (últimos 3 meses)" />
          <RadioField label="Chargebacks > 0.9%" />
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-5">
          <TextInput label="Fecha" placeholder="Mes" />
          <RadioField label="Participación de monitoreo" info tooltip="Entre Visa o Mastercard (VAMP, ECP, FMP)" />
          <RadioField label="Incidentes de fraude" />
        </div>
        <div className="mt-5">
          <TextInput label="Descripción del incidente" placeholder="Descripción del incidente" />
        </div>
      </div>

      {/* Apetito de Riesgo del Cliente */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Apetito de Riesgo del Cliente</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar cómo el cliente prioriza entre seguridad y conversión, el Perfil D (recurrencia) y cómo se trata el primer cobro.</p>
        {/* Prioridad del cliente */}
        <div className="mb-5">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[12px] text-[#374151]">Prioridad del cliente</span>
            <span className="relative group/pc shrink-0">
              <Info size={12} className="text-[#D1D5DB] cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] w-[280px] whitespace-normal opacity-0 group-hover/pc:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed">
                Máxima protección (acepta menor conversión) / Balance protección-conversión / Máxima conversión (acepta mayor riesgo)
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
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <RadioField label="Restricciones contractuales o regulatorias" info tooltip="Exigencia de 3DS en ciertos flujos" />
        </div>
        <div className="mt-5">
          <TextInput label="Detalles" placeholder="Detalles de las restricciones" />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-5">
          <RadioField label="Exención específica" info tooltip="TRA, low-value, whitelist" />
          <TextInput label="Cuál" placeholder="Detalle de las restricciones" />
        </div>
        <div className="mt-5">
          <RadioField label="Fallo de autenticación (fail-closed)" info tooltip="Si falla la autenticación, se declina la transacción" />
        </div>
        <div className="mt-5">
          <TextInput label="Observaciones adicionales" placeholder="Más observaciones del cliente sobre pagos" />
        </div>
      </div>
    </>
  )
}

function FraudView({ checkedItems, waivedItems, logs }) {
  return (
    <>
      <div className="flex gap-4">
        <div className="w-1/2 min-w-0 flex flex-col">
          {FRAUD_CHECKLIST.map((item, i) => (
            <ChecklistItemView key={i} label={item.label} tag={item.tag} checked={checkedItems.has(i)} waived={waivedItems.has(i)} />
          ))}
        </div>
        <div className="w-1/2 min-w-0">
          <ActivityPanel logs={logs} />
        </div>
      </div>

      {/* Vertical de negocio */}
      <div className="mt-6 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Vertical de negocio</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar el tipo de negocio principal del cliente. Esta información determina el nivel de riesgo base y los MCCs involucrados.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Vertical" value="Text" />
          <InfoField label="MCCs esperados" value="Text" />
          <InfoField label="Descripción del producto o servicio" value="Text" />
        </div>
      </div>

      {/* Perfil Transaccional Esperado */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <div className="flex items-center gap-2 mb-4 relative group/ptev">
          <p className="text-[14px] font-semibold text-[#0A0B0D]">Perfil Transaccional Esperado</p>
          <Info size={14} className="text-[#9CA3AF] cursor-pointer" />
          <div className="absolute left-[200px] bottom-full mb-2 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-[8px] whitespace-nowrap opacity-0 group-hover/ptev:opacity-100 transition-opacity pointer-events-none z-20">
            Estimado por cantidad de transacciones
            <div className="absolute top-full left-6 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1F2937]" />
          </div>
        </div>
        <p className="text-[12px] text-[#6B7280] mb-4">Esta sección permite calibrar los umbrales de monto y el mix de tarjetas.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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

      {/* Tipo de Operatoria */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Tipo de Operatoria</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar cómo el cliente procesa sus pagos. Esta sección determina si aplica el Perfil D (recurrencia) y cómo se trata el primer cobro.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Pagos únicos" value="Si" />
          <InfoField label="Pagos recurrentes" value="Si" info tooltip="Suscripciones / cobros automáticos" />
          <InfoField label="Frecuencia de cobro" value="Mensual" />
          <InfoField label="Tarjetahabiente presente en el momento" value="Si" />
          <InfoField label="Tokenización de tarjetas" value="Si" />
        </div>
      </div>

      {/* Historial de Riesgo */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-4">Historial de Riesgo</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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

      {/* Apetito de Riesgo del Cliente */}
      <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white">
        <p className="text-[14px] font-semibold text-[#0A0B0D] mb-1">Apetito de Riesgo del Cliente</p>
        <p className="text-[12px] text-[#6B7280] mb-4">Indicar cómo el cliente prioriza entre seguridad y conversión, el Perfil D (recurrencia) y cómo se trata el primer cobro.</p>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Prioridad del cliente" value="Máxima protección (acepta menor conversión)" info tooltip="Máxima protección (acepta menor conversión) / Balance protección-conversión / Máxima conversión (acepta mayor riesgo)" />
          <InfoField label="Restricciones contractuales o regulatorias" value="No" info tooltip="Exigencia de 3DS en ciertos flujos" />
          <InfoField label="Detalles" value="Detalles de las restricciones" />
          <InfoField label="Exención específica" value="No" info tooltip="TRA, low-value, whitelist" />
          <InfoField label="Cuál" value="Detalle de las restricciones" />
          <div />
          <InfoField label="Fallo de autenticación (fail-closed)" value="No" info tooltip="Si falla la autenticación, se declina la transacción" />
          <InfoField label="Observaciones adicionales" value="Más observaciones del cliente sobre pagos" />
        </div>
      </div>
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
      <p className="text-[12px] font-semibold text-[#1F2937] mb-1.5">{label}</p>
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

function FinancesEdit({ checkedItems, onCheck, waivedItems, onWaive, logs, addLog }) {
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
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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
          <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            <RadioField label="Historial de procesamiento" />
            <RadioField label="Tasa de chargebacks" info tooltip="Promedio (últimos 3 meses)" />
            <RadioField label="Chargebacks > 0.9%" />
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-5">
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
          <p className="text-[13px] font-semibold text-[#0A0B0D] mb-3">Definición del colateral</p>
          {FINANCES_DOC_LABELS.slice(0, 3).map((label, i) => <DocLinkInput key={i} label={label} />)}
          <hr className="border-t border-[#E5E7EB] my-3" />
          {FINANCES_DOC_LABELS.slice(3).map((label, i) => <DocLinkInput key={i} label={label} />)}
        </div>
        <ActivityPanel logs={logs} />
      </div>
    </div>
  )
}

function FinancesView({ checkedItems, waivedItems, logs }) {
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
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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
          <p className="text-[13px] font-semibold text-[#0A0B0D] mb-3">Definición del colateral</p>
          {FINANCES_DOC_LABELS.slice(0, 3).map((label, i) => <DocLinkInput key={i} label={label} disabled />)}
          <hr className="border-t border-[#E5E7EB] my-3" />
          {FINANCES_DOC_LABELS.slice(3).map((label, i) => <DocLinkInput key={i} label={label} disabled />)}
        </div>
        <ActivityPanel logs={logs} />
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

function SalesEdit({ checkedItems, onCheck, waivedItems, onWaive, logs, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <div className="flex gap-4">
      <div className="w-1/2 min-w-0 flex flex-col">
        {SALES_CHECKLIST.map((label, i) => (
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
          {SALES_DOC_LABELS.map((label, i) => <DocLinkInput key={i} label={label} />)}
        </div>
        <ActivityPanel logs={logs} />
      </div>
    </div>
  )
}

function SalesView({ checkedItems, waivedItems, logs }) {
  return (
    <div className="flex gap-4">
      <div className="w-1/2 min-w-0 flex flex-col">
        {SALES_CHECKLIST.map((label, i) => (
          <ChecklistItemView key={i} label={label} checked={checkedItems.has(i)} waived={waivedItems.has(i)} />
        ))}
      </div>
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="text-[13px] font-semibold text-[#0A0B0D] mb-3">Documentación</p>
          {SALES_DOC_LABELS.map((label, i) => <DocLinkInput key={i} label={label} disabled />)}
        </div>
        <ActivityPanel logs={logs} />
      </div>
    </div>
  )
}

/* ─── LEGAL AND CONTRACT CONTENT ─── */
const LEGAL_CHECKLIST = [
  "Text here", "Text here", "Text here", "Text here", "Text here", "Text here",
]

const LEGAL_DOC_LABELS = ['Certificados de Cámara de comercio', 'Poderes', 'Actas de asamblea', 'Histórico transaccional']

function LegalEdit({ checkedItems, onCheck, waivedItems, onWaive, logs, addLog }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
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

      {/* Right: Docs + Activity */}
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="text-[13px] font-semibold text-[#0A0B0D] mb-3">Documentación Societaria</p>
          {LEGAL_DOC_LABELS.map((label, i) => <DocLinkInput key={i} label={label} />)}
        </div>
        <ActivityPanel logs={logs} />
      </div>
    </div>
  )
}

function LegalView({ checkedItems, waivedItems, logs }) {
  return (
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

      {/* Right: Docs + Activity */}
      <div className="w-1/2 min-w-0 flex flex-col gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="text-[13px] font-semibold text-[#0A0B0D] mb-3">Documentación Societaria</p>
          {LEGAL_DOC_LABELS.map((label, i) => <DocLinkInput key={i} label={label} disabled />)}
        </div>
        <ActivityPanel logs={logs} />
      </div>
    </div>
  )
}

/* ─── KICKOFF & INTEGRATION CONTENT ─── */
const KICKOFF_CHECKLIST = [
  "Text here", "Text here", "Text here", "Text here", "Text here", "Text here",
]

const KICKOFF_DOC_LABELS = ['Contrato firmado', 'Pagos']

function KickoffEdit({ checkedItems, onCheck, waivedItems, onWaive, logs, addLog }) {
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
        <ActivityPanel logs={logs} />
      </div>
    </div>
  )
}

function KickoffView({ checkedItems, waivedItems, logs }) {
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
        <ActivityPanel logs={logs} />
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

/* ─── MAIN PAGE ─── */
export default function ClientDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Revisión por áreas')
  const [activeDept, setActiveDept] = useState('compliance')
  const [isEditing, setIsEditingRaw] = useState(false)
  const setIsEditing = (val) => { setIsEditingRaw(val); if (!val) setHasChanges(false) }
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

  const USER_NAME = 'Agustina Romagnoli'

  const addLog = (text) => {
    setActivityLogs(prev => ({
      ...prev,
      [activeDept]: [{ text, user: USER_NAME, date: formatNow() }, ...(prev[activeDept] || [])],
    }))
  }

  const [hasChanges, setHasChanges] = useState(false)

  const handleStatusChange = (status) => {
    const label = STATUS_OPTIONS.find(o => o.value === status)?.label
    addLog(`Cambio de estado del departamento a "${label}"`)
    setDeptStatuses(prev => ({ ...prev, [activeDept]: status }))
    setHasChanges(true)
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
    addLog(wasWaived ? `'${label}' waive revertido` : `'${label}' marcado como waived`)
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
              {/* Header: Title + Edit/Save button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-[#0A0B0D] m-0">
                  {currentDept?.name === 'Compliance' ? 'Compliance Review' : currentDept?.name}
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[13px] font-medium text-white bg-[#180047] px-5 py-2 rounded-full border-none cursor-pointer hover:bg-[#2a0066] transition-colors"
                  >
                    Editar
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsEditing(false); addLog('Cambios guardados') }}
                    className="text-[13px] font-medium px-5 py-2 rounded-full border-none text-white bg-[#180047] cursor-pointer hover:bg-[#2a0066] transition-colors"
                  >
                    Guardar cambios
                  </button>
                )}
              </div>

              {/* Tareas + Status dropdown row */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[14px] font-medium text-[#0A0B0D] m-0">Tareas</p>
                <StatusDropdown
                  deptStatus={deptStatuses[activeDept]}
                  onStatusChange={handleStatusChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Department content */}
              {activeDept === 'compliance' && (isEditing
                ? <ComplianceEdit checkedItems={checkedItems.compliance} onCheck={handleCheck} waivedItems={waivedItems.compliance} onWaive={handleWaive} logs={activityLogs[activeDept]} addLog={addLog} />
                : <ComplianceView checkedItems={checkedItems.compliance} waivedItems={waivedItems.compliance} logs={activityLogs[activeDept]} />
              )}
              {activeDept === 'fraud' && (isEditing
                ? <FraudEdit checkedItems={checkedItems.fraud} onCheck={handleCheck} waivedItems={waivedItems.fraud} onWaive={handleWaive} logs={activityLogs[activeDept]} addLog={addLog} />
                : <FraudView checkedItems={checkedItems.fraud} waivedItems={waivedItems.fraud} logs={activityLogs[activeDept]} />
              )}
              {activeDept === 'finances' && (isEditing
                ? <FinancesEdit checkedItems={checkedItems.finances} onCheck={handleCheck} waivedItems={waivedItems.finances} onWaive={handleWaive} logs={activityLogs[activeDept]} addLog={addLog} />
                : <FinancesView checkedItems={checkedItems.finances} waivedItems={waivedItems.finances} logs={activityLogs[activeDept]} />
              )}
              {activeDept === 'sales' && (isEditing
                ? <SalesEdit checkedItems={checkedItems.sales} onCheck={handleCheck} waivedItems={waivedItems.sales} onWaive={handleWaive} logs={activityLogs[activeDept]} addLog={addLog} />
                : <SalesView checkedItems={checkedItems.sales} waivedItems={waivedItems.sales} logs={activityLogs[activeDept]} />
              )}
              {activeDept === 'legal' && (isEditing
                ? <LegalEdit checkedItems={checkedItems.legal} onCheck={handleCheck} waivedItems={waivedItems.legal} onWaive={handleWaive} logs={activityLogs[activeDept]} addLog={addLog} />
                : <LegalView checkedItems={checkedItems.legal} waivedItems={waivedItems.legal} logs={activityLogs[activeDept]} />
              )}
              {activeDept === 'kickoff' && (isEditing
                ? <KickoffEdit checkedItems={checkedItems.kickoff} onCheck={handleCheck} waivedItems={waivedItems.kickoff} onWaive={handleWaive} logs={activityLogs[activeDept]} addLog={addLog} />
                : <KickoffView checkedItems={checkedItems.kickoff} waivedItems={waivedItems.kickoff} logs={activityLogs[activeDept]} />
              )}
              {!['compliance','fraud','finances','sales','legal','kickoff'].includes(activeDept) && <PlaceholderDept name={currentDept?.name} isEditing={isEditing} />}
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
          return (
            <div className="flex flex-col gap-5">
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

        {activeTab === 'Documentos' && (
          <div className="text-center py-16 text-[#9CA3AF]">
            <FileText size={36} className="mx-auto mb-3" />
            <p className="text-[13px]">Documentos will be displayed here.</p>
          </div>
        )}

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
    </>
  )
}
