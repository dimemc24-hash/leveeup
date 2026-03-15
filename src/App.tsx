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
const SpellCasterMenu = lazy(() => import('./features/spell-caster/SpellCasterMenu').then((m) => ({ default: m.SpellCasterMenu })));
const SpellCasterPlay = lazy(() => import('./features/spell-caster/SpellCasterPlay').then((m) => ({ default: m.SpellCasterPlay })));
const FieldGuideMenu = lazy(() => import('./features/field-guide/FieldGuideMenu').then((m) => ({ default: m.FieldGuideMenu })));
const FieldGuidePlay = lazy(() => import('./features/field-guide/FieldGuidePlay').then((m) => ({ default: m.FieldGuidePlay })));
const AvatarCustomize = lazy(() => import('./features/avatar/AvatarCustomize').then((m) => ({ default: m.AvatarCustomize })));
const DungeonMenu = lazy(() => import('./features/dungeon/DungeonMenu').then((m) => ({ default: m.DungeonMenu })));
const DungeonGame = lazy(() => import('./features/dungeon/DungeonGame').then((m) => ({ default: m.DungeonGame })));
const EvidenceShredder = lazy(() => import('./features/minigames/EvidenceShredder').then((m) => ({ default: m.EvidenceShredder })));
const CryptidCaller = lazy(() => import('./features/minigames/CryptidCaller').then((m) => ({ default: m.CryptidCaller })));
const SwampEscape = lazy(() => import('./features/minigames/SwampEscape').then((m) => ({ default: m.SwampEscape })));

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
          <Route path="/spell" element={<SpellCasterMenu />} />
          <Route path="/spell/play/:packId" element={<SpellCasterPlay />} />
          <Route path="/field-guide" element={<FieldGuideMenu />} />
          <Route path="/field-guide/play/:packId" element={<FieldGuidePlay />} />
          <Route path="/dungeon" element={<DungeonMenu />} />
          <Route path="/dungeon/play" element={<DungeonGame />} />
          <Route path="/minigames/shredder" element={<EvidenceShredder />} />
          <Route path="/minigames/caller" element={<CryptidCaller />} />
          <Route path="/minigames/swamp-escape" element={<SwampEscape />} />
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
