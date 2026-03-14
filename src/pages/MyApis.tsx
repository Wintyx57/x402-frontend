import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../i18n/LanguageContext';
import { useMyServices, Service } from '../hooks/useMyServices';
import { useProviderRevenue } from '../hooks/useProviderRevenue';
import { useWalletSign } from '../hooks/useWalletSign';
import { API_URL } from '../config';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500/20 text-green-400',
    offline: 'bg-red-500/20 text-red-400',
    degraded: 'bg-yellow-500/20 text-yellow-400',
    unknown: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || colors.unknown}`}>
      {status}
    </span>
  );
}

function EditModal({ service, onClose, onSave }: {
  service: Service;
  onClose: () => void;
  onSave: (data: Record<string, any>) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || '');
  const [price, setPrice] = useState(service.price_usdc.toString());
  const [tags, setTags] = useState(service.tags?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updates: Record<string, any> = {};
      if (name !== service.name) updates.name = name;
      if (description !== (service.description || '')) updates.description = description;
      const priceNum = parseFloat(price);
      if (!isNaN(priceNum) && priceNum !== service.price_usdc) updates.price_usdc = priceNum;
      if (tags !== (service.tags?.join(', ') || '')) {
        updates.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }
      await onSave(updates);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">{t.myApis?.editService || 'Edit Service'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
                   className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50 resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Price (USDC)</label>
            <input type="number" step="0.001" value={price} onChange={e => setPrice(e.target.value)}
                   className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
                   className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border border-white/10 rounded-lg">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#FF9900] hover:bg-[#FF9900]/90 rounded-lg cursor-pointer border-none disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ service, onClose, onConfirm }: {
  service: Service;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-2">{t.myApis?.deleteService || 'Delete Service'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          {t.myApis?.deleteConfirm || 'Are you sure you want to delete'} <strong className="text-white">{service.name}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border border-white/10 rounded-lg">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer border-none disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyApis() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { data: services, isLoading: servicesLoading } = useMyServices();
  const { data: revenue, isLoading: revenueLoading } = useProviderRevenue();
  const { signAction } = useWalletSign();
  const queryClient = useQueryClient();
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  const handleUpdate = async (serviceId: string, updates: Record<string, any>) => {
    const { message, signature } = await signAction('update-service', serviceId);
    const res = await fetch(`${API_URL}/api/services/${serviceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': address!,
        'X-Wallet-Message': message,
        'X-Wallet-Signature': signature,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Update failed');
    }
    queryClient.invalidateQueries({ queryKey: ['myServices'] });
  };

  const handleDelete = async (serviceId: string) => {
    const { message, signature } = await signAction('delete-service', serviceId);
    const res = await fetch(`${API_URL}/api/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'X-Wallet-Address': address!,
        'X-Wallet-Message': message,
        'X-Wallet-Signature': signature,
      },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Delete failed');
    }
    queryClient.invalidateQueries({ queryKey: ['myServices'] });
  };

  // Guard: not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">{t.myApis?.connectRequired || 'Connect your wallet'}</h2>
          <p className="text-sm text-gray-400">{t.myApis?.connectDesc || 'Connect your wallet to see and manage your APIs.'}</p>
        </div>
      </div>
    );
  }

  const totalEarned = revenue?.total_earned ?? 0;
  const totalCalls = revenue?.total_calls ?? 0;
  const serviceCount = services?.length ?? 0;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t.myApis?.title || 'My APIs'}</h1>
        <p className="text-gray-400">{t.myApis?.subtitle || 'Manage your listed APIs and track revenue.'}</p>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">{t.myApis?.totalApis || 'Total APIs'}</p>
          <p className="text-2xl font-bold text-white">{servicesLoading ? '...' : serviceCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">{t.myApis?.totalEarned || 'Total Earned'}</p>
          <p className="text-2xl font-bold text-[#FF9900]">
            {revenueLoading ? '...' : `${totalEarned.toFixed(2)} USDC`}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">{t.myApis?.totalCalls || 'Total Calls'}</p>
          <p className="text-2xl font-bold text-white">{revenueLoading ? '...' : totalCalls}</p>
        </div>
      </div>

      {/* Revenue by chain */}
      {revenue && revenue.by_chain && Object.keys(revenue.by_chain).length > 0 && (
        <div className="glass-card rounded-xl p-4 mb-8">
          <h3 className="text-sm font-medium text-gray-300 mb-3">{t.myApis?.revenueByChain || 'Revenue by Chain'}</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(revenue.by_chain).map(([chain, amount]) => (
              <div key={chain} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 capitalize">{chain}:</span>
                <span className="text-sm font-semibold text-[#FF9900]">{(amount as number).toFixed(4)} USDC</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service list */}
      {servicesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-xl p-4 animate-shimmer h-20" />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="space-y-3">
          {services.map(service => {
            const serviceRevenue = revenue?.by_service?.find(s => s.service_id === service.id);
            return (
              <div key={service.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link to={`/services/${service.id}`} className="text-white font-medium text-sm hover:text-[#FF9900] no-underline transition-colors truncate">
                      {service.name}
                    </Link>
                    <StatusBadge status={service.status} />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{service.url}</p>
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-right">
                    <p className="text-[#FF9900] font-semibold">{service.price_usdc} USDC</p>
                    {serviceRevenue && (
                      <p className="text-gray-400">{serviceRevenue.earned.toFixed(4)} earned / {serviceRevenue.calls} calls</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditService(service)}
                            className="px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors">
                      {t.myApis?.edit || 'Edit'}
                    </button>
                    <button onClick={() => setDeleteService(service)}
                            className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg cursor-pointer transition-colors">
                      {t.myApis?.delete || 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">{t.myApis?.noApis || 'No APIs yet'}</h3>
          <p className="text-sm text-gray-400 mb-4">{t.myApis?.noApisDesc || 'List your first API and start earning USDC.'}</p>
          <Link to="/register" className="inline-block gradient-btn text-white text-sm font-medium px-6 py-2.5 rounded-xl no-underline">
            {t.myApis?.registerCta || 'Register an API'}
          </Link>
        </div>
      )}

      {/* Modals */}
      {editService && (
        <EditModal
          service={editService}
          onClose={() => setEditService(null)}
          onSave={(updates) => handleUpdate(editService.id, updates)}
        />
      )}
      {deleteService && (
        <DeleteModal
          service={deleteService}
          onClose={() => setDeleteService(null)}
          onConfirm={() => handleDelete(deleteService.id)}
        />
      )}
    </div>
  );
}
