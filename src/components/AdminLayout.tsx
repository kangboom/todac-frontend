import { AppShell, Burger, Group, NavLink, Text, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { IconDashboard, IconFiles, IconLogout, IconSettings, IconArrowLeft, IconDatabase, IconMessageReport } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

export function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg">TODAC Admin</Text>
          </Group>
          <Group gap="xs">
            <Button 
              variant="light" 
              color="blue" 
              size="xs"
              onClick={() => navigate('/')} 
              leftSection={<IconArrowLeft size={16} />}
              px="xs"
            >
              <Text visibleFrom="xs">서비스로 돌아가기</Text>
              <Text hiddenFrom="xs">홈</Text>
            </Button>
            <Button 
              variant="subtle" 
              color="red" 
              size="xs"
              onClick={handleLogout} 
              px="xs"
            >
              <IconLogout size={16} />
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="대시보드"
          leftSection={<IconDashboard size={20} />}
          active={location.pathname === '/admin'}
          onClick={() => navigate('/admin')}
          variant="light"
        />
        <NavLink
          label="지식 관리"
          leftSection={<IconFiles size={20} />}
          active={location.pathname === '/admin/knowledge'}
          onClick={() => navigate('/admin/knowledge')}
          variant="light"
        />
        <NavLink
          label="QnA 관리"
          leftSection={<IconDatabase size={20} />}
          active={location.pathname === '/admin/qna'}
          onClick={() => navigate('/admin/qna')}
          variant="light"
        />
        <NavLink
          label="피드백 관리"
          leftSection={<IconMessageReport size={20} />}
          active={location.pathname === '/admin/feedback'}
          onClick={() => navigate('/admin/feedback')}
          variant="light"
        />
        <NavLink
          label="설정"
          leftSection={<IconSettings size={20} />}
          active={location.pathname === '/admin/settings'}
          onClick={() => navigate('/admin/settings')}
          variant="light"
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
