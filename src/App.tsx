import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

function PageSkeleton() {
  return (
    <div className="min-h-screen animate-page-enter" aria-busy="true" aria-label="Loading page">
      {/* Hero skeleton */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
        <div className="flex flex-col items-center gap-6">
          <div className="h-3 w-24 animate-shimmer rounded-full" />
          <div className="h-10 w-3/4 max-w-xl animate-shimmer rounded-xl" />
          <div className="h-10 w-2/3 max-w-md animate-shimmer rounded-xl" />
          <div className="h-5 w-1/2 max-w-sm animate-shimmer rounded-lg" />
          <div className="flex gap-3 mt-2">
            <div className="h-10 w-32 animate-shimmer rounded-lg" />
            <div className="h-10 w-32 animate-shimmer rounded-lg" />
          </div>
        </div>
      </div>
      {/* Cards skeleton grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-4 space-y-3"
              style={{ animationDelay: `${i * 40}ms` }}
              aria-hidden="true"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg animate-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-shimmer rounded" />
                  <div className="h-3 w-1/3 animate-shimmer rounded" />
                </div>
                <div className="h-6 w-14 animate-shimmer rounded-lg shrink-0" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-shimmer rounded" />
                <div className="h-3 w-2/3 animate-shimmer rounded" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 w-14 animate-shimmer rounded-lg" />
                <div className="h-5 w-14 animate-shimmer rounded-lg" />
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <div className="h-3 w-24 animate-shimmer rounded" />
                <div className="h-3 w-16 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Register = lazy(() => import('./pages/Register'));
const Integrate = lazy(() => import('./pages/Integrate'));
const Developers = lazy(() => import('./pages/Developers'));
const MCP = lazy(() => import('./pages/MCP'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogArticle = lazy(() => import('./pages/BlogArticle'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Demos = lazy(() => import('./pages/Demos'));
const Config = lazy(() => import('./pages/Config'));
const Docs = lazy(() => import('./pages/Docs'));
const Status = lazy(() => import('./pages/Status'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Legal = lazy(() => import('./pages/Legal'));
const Playground = lazy(() => import('./pages/Playground'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Compare = lazy(() => import('./pages/Compare'));
const ForProviders = lazy(() => import('./pages/ForProviders'));
const Budget = lazy(() => import('./pages/Budget'));
// CreatorDashboard redirected to /my-apis — kept for potential reuse
// const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const Quickstart = lazy(() => import('./pages/Quickstart'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const FundWallet = lazy(() => import('./pages/FundWallet'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const MyApis = lazy(() => import('./pages/MyApis'));
const LiveAgent = lazy(() => import('./pages/LiveAgent'));
const ImportOpenAPI = lazy(() => import('./pages/ImportOpenAPI'));
const Paywall = lazy(() => import('./pages/Paywall'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-300">
      <ErrorBoundary>
        <Navbar />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/register" element={<Register />} />
            <Route path="/integrate" element={<Integrate />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/mcp" element={<MCP />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/demos" element={<Demos />} />
            <Route path="/config" element={<Config />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/status" element={<Status />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/for-providers" element={<ForProviders />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/fund" element={<FundWallet />} />
            <Route path="/creators" element={<Navigate to="/for-providers" replace />} />
            <Route path="/my-apis" element={<MyApis />} />
            <Route path="/creators/dashboard" element={<Navigate to="/my-apis" replace />} />
            <Route path="/creators/onboarding" element={<Navigate to="/register" replace />} />
            <Route path="/quickstart" element={<Quickstart />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/agent" element={<LiveAgent />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/import" element={<ImportOpenAPI />} />
            <Route path="/pay/:id" element={<Paywall />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </ErrorBoundary>
      <ScrollToTop />
    </div>
  );
}
