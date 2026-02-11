import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { API_URL } from '../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useReveal();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`${API_URL}/api/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // Chart options communes
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 153, 0, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-white/10 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-64 bg-white/10 rounded mb-8 animate-pulse"></div>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-xl p-5 h-24 animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-xl p-6 h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error or no data
  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">{t.analytics.title}</h1>
        <p className="text-gray-400 text-sm mb-8">{t.analytics.subtitle}</p>
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-gray-400">{t.analytics.noData}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const dailyVolumeData = {
    labels: data.dailyVolume?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Volume (USDC)',
        data: data.dailyVolume?.map(d => d.total) || [],
        borderColor: '#FF9900',
        backgroundColor: 'rgba(255, 153, 0, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FF9900',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const topServicesData = {
    labels: data.topServices?.map(s => s.endpoint) || [],
    datasets: [
      {
        label: 'Calls',
        data: data.topServices?.map(s => s.count) || [],
        backgroundColor: '#FF9900',
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  };

  const cumulativeRevenueData = {
    labels: data.cumulativeRevenue?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Revenue (USDC)',
        data: data.cumulativeRevenue?.map(d => d.total) || [],
        borderColor: '#34D399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#34D399',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">
        {t.analytics.title}
      </h1>
      <p className="text-gray-400 text-sm mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {t.analytics.subtitle}
      </p>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-2xl font-bold text-white mb-1">
            ${data.totals?.revenue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {t.analytics.totalRevenue}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-2xl font-bold text-white mb-1">
            {data.totals?.transactions?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {t.analytics.totalTransactions}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-2xl font-bold text-white mb-1">
            {data.totals?.services || '0'}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {t.analytics.totalServices}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Daily Volume Chart */}
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-semibold text-white mb-4">
            {t.analytics.dailyVolumeTitle}
          </h2>
          <div className="h-72">
            <Line data={dailyVolumeData} options={commonOptions} />
          </div>
        </div>

        {/* Top Services Chart */}
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-xl font-semibold text-white mb-4">
            {t.analytics.topServicesTitle}
          </h2>
          <div className="h-64">
            <Bar data={topServicesData} options={commonOptions} />
          </div>
        </div>

        {/* Cumulative Revenue Chart */}
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-xl font-semibold text-white mb-4">
            {t.analytics.cumulativeRevenueTitle}
          </h2>
          <div className="h-72">
            <Line data={cumulativeRevenueData} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
