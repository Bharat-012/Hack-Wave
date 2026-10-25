import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { ExplorePage } from './pages/ExplorePage.js';
import { ReportPage } from './pages/ReportPage.js';
import { ReportDetailPage } from './pages/ReportDetailPage.js';
import { QuestsPage } from './pages/QuestsPage.js';
import { QuestDetailPage } from './pages/QuestDetailPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { AdminPage } from './pages/AdminPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-cream-100 text-stone-900 selection:bg-forest-100 selection:text-forest-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
            <Route path="/quests" element={<QuestsPage />} />
            <Route path="/quests/:id" element={<QuestDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
