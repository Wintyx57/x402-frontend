import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────────────────────
// OpenApiPanel — CTA card that navigates to /import
// ─────────────────────────────────────────────────────────────────────────────

export default function OpenApiPanel({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in-up">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
        aria-label="Back to options"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Glass card */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.015] border border-white/[0.07] rounded-3xl backdrop-blur-xl relative overflow-hidden">
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        {/* Orange ambient glow */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse 50% 30% at 50% 0%, rgba(255,153,0,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 py-16 px-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(255,153,0,0.12)', border: '1px solid rgba(255,153,0,0.25)' }}
            aria-hidden="true"
          >
            <svg className="w-8 h-8" fill="none" stroke="#FF9900" strokeWidth={1.6} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 className="text-white font-bold text-2xl mb-3 leading-tight">
            Import from OpenAPI Spec
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
            Upload your OpenAPI (Swagger) spec file and import all your endpoints in one go.
          </p>

          <button
            type="button"
            onClick={() => navigate('/import')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #B45309, #FF9900)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Spec File
          </button>

          <p className="text-gray-600 text-xs mt-5">
            Supports JSON and YAML — OpenAPI 3.x &amp; Swagger 2.0
          </p>
        </div>
      </div>
    </div>
  )
}
