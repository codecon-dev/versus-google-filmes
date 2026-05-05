import { AppShell, Burger, Group, NavLink, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMovie, IconSearch } from '@tabler/icons-react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ListPage from './pages/ListPage';

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const loc = useLocation();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              Catálogo TMDB
            </Title>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <NavLink
          label="Buscar"
          leftSection={<IconSearch size={18} />}
          active={loc.pathname === '/'}
          onClick={() => navigate('/')}
        />
        <NavLink
          label="Todos os filmes"
          leftSection={<IconMovie size={18} />}
          active={loc.pathname === '/filmes'}
          onClick={() => navigate('/filmes')}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/filmes" element={<ListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
