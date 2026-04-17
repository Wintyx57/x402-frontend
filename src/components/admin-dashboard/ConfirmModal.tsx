import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmer",
  danger,
  loading,
  disabled,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useRef(
    `confirm-modal-title-${Math.random().toString(36).slice(2, 9)}`,
  );
  const descId = useRef(
    `confirm-modal-desc-${Math.random().toString(36).slice(2, 9)}`,
  );

  // Auto-focus the Cancel button on open (safer default for destructive
  // actions — keeps an accidental Enter from confirming).
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // ESC closes the modal unless a request is in flight.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, loading]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={loading ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        aria-describedby={descId.current}
        className="bg-[#1e2332] border border-white/15 shadow-2xl rounded-2xl p-6 w-full max-w-sm mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {danger && (
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-xl font-bold">!</span>
            </div>
          </div>
        )}
        <h3
          id={titleId.current}
          className="text-lg font-bold text-white mb-2 text-center"
        >
          {title}
        </h3>
        <p
          id={descId.current}
          className="text-sm text-gray-400 mb-6 text-center"
        >
          {message}
        </p>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || disabled}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              danger
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                : "gradient-btn text-white"
            }`}
          >
            {loading && (
              <div
                className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
