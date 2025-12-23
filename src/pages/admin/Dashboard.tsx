import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Text, Title, SimpleGrid, Loader, Center } from '@mantine/core';
import { IconUsers, IconMessageChatbot, IconFiles } from '@tabler/icons-react';
import { dashboardApi } from '../../api/admin/dashboard';
import { AdminStats } from '../../types/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Center h="100%">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container fluid>
      <Title order={2} mb="lg">관리자 대시보드</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Paper p="md" withBorder radius="md">
          <Grid align="center">
            <Grid.Col span={3}>
              <IconUsers size={32} color="#228be6" />
            </Grid.Col>
            <Grid.Col span={9}>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>전체 사용자</Text>
              <Text fw={700} size="xl">{stats?.totalUsers.toLocaleString()}</Text>
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p="md" withBorder radius="md">
          <Grid align="center">
            <Grid.Col span={3}>
              <IconMessageChatbot size={32} color="#40c057" />
            </Grid.Col>
            <Grid.Col span={9}>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>총 대화 세션</Text>
              <Text fw={700} size="xl">{stats?.totalSessions.toLocaleString()}</Text>
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p="md" withBorder radius="md">
          <Grid align="center">
            <Grid.Col span={3}>
              <IconFiles size={32} color="#fa5252" />
            </Grid.Col>
            <Grid.Col span={9}>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>지식 베이스 문서</Text>
              <Text fw={700} size="xl">{stats?.totalKnowledgeDocs.toLocaleString()}</Text>
            </Grid.Col>
          </Grid>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}

