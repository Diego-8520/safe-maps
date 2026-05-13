import { IconPin, IconFlag, IconRoute } from "@/components/map/ui/map-icons";

export default function RouteInputs() {
  return (
    <div className="px-5 py-5 border-b border-white/5 space-y-3">
      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Origen
        </label>
        <div className="relative">
          <IconPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            readOnly
            defaultValue="Centro, Cali"
            className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-cyan-500/20 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-default"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-white/5" />
        <div className="flex flex-col gap-0.5">
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
          <div className="w-0.5 h-1.5 bg-slate-700 rounded-full mx-auto" />
        </div>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Destino
        </label>
        <div className="relative">
          <IconFlag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            readOnly
            defaultValue="Aguablanca, Cali"
            className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-emerald-500/20 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-default"
          />
        </div>
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#050a14] font-semibold rounded-lg text-sm transition-colors duration-200 mt-1"
      >
        <IconRoute className="w-4 h-4" />
        Analizar ruta
      </button>
    </div>
  );
}
