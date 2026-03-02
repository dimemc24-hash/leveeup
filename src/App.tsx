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
import { FieldGuide } from './features/progress/FieldGuide';
import { ShopScreen } from './features/shop/ShopScreen';
import { DashboardScreen } from './features/dashboard/DashboardScreen';

function AppRoutes() {
  const { profile } = useGameStore();

  if (!profile) return <LoginScreen />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play" element={<SubjectSelect />} />
        <Route path="/play/session" element={<QuestionScreen />} />
        <Route path="/play/results" element={<ResultsScreen />} />
        <Route path="/clues" element={<ClueBoard />} />
        <Route path="/guide" element={<FieldGuide />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
      </Routes>
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
