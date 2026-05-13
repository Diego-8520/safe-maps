import Link from "next/link";
import { IconArrowLeft } from "@/components/map/ui/map-icons";

export default function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
      <Link
        href="/"
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 hover:border-cyan-500/40 hover:text-cyan-400 text-slate-400 transition-colors duration-200"
        aria-label="Volver al inicio"
      >
        <IconArrowLeft className="w-4 h-4" />
      </Link>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            Safe Maps
          </span>
        </div>
        <h1 className="text-sm font-semibold text-white leading-tight mt-0.5">
          Análisis de ruta
        </h1>
      </div>
    </div>
  );
}
