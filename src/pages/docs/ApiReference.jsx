import { PriceBadge } from './shared';
import { NATIVE_ENDPOINTS } from './data';

export default function ApiReference({ d, endpointsRaw, apiData, parsed }) {
  return (
    <section id="api-reference">
      <h2 className="text-2xl font-bold text-white mb-6">{d.apiRefTitle || 'API Reference'}</h2>

      {endpointsRaw === undefined && (
        <p className="text-gray-500 text-sm mb-4 animate-pulse">{d.apiRefLoading || 'Loading endpoints...'}</p>
      )}
      {endpointsRaw === null && (
        <div className="text-yellow-400/80 text-sm mb-4 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
          {d.apiRefError || 'Could not load live endpoints.'}
        </div>
      )}

      <h3 className="text-white font-semibold mb-3">{d.apiRefMarketplace || 'Marketplace'}</h3>
      <div className="overflow-x-auto glass-card rounded-xl p-4 mb-8">
        <table className="w-full text-sm min-w-[360px] sm:min-w-[480px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-white/10">
              <th className="pb-3 pr-4">{d.thMethod || 'Method'}</th>
              <th className="pb-3 pr-4">{d.thRoute || 'Route'}</th>
              <th className="pb-3 pr-4">{d.thCost || 'Cost'}</th>
              <th className="pb-3">{d.thDescription || 'Description'}</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {apiData.marketplace.map((ep, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 font-mono text-xs">{ep.method}</td>
                <td className="py-3 pr-4 font-mono text-blue-400">{ep.route}</td>
                <td className="py-3 pr-4"><PriceBadge price={ep.price} freeLabel={d.free} /></td>
                <td className="py-3 text-sm">{ep.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-white font-semibold mb-3">{d.apiRefNative || 'Native Wrappers'}</h3>
      <div className="overflow-x-auto glass-card rounded-xl p-4">
        <table className="w-full text-sm min-w-[360px] sm:min-w-[480px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-white/10">
              <th className="pb-3 pr-4">{d.thMethod || 'Method'}</th>
              <th className="pb-3 pr-4">{d.thRoute || 'Route'}</th>
              <th className="pb-3 pr-4">{d.thCost || 'Cost'}</th>
              <th className="pb-3">{d.thDescription || 'Description'}</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {(parsed ? apiData.native : NATIVE_ENDPOINTS).map((ep, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 pr-4 font-mono text-xs">{ep.method}</td>
                <td className="py-3 pr-4 font-mono text-blue-400">{parsed ? ep.route : ep.route}</td>
                <td className="py-3 pr-4"><PriceBadge price={ep.price} freeLabel={d.free} /></td>
                <td className="py-3 text-sm">{parsed ? ep.description : (d[ep.titleKey] || ep.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
