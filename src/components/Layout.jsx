import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [inactiveTimer, setInactiveTimer] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

  const resetTimer = useCallback(() => {
    if (inactiveTimer) clearTimeout(inactiveTimer);
    const timer = setTimeout(() => {
      handleLogout();
    }, 30 * 60 * 1000); //30 minutos
  }, [inactiveTimer]);

  useEffect(() => {
    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if(inactiveTimer) clearTimeout(inactiveTimer);
    };
  }, [resetTimer]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Relatórios', path: '/Relatorios' },
  ];

  const cadastroItems = [
    { label: 'Despesas Fixas', path: '/Cadastros/DespesasFixas' },
    { label: 'Produtos', path: '/Cadastros/Produtos' },
    { label: 'Usuários', path: '/Cadastros/Usuarios' },
  ];

  const sair = [
     {label: 'Sair', path: '/login'},
  ]

    const teste = [
     {label: 'Movimentos', path: '/login'},
  ]
     const teste2 = [
     {label: 'teste', path: '/login'},
  ]


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

          {/* Botão Cadastros com submenu */}
          <Button
            color="inherit"
            onClick={handleOpenMenu}
            variant={location.pathname.startsWith('/Cadastros') ? 'outlined' : 'text'}
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
