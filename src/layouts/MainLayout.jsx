import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen font-[inherit]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#fafafa] p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
