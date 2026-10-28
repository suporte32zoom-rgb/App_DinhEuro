/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { Footer } from './components/Footer';
import { AssetDetailModal } from './components/AssetDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { DashboardView } from './views/DashboardView';
import { MarketsView } from './views/MarketsView';
import { PortfolioView } from './views/PortfolioView';
import { NewsView } from './views/NewsView';
import { BrokersView } from './views/BrokersView';
import { AdvancedChartsView } from './views/AdvancedChartsView';
import { ToolsView } from './views/ToolsView';
import { AcademyView } from './views/AcademyView';
import { AboutView } from './views/AboutView';

const MainContent: React.FC = () => {
  const { activeTab } = useMarket();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 sm:pt-6 flex-1 w-full">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'mercados' && <MarketsView />}
      {activeTab === 'carteiras' && <PortfolioView />}
      {activeTab === 'noticias' && <NewsView />}
      {activeTab === 'corretoras' && <BrokersView />}
      {activeTab === 'graficos' && <AdvancedChartsView />}
      {activeTab === 'ferramentas' && <ToolsView />}
      {activeTab === 'academy' && <AcademyView />}
      {activeTab === 'sobre' && <AboutView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { theme } = useMarket();
  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#0B1320] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      } flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-150`}
    >
      {/* Real-time Top Marquee Ribbon */}
      <TickerTape />

      {/* Global Responsive Navigation Header */}
      <Header />

      {/* Dynamic Route View */}
      <MainContent />

      {/* Interactive Asset Detail & Candlestick Modal */}
      <AssetDetailModal />

      {/* PWA Offline Mode Indicator */}
      <OfflineIndicator />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <AppShell />
    </MarketProvider>
  );
}
