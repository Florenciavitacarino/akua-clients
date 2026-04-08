import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ExternalLink, Edit } from 'lucide-react'
import CreateClientModal from '../components/CreateClientModal'

const CLIENTS = [
  { id: 'cli-d6rmu7cup15j3tpnhelg', name: 'Zippos', country: 'UY', flag: '🇺🇾', city: 'Montevideo', status: 'ACTIVE', akuaMode: 'PROCESSOR', tenant: 'zippos.la' },
  { id: 'cli-f8kmu9aup27k5rpnxyzq', name: 'PayFlow', country: 'AR', flag: '🇦🇷', city: 'Buenos Aires', status: 'ACTIVE', akuaMode: 'GATEWAY', tenant: 'payflow.io' },
  { id: 'cli-h2nop3bvq39m7tqrzabc', name: 'MercadoPro', country: 'CO', flag: '🇨🇴', city: 'Bogotá', status: 'INACTIVE', akuaMode: 'PROCESSOR', tenant: 'mercadopro.co' },
]

function ClientCard({ client }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white border border-grey-2 rounded-lg p-4 flex items-center gap-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-grey-1 rounded-[10px] shrink-0" />
        <div>
          <h3 className="text-[15px] font-semibold text-grey-9 m-0">{client.name}</h3>
          <div className="flex items-center gap-1.5 text-[13px] text-grey-6 mt-0.5">
            <span>{client.flag}</span>
            <span>{client.country}</span>
            <span className="text-grey-4">•</span>
            <span>{client.city}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-48">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-grey-6">Status:</span>
          <span className={`text-[11px] font-medium px-3 h-6 inline-flex items-center rounded-[18px] border ${
            client.status === 'ACTIVE' ? 'bg-[rgba(27,196,85,0.15)] border-success text-success' : 'bg-grey-1 border-inactive text-inactive'
          }`}>{client.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-grey-6">Akua Mode:</span>
          <span className="text-[11px] font-medium bg-[rgba(24,0,71,0.1)] border border-brand text-brand px-3 h-6 inline-flex items-center rounded-[18px]">{client.akuaMode}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-56">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-grey-6">Tenant:</span>
          <span className="text-[13px] text-grey-9">{client.tenant}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-grey-6">ID:</span>
          <span className="text-[11px] font-semibold bg-[rgba(24,0,71,0.1)] text-brand px-2 py-0.5 rounded">{client.id}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={() => navigate(`/clients/${client.id}`)} className="flex items-center gap-2 bg-brand text-white text-[13px] font-medium px-3.5 h-8 rounded-lg hover:bg-brand-hover border-none cursor-pointer">
          <ExternalLink size={13} /> Client Details
        </button>
        <button className="flex items-center gap-2 bg-[rgba(24,0,71,0.1)] text-brand text-[13px] font-medium px-3.5 h-8 rounded-lg hover:bg-[rgba(24,0,71,0.18)] border-none cursor-pointer">
          <Edit size={13} /> Client Actions
        </button>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState('normal')
  const [showModal, setShowModal] = useState(false)
  const tabs = ['Normal', 'Test', 'Demo']

  return (
    <>
      <nav className="flex items-center gap-1.5 text-[13px] mb-4">
        <span className="text-grey-5">Home</span>
        <span className="text-grey-4">/</span>
        <span className="text-brand font-medium">Clients</span>
      </nav>

      <div className="flex flex-col gap-5">
        <div className="border border-grey-2 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-grey-2">
            <h1 className="text-[15px] font-bold text-grey-9 m-0">Clients</h1>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand text-white text-[13px] font-medium px-3.5 h-8 rounded-lg hover:bg-brand-hover border-none cursor-pointer">
              <Plus size={15} /> Add client
            </button>
          </div>
          <div className="p-4">
            <div className="bg-[#edf2ff] rounded-lg p-4">
              <h2 className="text-[14px] font-semibold text-grey-9 m-0">Client Management</h2>
              <p className="text-[13px] text-grey-6 mt-1">View and manage all your clients (tenants) and their configurations.</p>
            </div>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="inline-flex items-center border border-grey-2 rounded-xl p-1 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`inline-flex items-center px-5 py-[9px] rounded-[9px] text-[13px] font-normal border-none cursor-pointer whitespace-nowrap transition-all ${
                activeTab === tab.toLowerCase()
                  ? 'bg-brand text-white font-medium'
                  : 'bg-transparent text-grey-7 hover:bg-grey-0 hover:text-grey-9'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="border border-grey-3 rounded-lg px-3 py-2 flex items-center gap-3 bg-white">
          <Search size={15} className="text-grey-4" />
          <input type="text" placeholder="Search by name, ID, or tenant..." className="bg-transparent border-none outline-none text-[13px] flex-1 text-grey-7 placeholder:text-grey-4 font-[inherit]" />
        </div>

        <div className="flex flex-col gap-4">
          {CLIENTS.map((client) => <ClientCard key={client.id} client={client} />)}
        </div>
      </div>

      <CreateClientModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
