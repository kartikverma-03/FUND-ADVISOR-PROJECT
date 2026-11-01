import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Sidebar />
      <div className="md:pl-60">
        <TopBar />
        <main className="pb-20 md:pb-0">{children}</main>
      </div>
    </div>
  )
}