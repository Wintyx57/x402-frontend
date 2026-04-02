import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccount, useSignMessage } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useTranslation } from "../i18n/LanguageContext";
import {
  useProviderAnalytics,
  type ProviderAnalytics,
  type ServiceInfo,
} from "../hooks/useProviderAnalytics";
import { useWalletSign } from "../hooks/useWalletSign";
import { API_URL } from "../config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
);

type Tab = "overview" | "revenue" | "apis" | "payouts" | "payment-links";

const CHAIN_COLORS: Record<string, string> = {
  base: "#3B82F6",
  skale: "#A855F7",
  polygon: "#8B5CF6",
};
const STATUS_COLORS: Record<string, string> = {
  online: "#34D399",
  offline: "#EF4444",
  degraded: "#FBBF24",
  unknown: "#6B7280",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function StatusDot({ status }: { status: string }) {
  return (
    <div
      className="w-2.5 h-2.5 rounded-full"
      style={{ background: STATUS_COLORS[status] || STATUS_COLORS.unknown }}
      title={status}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-green-500/20 text-green-400",
    offline: "bg-red-500/20 text-red-400",
    degraded: "bg-yellow-500/20 text-yellow-400",
    unknown: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || colors.unknown}`}
    >
      {status}
    </span>
  );
}

// ─── Edit/Delete Modals (preserved from existing) ─────────────────────────

function EditModal({
  service,
  onClose,
  onSave,
}: {
  service: ServiceInfo;
  onClose: () => void;
  onSave: (data: Record<string, any>) => Promise<void>;
}) {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || "");
  const [price, setPrice] = useState(service.price_usdc.toString());
  const [tags, setTags] = useState(service.tags?.join(", ") || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updates: Record<string, any> = {};
      if (name !== service.name) updates.name = name;
      if (description !== (service.description || ""))
        updates.description = description;
      const priceNum = parseFloat(price);
      if (!isNaN(priceNum) && priceNum !== service.price_usdc)
        updates.price_usdc = priceNum;
      if (tags !== (service.tags?.join(", ") || ""))
        updates.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }
      await onSave(updates);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Edit Service</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Price (USDC)
            </label>
            <input
              type="number"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Tags (comma separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF9900]/50"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border border-white/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#FF9900] hover:bg-[#FF9900]/90 rounded-lg cursor-pointer border-none disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  service,
  onClose,
  onConfirm,
}: {
  service: ServiceInfo;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          Delete Service
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Are you sure you want to delete{" "}
          <strong className="text-white">{service.name}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border border-white/10 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer border-none disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function MyApis() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { data, isLoading, refetch } = useProviderAnalytics();
  const { signAction } = useWalletSign();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [editService, setEditService] = useState<ServiceInfo | null>(null);
  const [deleteService, setDeleteService] = useState<ServiceInfo | null>(null);

  const handleUpdate = async (
    serviceId: string,
    updates: Record<string, any>,
  ) => {
    const { message, signature } = await signAction(
      "update-service",
      serviceId,
    );
    const res = await fetch(`${API_URL}/api/services/${serviceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Wallet-Address": address!,
        "X-Wallet-Message": message,
        "X-Wallet-Signature": signature,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Update failed");
    }
    queryClient.invalidateQueries({ queryKey: ["providerAnalytics"] });
  };

  const handleDelete = async (serviceId: string) => {
    const { message, signature } = await signAction(
      "delete-service",
      serviceId,
    );
    const res = await fetch(`${API_URL}/api/services/${serviceId}`, {
      method: "DELETE",
      headers: {
        "X-Wallet-Address": address!,
        "X-Wallet-Message": message,
        "X-Wallet-Signature": signature,
      },
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Delete failed");
    }
    queryClient.invalidateQueries({ queryKey: ["providerAnalytics"] });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass glow-orange-lg rounded-2xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#FF9900]/10 border-2 border-[#FF9900]/30 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[#FF9900]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {t.myApis?.connectRequired || "Connect Your Wallet"}
          </h2>
          <p className="text-gray-400 text-sm">
            {t.myApis?.connectDesc ||
              "Connect your wallet to view your provider dashboard and earnings."}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400 mb-4">Failed to load analytics</p>
          <button
            onClick={() => refetch()}
            className="gradient-btn text-white text-sm px-4 py-2 rounded-lg cursor-pointer border-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "revenue", label: "Revenue" },
    { key: "apis", label: `My APIs (${data.active_services})` },
    { key: "payouts", label: "Payouts" },
    { key: "payment-links", label: "Payment Links" },
  ];

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9900] to-[#FEBD69] flex items-center justify-center text-black font-bold text-sm shrink-0">
          0x
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {t.myApis?.title || "Provider Dashboard"}
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)} &middot;{" "}
            {data.active_services} API{data.active_services !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/10 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${tab === t.key ? "text-[#FF9900] border-b-2 border-[#FF9900]" : "text-gray-500 hover:text-gray-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab data={data} />}
      {tab === "revenue" && <RevenueTab data={data} />}
      {tab === "apis" && (
        <ApisTab
          data={data}
          onEdit={setEditService}
          onDelete={setDeleteService}
        />
      )}
      {tab === "payouts" && <PayoutsTab data={data} />}
      {tab === "payment-links" && <PaymentLinksTab address={address!} />}

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

// ─── Overview Tab ─────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: ProviderAnalytics }) {
  const last7 = data.daily_revenue.slice(-7).reduce((s, d) => s + d.amount, 0);
  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          Total Revenue
        </p>
        <p className="text-5xl font-extrabold text-[#34D399]">
          ${(data.total_earned ?? 0).toFixed(2)}
        </p>
        {last7 > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            +${last7.toFixed(2)} this week
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Calls", value: data.total_calls.toLocaleString() },
          { label: "Active APIs", value: data.active_services.toString() },
          {
            label: "Avg Uptime",
            value: data.avg_uptime != null ? `${data.avg_uptime}%` : "N/A",
          },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">
          Recent Earnings
        </h3>
        {data.recent_earnings.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No earnings yet.{" "}
            <Link to="/register" className="text-[#FF9900] no-underline">
              Register an API
            </Link>{" "}
            and start earning!
          </p>
        ) : (
          <div className="space-y-1">
            {data.recent_earnings.slice(0, 10).map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-xs text-gray-600 w-20 shrink-0">
                  {timeAgo(e.created_at)}
                </span>
                <span className="text-sm text-gray-300 flex-1 truncate">
                  {e.service_name}
                </span>
                <span className="text-[10px] text-gray-600 w-12 text-center uppercase shrink-0">
                  {e.chain}
                </span>
                <span className="text-sm font-semibold text-[#34D399] w-24 text-right shrink-0">
                  +${e.amount.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Revenue Tab ──────────────────────────────────────────────────────────

function RevenueTab({ data }: { data: ProviderAnalytics }) {
  const chartData = {
    labels: data.daily_revenue.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: "Revenue (USDC)",
        data: data.daily_revenue.map((d) => d.amount),
        backgroundColor: "#FF9900",
        borderRadius: 4,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: any) => `$${ctx.raw.toFixed(4)} USDC` },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#666", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#666", callback: (v: any) => `$${v}` },
      },
    },
  };
  const chainEntries = Object.entries(data.by_chain);
  const doughnutData = {
    labels: chainEntries.map(([c]) => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [
      {
        data: chainEntries.map(([, v]) => v),
        backgroundColor: chainEntries.map(
          ([c]) => CHAIN_COLORS[c] || "#6B7280",
        ),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">
          Revenue — Last 30 Days
        </h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">By Chain</h3>
          {chainEntries.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <Doughnut
                  data={doughnutData}
                  options={{
                    plugins: { legend: { display: false } },
                    cutout: "60%",
                  }}
                />
              </div>
              <div className="space-y-2">
                {chainEntries.map(([chain, amount]) => (
                  <div key={chain} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: CHAIN_COLORS[chain] || "#6B7280" }}
                    />
                    <span className="text-sm text-gray-300 capitalize">
                      {chain}
                    </span>
                    <span className="text-sm font-semibold text-white ml-auto">
                      ${(amount as number).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No revenue data yet.</p>
          )}
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">
            Top APIs by Revenue
          </h3>
          <div className="space-y-3">
            {data.by_service.slice(0, 5).map((s) => (
              <div
                key={s.service_id}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {s.service_name}
                  </p>
                  <p className="text-xs text-gray-600">{s.calls} calls</p>
                </div>
                <span className="text-sm font-bold text-[#34D399]">
                  ${s.earned.toFixed(2)}
                </span>
              </div>
            ))}
            {data.by_service.length === 0 && (
              <p className="text-gray-600 text-sm">No API calls yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APIs Tab ─────────────────────────────────────────────────────────────

function ApisTab({
  data,
  onEdit,
  onDelete,
}: {
  data: ProviderAnalytics;
  onEdit: (s: ServiceInfo) => void;
  onDelete: (s: ServiceInfo) => void;
}) {
  const statsMap = new Map(data.by_service.map((s) => [s.service_id, s]));

  if (data.services.length === 0) {
    return (
      <div className="animate-fade-in-up glass rounded-2xl p-8 text-center">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">No APIs yet</h3>
        <p className="text-sm text-gray-400 mb-4">
          List your first API and start earning USDC.
        </p>
        <Link
          to="/register"
          className="inline-block gradient-btn text-white text-sm font-medium px-6 py-2.5 rounded-xl no-underline"
        >
          Register an API
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-3">
      {data.services.map((svc) => {
        const stats = statsMap.get(svc.id);
        return (
          <div
            key={svc.id}
            className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusDot status={svc.status || "unknown"} />
                <Link
                  to={`/services/${svc.id}`}
                  className="text-white font-medium text-sm hover:text-[#FF9900] no-underline transition-colors truncate"
                >
                  {svc.name}
                </Link>
                <StatusBadge status={svc.status || "unknown"} />
              </div>
              <p className="text-xs text-gray-500 truncate">{svc.url}</p>
              {svc.tags && svc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {svc.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs shrink-0">
              <div className="text-center">
                <p className="text-lg font-bold text-[#34D399]">
                  ${(stats?.earned || 0).toFixed(2)}
                </p>
                <p className="text-gray-500">{stats?.calls || 0} calls</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-[#FF9900] font-semibold">
                  ${svc.price_usdc}
                </p>
                <p className="text-gray-500">per call</p>
              </div>
              {svc.trust_score != null && (
                <div className="text-center">
                  <p className="text-sm text-white font-semibold">
                    {svc.trust_score}%
                  </p>
                  <p className="text-gray-500">uptime</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(svc)}
                  className="px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(svc)}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg cursor-pointer transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payouts Tab ──────────────────────────────────────────────────────────

function PayoutsTab({ data }: { data: ProviderAnalytics }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase mb-1">Pending</p>
          <p className="text-3xl font-bold text-[#FBBF24]">
            ${(data.payouts_summary?.pending_total ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {data.payouts_summary?.pending_count ?? 0} transactions
          </p>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase mb-1">Paid</p>
          <p className="text-3xl font-bold text-[#34D399]">
            ${(data.payouts_summary?.paid_total ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {data.payouts_summary?.paid_count ?? 0} transactions
          </p>
        </div>
      </div>
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          How Payouts Work
        </h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <span className="text-[#FF9900] font-bold mt-0.5">1</span>
            <p>
              When an AI agent calls your API, they pay the platform in USDC
              on-chain.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#FF9900] font-bold mt-0.5">2</span>
            <p>
              95% of each payment is recorded as owed to you. 5% is the platform
              fee.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#FF9900] font-bold mt-0.5">3</span>
            <p>
              With split payments (SKALE/Polygon), your 95% is sent directly to
              your wallet in the same transaction.
            </p>
          </div>
        </div>
      </div>
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">
          Earnings by API
        </h3>
        {data.by_service.length === 0 ? (
          <p className="text-gray-600 text-sm">No earnings recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.by_service.map((s) => (
              <div
                key={s.service_id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white">{s.service_name}</span>
                  <span className="text-xs text-gray-600 ml-2">
                    {s.calls} calls
                  </span>
                </div>
                <span className="text-sm font-bold text-[#34D399]">
                  ${s.earned.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payment Links Tab ────────────────────────────────────────────────────

interface PaymentLink {
  id: string;
  title: string;
  price_usdc: number;
  paid_count: number;
  views: number;
  is_active: boolean;
  created_at: string;
}

function PaymentLinksTab({ address }: { address: string }) {
  const { signMessageAsync } = useSignMessage();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`${API_URL}/api/payment-links/my/${address}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Failed to load payment links");
        }
        return res.json();
      })
      .then((data) => {
        setLinks(Array.isArray(data) ? data : (data.links ?? []));
        setLoading(false);
      })
      .catch((err: unknown) => {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load payment links",
        );
        setLoading(false);
      });
  }, [address]);

  const handleDeactivate = async (linkId: string) => {
    setDeactivating(linkId);
    try {
      const timestamp = Date.now();
      const message = `delete-payment-link:${linkId}:${address}:${timestamp}`;
      const signature = await signMessageAsync({ message });
      const res = await fetch(`${API_URL}/api/payment-links/${linkId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerAddress: address,
          signature,
          timestamp,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to deactivate");
      }
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, is_active: false } : l)),
      );
    } catch (err: unknown) {
      setDeactivateError(
        err instanceof Error ? err.message : "Failed to deactivate link",
      );
    } finally {
      setDeactivating(null);
    }
  };

  const handleCopy = (linkId: string) => {
    const url = `${window.location.origin}/pay/${linkId}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(linkId);
        setTimeout(() => setCopied(null), 2000);
      },
      () => {
        // Clipboard API may fail in insecure contexts or if permission is denied
      },
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center py-16">
        <div className="text-gray-400 animate-pulse">
          Loading payment links...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="animate-fade-in-up glass rounded-2xl p-6 text-center">
        <p className="text-red-400 text-sm">{fetchError}</p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="animate-fade-in-up glass rounded-2xl p-8 text-center">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">
          No payment links yet
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Create a payment link to monetize any content or resource.
        </p>
        <Link
          to="/register"
          className="inline-block gradient-btn text-white text-sm font-medium px-6 py-2.5 rounded-xl no-underline"
        >
          Create a Payment Link
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-3">
      {deactivateError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
        >
          {deactivateError}
        </div>
      )}
      {links.map((link) => (
        <div
          key={link.id}
          className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${link.is_active ? "bg-[#34D399]" : "bg-gray-500"}`}
                aria-hidden="true"
              />
              <span className="text-white font-medium text-sm truncate">
                {link.title}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  link.is_active
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {link.is_active ? "active" : "inactive"}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Created {timeAgo(link.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="text-center">
              <p className="text-lg font-bold text-[#FF9900]">
                ${link.price_usdc}
              </p>
              <p className="text-gray-500">USDC</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                {link.paid_count}
              </p>
              <p className="text-gray-500">paid</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">{link.views}</p>
              <p className="text-gray-500">views</p>
            </div>
            <div className="flex gap-2">
              {link.is_active && (
                <button
                  onClick={() => handleCopy(link.id)}
                  className="px-3 py-1.5 text-xs text-[#A78BFA] hover:text-purple-300 bg-[#A78BFA]/5 hover:bg-[#A78BFA]/10 border border-[#A78BFA]/20 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                >
                  {copied === link.id ? "Copied!" : "Copy Link"}
                </button>
              )}
              {link.is_active && (
                <button
                  onClick={() => handleDeactivate(link.id)}
                  disabled={deactivating === link.id}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                >
                  {deactivating === link.id ? "..." : "Deactivate"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
