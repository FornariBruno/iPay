import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Relatorios from "./pages/Relatórios";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectRoute";
import { AuthProvider } from "./context/AuthContext";
import DespesasFixas from "./pages/Cadastros/DespesasFixas";
import TipoDespesa from "./pages/Cadastros/TipoDespesa";
import Objetivos from "./pages/Cadastros/Objetivos";

function App() {
  return (
      <Router basename="/iPay">
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas com layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="cadastros/despesasfixas" element={<DespesasFixas />} />
              <Route path="cadastros/tipodespesa" element={<TipoDespesa />} />
              <Route path="cadastros/objetivos" element={<Objetivos />} />
            </Route>

            {/* Redirecionamento padrão */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
      </AuthProvider>
    </Router>

  );
}

export default App;
