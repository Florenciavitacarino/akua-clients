import { useLocation, Link } from 'react-router-dom'
import {
  Home, CreditCard, Building2, DollarSign, ShieldAlert,
  BarChart3, Settings, Code2, FileText, HelpCircle, ChevronRight, ChevronDown
} from 'lucide-react'

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Payments', icon: CreditCard, path: '/payments', hasSubmenu: true },
  { name: 'Merchants', icon: Building2, path: '/merchants', hasSubmenu: true },
  { name: 'Finances', icon: DollarSign, path: '/finances', hasSubmenu: true },
  { name: 'Risk', icon: ShieldAlert, path: '/risk', hasSubmenu: true },
  { name: 'Insights', icon: BarChart3, path: '/insights', hasSubmenu: true },
  { name: 'Settings', icon: Settings, path: '/settings', hasSubmenu: true },
  { name: 'Developers', icon: Code2, path: '/developers', hasSubmenu: true },
  { name: 'Documentation', icon: FileText, path: '/docs' },
  { name: 'Help Center', icon: HelpCircle, path: '/help' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-[210px] min-w-[210px] bg-white border-r border-grey-2 flex flex-col h-full overflow-y-auto">
      {/* Organization Selector */}
      <div className="mx-3.5 mt-3.5 mb-1.5">
        <button className="flex items-center gap-2 w-full border-[1.5px] border-grey-3 rounded-[10px] bg-white px-3.5 py-2.5 text-grey-8 text-[13px] font-medium cursor-pointer">
          <Building2 size={16} className="text-grey-6 shrink-0" />
          <span className="flex-1 text-left truncate">All Organizati...</span>
          <ChevronDown size={14} className="text-grey-5 shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
            (item.name === 'Home' && (location.pathname === '/' || location.pathname === '/clients')) ||
            (item.name === 'Merchants' && location.pathname.startsWith('/clients'))
          return (
            <Link
              key={item.name}
              to={item.name === 'Merchants' ? '/clients' : item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] no-underline mb-px transition-all duration-150 ${
                isActive
                  ? 'bg-brand-light text-brand-accent font-medium'
                  : 'text-grey-7 hover:bg-grey-0'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.hasSubmenu && <ChevronRight size={14} className="text-grey-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3.5 border-t border-grey-2">
        <span className="text-[11.5px] text-grey-5 underline cursor-pointer hover:text-brand-accent">
          Report a security issue
        </span>
      </div>
    </aside>
  )
}
