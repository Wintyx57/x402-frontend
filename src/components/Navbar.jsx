import { Link } from 'react-router-dom';
import ConnectButton from './ConnectButton';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-[#0d0d14]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl font-bold text-white">x402</span>
          <span className="text-xl font-light text-blue-400">Bazaar</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/services" className="text-gray-400 hover:text-white text-sm no-underline transition-colors">
            Services
          </Link>
          <Link to="/register" className="text-gray-400 hover:text-white text-sm no-underline transition-colors">
            Register
          </Link>
          <Link to="/developers" className="text-gray-400 hover:text-white text-sm no-underline transition-colors">
            Developers
          </Link>
        </div>

        <ConnectButton />
      </div>
    </nav>
  );
}
