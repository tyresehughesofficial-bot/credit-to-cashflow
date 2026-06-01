import { BrandMark, SidebarNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <BrandMark />
        </div>
        <SidebarNav />
        <div className="border-t border-border p-4 text-[10px] leading-relaxed text-muted-foreground">
          TRIAD T ENTERPRISE™
          <br />
          AI Command Center · v1.0
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
