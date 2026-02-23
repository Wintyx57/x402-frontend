import { useAccount, useSwitchChain } from 'wagmi';
import { useTranslation } from '../i18n/LanguageContext';
import { CHAIN_CONFIG } from '../config';

const CHAINS = [
  { id: 8453, label: 'Base', gas: '~$0.001', color: 'bg-blue-500', free: false },
  { id: 2046399126, label: 'SKALE Europa', gas: 'FREE', color: 'bg-green-500', free: true },
];

export default function ChainSelector() {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const { t } = useTranslation();
  const cs = t.chainSelector || {};

  if (!isConnected) return null;

  const currentId = chain?.id;

  return (
    <div className="glass-card rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className="text-sm font-semibold text-white dark:text-white">{cs.title || 'Select Network'}</span>
        {isPending && (
          <span className="text-xs text-[#FF9900] animate-pulse ml-auto">{cs.switchingTo || 'Switching...'}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CHAINS.map(c => {
          const isActive = currentId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!isActive && switchChain) {
                  switchChain({ chainId: c.id });
                }
              }}
              className={`relative flex flex-col items-start px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-[#FF9900]/10 border-[#FF9900]/30 text-white'
                  : 'bg-[#1a1f2e] dark:bg-[#1a1f2e] text-gray-500 border-white/10 hover:text-gray-300 hover:border-white/20'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-1.5 font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${c.color} shrink-0`} />
                <span>{c.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] ml-0.5" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-gray-500">{cs.gasLabel || 'Gas'}:</span>
                {c.free ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                    {cs.free || 'FREE'}
                  </span>
                ) : (
                  <span className="text-gray-400">{c.gas}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
