interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirmer', danger, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="glass-strong rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              danger
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20'
                : 'gradient-btn text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
