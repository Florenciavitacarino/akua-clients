import { Search, Bell, Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="h-14 bg-white border-b-[0.5px] border-grey-2 flex items-center px-5 gap-3 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-3 shrink-0">
        <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <span className="text-grey-9 text-lg font-bold tracking-tight">akua</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-[420px] relative ml-auto">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-white border border-grey-3 rounded-lg py-2 pl-[34px] pr-3 text-grey-9 text-[13px] outline-none font-[inherit] focus:border-brand-accent focus:shadow-[0_0_0_2px_rgba(90,109,215,0.1)]"
        />
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        {/* Ask AI */}
        <button className="flex items-center gap-1.5 px-3.5 py-[7px] bg-white rounded-lg border border-grey-3 text-grey-8 text-[13px] font-medium cursor-pointer hover:border-brand-accent hover:text-brand-accent transition-all shrink-0">
          <Sparkles size={14} />
          Ask AI
        </button>

        {/* Production toggle */}
        <div className="flex items-center gap-2 text-grey-8 text-[13px] font-medium shrink-0">
          <span>Production</span>
          <div className="w-[34px] h-5 bg-brand rounded-full relative cursor-pointer">
            <div className="absolute right-[2px] top-[2px] w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>

        {/* Notification */}
        <button className="flex items-center text-grey-6 p-1 bg-transparent border-none cursor-pointer relative hover:text-brand-accent shrink-0">
          <Bell size={18} />
          <div className="absolute top-[3px] right-[3px] w-[7px] h-[7px] bg-error rounded-full border-[1.5px] border-white" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0">
          <span className="text-grey-8 text-[13px] font-medium">Agustina Romagnoli</span>
          <div className="w-8 h-8 rounded-full bg-grey-2 flex items-center justify-center text-grey-7 text-xs font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  )
}
