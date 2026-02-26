import { useState } from 'react';
import { useAccount } from 'wagmi';
import StarRating from './StarRating';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';

interface ReviewFormProps {
  serviceId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ serviceId, onSuccess }: ReviewFormProps) {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isConnected || !address) {
      showToast('error', t.reviews.connectWallet);
      return;
    }

    if (rating === 0) {
      showToast('error', t.reviews.rating);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': address,
        },
        body: JSON.stringify({
          service_id: serviceId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('error', data.message || t.reviews.error);
        return;
      }

      showToast('success', t.reviews.success);
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch {
      showToast('error', t.reviews.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="glass-card rounded-xl p-4 text-center text-sm text-gray-500">
        {t.reviews.connectWallet}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-4 flex flex-col gap-4">
      <h3 className="text-white font-semibold text-sm">{t.reviews.writeReview}</h3>

      {toast && (
        <div
          className={`text-xs px-3 py-2 rounded-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{t.reviews.rating}</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">
          {t.reviews.comment} <span className="text-gray-600">({comment.length}/500)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder={t.reviews.commentPlaceholder}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                     placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 resize-none
                     transition-all duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                   bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/25
                   hover:bg-[#FF9900]/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? '...' : t.reviews.submit}
      </button>
    </form>
  );
}
