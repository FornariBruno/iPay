import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Relatorios from "./pages/Relatórios";
import Cadastros from "./pages/Cadastros/Clientes";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectRoute";
import { AuthProvider } from "./context/AuthContext";
import Clientes from "./pages/Cadastros/Clientes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Navigate to="/login" replace />} />
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
            <Route path="cadastros/clientes" element={<Clientes />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
