interface Props { d: Record<string, string>; }

import { DocsCodeBlock, PriceBadge } from './shared';
import { NATIVE_ENDPOINTS } from './data';

export default function NativeWrappers({ d }: Props) {
  return (
    <section id="native-wrappers">
      <h2 className="text-2xl font-bold text-white mb-2">{d.nativeTitle || 'Native Wrappers'}</h2>
      <p className="text-gray-400 text-sm mb-8">{(d.nativeSubtitle || '').replace('{count}', NATIVE_ENDPOINTS.length)}</p>

      <div className="space-y-8">
        {NATIVE_ENDPOINTS.map(ep => (
          <div key={ep.id} className="glass-card rounded-xl p-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-white font-bold text-lg">{d[ep.titleKey] || ep.id}</h3>
              <PriceBadge price={ep.price} freeLabel={d.free} />
              <code className="text-xs font-mono text-gray-500">{ep.method} {ep.route}</code>
            </div>
            <p className="text-gray-400 text-sm mb-4">{d[ep.descKey] || ''}</p>

            {ep.params.length > 0 && (
              <div className="mb-4">
                <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">{d.nativeParams || 'Parameters'}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-white/10">
                        <th className="text-left pb-2 pr-4">{d.nativeParamName || 'Name'}</th>
                        <th className="text-left pb-2 pr-4">{d.nativeParamType || 'Type'}</th>
                        <th className="text-left pb-2 pr-4">{d.nativeParamRequired || 'Required'}</th>
                        <th className="text-left pb-2">{d.nativeParamDesc || 'Description'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {ep.params.map(p => (
                        <tr key={p.name} className="border-b border-white/5">
                          <td className="py-2 pr-4 font-mono text-[#FF9900]">{p.name}</td>
                          <td className="py-2 pr-4">{p.type}</td>
                          <td className="py-2 pr-4">{p.required ? (d.nativeYes || 'Yes') : (d.nativeNo || 'No')}</td>
                          <td className="py-2">{d[p.descKey] || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">{d.nativeExample || 'Example Request'}</h4>
            <DocsCodeBlock code={ep.curl} />

            <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mt-4 mb-2">{d.nativeResponse || 'Example Response'}</h4>
            <DocsCodeBlock code={ep.response} />
          </div>
        ))}
      </div>
    </section>
  );
}
