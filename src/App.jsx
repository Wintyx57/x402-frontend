import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Register from './pages/Register';
import Integrate from './pages/Integrate';
import Developers from './pages/Developers';
import MCP from './pages/MCP';
import Blog from './pages/Blog';
import About from './pages/About';
import Pricing from './pages/Pricing';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/register" element={<Register />} />
        <Route path="/integrate" element={<Integrate />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/mcp" element={<MCP />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
      <ScrollToTop />
    </div>
  );
}
