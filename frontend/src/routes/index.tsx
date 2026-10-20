import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { HomePage } from '../pages/Home';
import { PlayersPage } from '../pages/Players';
import { ClubsPage } from '../pages/Clubs';
import { MarketPage } from '../pages/Market';
import { HistoryPage } from '../pages/History';
import { LeaguePage } from '../pages/League';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/clubs" element={<ClubsPage />} />
      <Route path="/market" element={<MarketPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/league" element={<LeaguePage />} />

      {/* Rota Fallback para 404 / Página não encontrada */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};
