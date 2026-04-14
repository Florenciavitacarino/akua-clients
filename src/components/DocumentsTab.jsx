import { useState, useRef } from 'react'
import { Search, Upload, ExternalLink, X, FileText, File, Image, Table2 } from 'lucide-react'

const INITIAL_DOCS = [
  { name: 'Contrato V5 completo', size: '2.4 MB', type: 'PDF', category: 'Contrato', date: '20/03/2025', user: 'Ingrith V.' },
  { name: 'Anexo I – Descripción técnica', size: '1.1 MB', type: 'PDF', category: 'Contrato', date: '20/03/2025', user: 'Ingrith V.' },
  { name: 'Anexo II – SLA', size: '890 KB', type: 'PDF', category: 'SLA', date: '20/03/2025', user: 'Ingrith V.' },
  { name: 'Poderes notariales', size: '340 KB', type: 'Word', category: 'Legal', date: '10/03/2025', user: 'Ingrith V.' },
  { name: 'Cámara de comercio', size: '1.8 MB', type: 'Imagen', category: 'Compliance', date: '10/03/2025', user: 'Ingrith V.' },
  { name: 'Histórico transaccional Q1', size: '5.2 MB', type: 'Excel', category: 'KYC', date: '01/04/2025', user: 'Ingrith V.' },
]

const TYPE_ICON_COLORS = {
  PDF: { bg: '#FEE2E2', text: '#DC2626' },
  Word: { bg: '#DBEAFE', text: '#2563EB' },
  Imagen: { bg: '#D1FAE5', text: '#059669' },
  Excel: { bg: '#D1FAE5', text: '#059669' },
}

const CAT_COLORS = {
  Contrato: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  SLA: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  Legal: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  Compliance: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  KYC: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  Fraud: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  Finance: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
}

const TYPE_LABELS = { PDF: 'PDF', Word: 'DOC', Imagen: 'IMG', Excel: 'XLS' }

function TypeIcon({ type }) {
  const c = TYPE_ICON_COLORS[type] || TYPE_ICON_COLORS.PDF
  return (
    <div className="w-[40px] h-[40px] rounded-[8px] flex items-center justify-center shrink-0" style={{ background: c.bg }}>
      <span className="text-[10px] font-bold" style={{ color: c.text }}>{TYPE_LABELS[type] || type}</span>
    </div>
  )
}

function CatBadge({ category }) {
  const s = CAT_COLORS[category] || { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' }
  return (
    <span className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {category}
    </span>
  )
}

function UploadModal({ onClose, onUpload }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('PDF')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const handleSubmit = () => {
    onUpload({
      name: name || file?.name || 'Documento',
      size: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '—',
      type,
      category: category || 'General',
      date: new Date().toLocaleDateString('es-AR'),
      user: 'Agustina R.',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[12px] w-[500px] shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
          <h3 className="text-[16px] font-semibold text-[#0A0B0D] m-0">Subir documento</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151] bg-transparent border-none cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <span className="text-[12px] text-[#374151] font-medium block mb-1">Nombre</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del documento" className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[36px] text-[13px] outline-none focus:border-[#180047] bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[12px] text-[#374151] font-medium block mb-1">Tipo</span>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[36px] text-[13px] outline-none focus:border-[#180047] bg-white">
                <option>PDF</option><option>Word</option><option>Imagen</option><option>Excel</option>
              </select>
            </div>
            <div>
              <span className="text-[12px] text-[#374151] font-medium block mb-1">Categoría</span>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-[#D1D5DB] rounded-[6px] px-3 h-[36px] text-[13px] outline-none focus:border-[#180047] bg-white">
                <option value="">Seleccionar</option>
                {Object.keys(CAT_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors ${
              dragging ? 'border-[#5a6dd7] bg-[#EDF0FF]' : file ? 'border-[#1bc455] bg-[#f0fdf4]' : 'border-[#D1D5DB] hover:border-[#9CA3AF]'
            }`}
          >
            <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]) }} />
            <Upload size={24} className="mx-auto mb-2 text-[#9CA3AF]" />
            {file ? (
              <p className="text-[13px] text-[#0A0B0D] font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-[13px] text-[#374151] font-medium">Arrastrá un archivo o hacé click para subir</p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">PDF, Word, Excel, Imagen</p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E5E7EB]">
          <button onClick={onClose} className="text-[13px] font-medium text-[#374151] bg-white px-4 py-2 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB]">Cancelar</button>
          <button onClick={handleSubmit} className="text-[13px] font-medium text-white bg-[#180047] px-5 py-2 rounded-full border-none cursor-pointer hover:bg-[#2a0066]">Subir</button>
        </div>
      </div>
    </div>
  )
}

function DocDrawer({ doc, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[600px] bg-white z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#0A0B0D] m-0">{doc.name}</h3>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{doc.type} · {doc.size} · Subido {doc.date} por {doc.user}</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151] bg-transparent border-none cursor-pointer"><X size={20} /></button>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#F9FAFB] p-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] w-full h-full flex flex-col items-center justify-center">
            <FileText size={64} className="text-[#D1D5DB] mb-4" />
            <p className="text-[14px] font-medium text-[#0A0B0D]">{doc.name}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{doc.type} · {doc.size}</p>
            <div className="mt-4 flex items-center gap-2">
              <CatBadge category={doc.category} />
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-6">Vista previa no disponible para este tipo de archivo.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DocumentsTab() {
  const [docs, setDocs] = useState(INITIAL_DOCS)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [viewDoc, setViewDoc] = useState(null)

  const filtered = docs.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter && d.category !== catFilter) return false
    if (typeFilter && d.type !== typeFilter) return false
    return true
  })

  return (
    <div className="border border-[#E5E7EB] rounded-[12px] p-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 border border-[#E5E7EB] rounded-full px-3.5 py-2 bg-white focus-within:border-[#5a6dd7]">
          <Search size={15} className="text-[#9CA3AF] shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documento..." className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] placeholder:text-[#9CA3AF]" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-[#E5E7EB] rounded-full px-4 h-[36px] text-[13px] text-[#374151] bg-white outline-none cursor-pointer">
          <option value="">Categoría</option>
          {Object.keys(CAT_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-[#E5E7EB] rounded-full px-4 h-[36px] text-[13px] text-[#374151] bg-white outline-none cursor-pointer">
          <option value="">Tipo</option>
          <option>PDF</option><option>Word</option><option>Imagen</option><option>Excel</option>
        </select>
        <button onClick={() => setShowUpload(true)} className="text-[13px] font-medium text-white bg-[#180047] px-5 py-2 rounded-full border-none cursor-pointer hover:bg-[#2a0066] whitespace-nowrap shrink-0">
          + Subir documento
        </button>
      </div>

      {/* Table */}
      <table className="w-full text-left table-fixed">
        <colgroup>
          <col className="w-[5%]" />
          <col className="w-[25%]" />
          <col className="w-[12%]" />
          <col className="w-[15%]" />
          <col className="w-[25%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th />
            <th className="text-[12px] text-[#6B7280] font-medium pb-3">Nombre</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3">Tipo</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3">Categoría</th>
            <th className="text-[12px] text-[#6B7280] font-medium pb-3">Subido</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filtered.map((doc, idx) => (
            <tr key={idx} className="border-b border-[#F3F4F6]">
              <td className="py-4"><TypeIcon type={doc.type} /></td>
              <td className="py-4">
                <p className="text-[14px] font-semibold text-[#0A0B0D] leading-tight">{doc.name}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{doc.size}</p>
              </td>
              <td className="py-4 text-[13px] text-[#374151]">{doc.type}</td>
              <td className="py-4"><CatBadge category={doc.category} /></td>
              <td className="py-4 text-[13px] text-[#374151]">{doc.date} · {doc.user}</td>
              <td className="py-4">
                <button onClick={() => setViewDoc(doc)} className="flex items-center gap-1.5 text-[13px] font-medium text-[#374151] bg-white px-4 py-1.5 rounded-full border border-[#E5E7EB] cursor-pointer hover:bg-[#F9FAFB]">
                  Ver <ExternalLink size={12} />
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="py-8 text-center text-[13px] text-[#9CA3AF]">No se encontraron documentos.</td></tr>
          )}
        </tbody>
      </table>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={(doc) => setDocs(prev => [...prev, doc])} />}
      {viewDoc && <DocDrawer doc={viewDoc} onClose={() => setViewDoc(null)} />}
    </div>
  )
}
