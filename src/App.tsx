import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './features/themes/engine/ThemeContext';
import { useGameStore } from './hooks/useGameStore';
import { Layout } from './components/Layout';
import { LoginScreen } from './features/auth/LoginScreen';
import { HomeScreen } from './features/game/HomeScreen';
import { SubjectSelect } from './features/game/SubjectSelect';
import { QuestionScreen } from './features/game/QuestionScreen';
import { ResultsScreen } from './features/game/ResultsScreen';
import { ClueBoard } from './features/progress/ClueBoard';

// Lazy-loaded routes for code splitting
const FieldGuide = lazy(() => import('./features/progress/FieldGuide').then((m) => ({ default: m.FieldGuide })));
const ShopScreen = lazy(() => import('./features/shop/ShopScreen').then((m) => ({ default: m.ShopScreen })));
const DashboardScreen = lazy(() => import('./features/dashboard/DashboardScreen').then((m) => ({ default: m.DashboardScreen })));
const AvatarCustomize = lazy(() => import('./features/avatar/AvatarCustomize').then((m) => ({ default: m.AvatarCustomize })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-10 h-10 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const { profile } = useGameStore();

  if (!profile) return <LoginScreen />;

  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/play" element={<SubjectSelect />} />
          <Route path="/play/session" element={<QuestionScreen />} />
          <Route path="/play/results" element={<ResultsScreen />} />
          <Route path="/clues" element={<ClueBoard />} />
          <Route path="/guide" element={<FieldGuide />} />
          <Route path="/shop" element={<ShopScreen />} />
          <Route path="/avatar" element={<AvatarCustomize />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  );
}
