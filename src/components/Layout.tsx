import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AppShell, Group, Button, Text, Container } from '@mantine/core';
import { IconLogout, IconSettings } from '@tabler/icons-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="lg" h="100%" px="md">
          <Group h="100%" justify="space-between">
            <Group>
              <Text 
                fw={900} 
                size="xl" 
                c="blue"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                TODAC
              </Text>
            </Group>

            {user && (
              <Group>
                <Text size="sm" c="dimmed" visibleFrom="xs">
                  {user.nickname}님
                </Text>
                {user.role === 'ADMIN' && (
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => navigate('/admin')}
                    leftSection={<IconSettings size={14} />}
                  >
                    관리자
                  </Button>
                )}
                <Button 
                  variant="subtle" 
                  color="gray" 
                  size="xs"
                  onClick={handleLogout}
                  leftSection={<IconLogout size={14} />}
                >
                  로그아웃
                </Button>
              </Group>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
