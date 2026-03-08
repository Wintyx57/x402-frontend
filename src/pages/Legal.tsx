// Legal.tsx — Mentions légales LCEN (Article 6 LCEN, France)
import { Link } from 'react-router-dom';

export default function Legal() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#E8E4E0] py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-[#FF9900] uppercase tracking-widest mb-3">
            Mentions légales
          </p>
          <h1 className="text-3xl font-bold text-white mb-4">
            Informations légales
          </h1>
          <p className="text-sm text-gray-400">
            Conformément aux dispositions de l'article 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004
            pour la Confiance dans l'Économie Numérique (LCEN).
          </p>
        </div>

        <div className="space-y-10">
          {/* Éditeur */}
          <section className="glass-card rounded-xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] text-xs font-bold">1</span>
              Éditeur du site
            </h2>
            <dl className="space-y-2 text-sm text-gray-300">
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">Nom du site</dt>
                <dd className="font-medium text-white">x402 Bazaar</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">URL</dt>
                <dd>
                  <a href="https://x402bazaar.org" className="text-[#FF9900] hover:underline">
                    https://x402bazaar.org
                  </a>
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">Responsable</dt>
                <dd className="font-medium text-white">Robin Fuchs</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">Contact</dt>
                <dd>
                  <a href="mailto:contact@x402bazaar.org" className="text-[#FF9900] hover:underline">
                    contact@x402bazaar.org
                  </a>
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">Statut</dt>
                <dd>Projet indépendant — non immatriculé (phase bêta)</dd>
              </div>
            </dl>
          </section>

          {/* Hébergeur */}
          <section className="glass-card rounded-xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] text-xs font-bold">2</span>
              Hébergeur
            </h2>
            <dl className="space-y-2 text-sm text-gray-300">
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">Société</dt>
                <dd className="font-medium text-white">Cloudflare, Inc.</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">Adresse</dt>
                <dd>101 Townsend St, San Francisco, CA 94107, USA</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-gray-500 shrink-0 sm:w-40">Site web</dt>
                <dd>
                  <a
                    href="https://www.cloudflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF9900] hover:underline"
                  >
                    cloudflare.com
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          {/* Données personnelles / RGPD */}
          <section className="glass-card rounded-xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] text-xs font-bold">3</span>
              Données personnelles (RGPD)
            </h2>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                x402 Bazaar collecte des données fonctionnelles minimales (adresse de portefeuille
                crypto, interactions API) nécessaires au fonctionnement du service.
                Aucune donnée personnelle n'est revendue à des tiers.
              </p>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679),
                vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
              </p>
              <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/8">
                <p className="text-gray-400 text-xs mb-1">Contact RGPD :</p>
                <a href="mailto:privacy@x402bazaar.org" className="text-[#FF9900] hover:underline font-medium">
                  privacy@x402bazaar.org
                </a>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="glass-card rounded-xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] text-xs font-bold">4</span>
              Cookies et traceurs
            </h2>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                Le site utilise Google Analytics 4 (GA4) à des fins de mesure d'audience anonyme.
                Aucun cookie publicitaire tiers n'est déposé.
              </p>
              <p>
                Les données de navigation transmises à Google sont anonymisées (IP tronquée).
                Vous pouvez vous opposer à cette collecte via l'extension Google Analytics Opt-out.
              </p>
            </div>
          </section>

          {/* Liens utiles */}
          <section className="glass-card rounded-xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] text-xs font-bold">5</span>
              Documents liés
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/privacy" className="text-[#FF9900] hover:underline flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#FF9900] hover:underline flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Conditions Générales d'Utilisation (CGU)
                </Link>
              </li>
            </ul>
          </section>

          {/* Propriété intellectuelle */}
          <section className="glass-card rounded-xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] text-xs font-bold">6</span>
              Propriété intellectuelle
            </h2>
            <p className="text-sm text-gray-300">
              L'ensemble du contenu de ce site (textes, graphismes, logiciels, protocoles) est protégé
              par le droit d'auteur. Toute reproduction non autorisée est interdite. Le protocole x402
              est distribué sous licence open-source — voir le dépôt GitHub pour les termes applicables.
            </p>
          </section>
        </div>

        <p className="text-xs text-gray-500 mt-10 text-center">
          Dernière mise à jour : mars 2026
        </p>
      </div>
    </main>
  );
}
