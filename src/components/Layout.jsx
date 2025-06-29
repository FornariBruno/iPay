import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useRef, useEffect, useState, useCallback } from 'react';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const timerRef = useRef(null);

  // 🔧 corrigido: faltava declarar essas funções
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleLogout();
    }, 30 * 60 * 1000); // 30 minutos
  }, [handleLogout]);

  useEffect(() => {
    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Relatórios', path: '/relatorios' },
  ];

  const cadastroItems = [
    { label: 'Despesas Fixas', path: '/cadastros/despesasfixas' },
    { label: 'Tipo de Despesas', path: '/cadastros/tipodespesa' },
    { label: 'Objetivos', path: '/cadastros/objetivos' }
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {navItems.map(item => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{ color: '#fff', mx: 1 }}
            >
              {item.label}
            </Button>
          ))}

          <Button
            color="inherit"
            onClick={handleOpenMenu}
            variant={location.pathname.startsWith('/cadastros') ? 'outlined' : 'text'}
            sx={{ color: '#fff', mx: 1 }}
          >
            Cadastros
          </Button>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
            {cadastroItems.map((subItem) => (
              <MenuItem
                key={subItem.path}
                component={Link}
                to={subItem.path}
                onClick={handleCloseMenu}
              >
                {subItem.label}
              </MenuItem>
            ))}
          </Menu>

          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ color: '#fff', mx: 1, ml: 'auto' }}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Box p={3}>
        <Outlet />
      </Box>
    </>
  );
}
