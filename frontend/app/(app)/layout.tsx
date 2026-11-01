import Sidebar from "@/components/Sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Sidebar />
      <main className="md:pl-60 pb-20 md:pb-0">{children}</main>
    </div>
  )
}