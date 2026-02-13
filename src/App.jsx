import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Register = lazy(() => import('./pages/Register'));
const Integrate = lazy(() => import('./pages/Integrate'));
const Developers = lazy(() => import('./pages/Developers'));
const MCP = lazy(() => import('./pages/MCP'));
const Blog = lazy(() => import('./pages/Blog'));
const About = lazy(() => import('./pages/About'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Demos = lazy(() => import('./pages/Demos'));
const Config = lazy(() => import('./pages/Config'));
const Docs = lazy(() => import('./pages/Docs'));
const Status = lazy(() => import('./pages/Status'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="w-10 h-10 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin-slow" />
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        }>
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
            <Route path="/faq" element={<FAQ />} />
            <Route path="/demos" element={<Demos />} />
            <Route path="/config" element={<Config />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/status" element={<Status />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
