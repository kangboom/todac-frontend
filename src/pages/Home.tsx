import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '../store/babyStore';
import { babyApi } from '../api/baby';
import { Baby } from '../types';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Card, 
  SimpleGrid, 
  Group, 
  Badge, 
  ActionIcon, 
  LoadingOverlay,
  Center,
  Stack
} from '@mantine/core';
import { IconPlus, IconTrash, IconEdit, IconMessageChatbot } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function Home() {
  const navigate = useNavigate();
  const { babies, setSelectedBaby, fetchBabies, removeBaby } = useBabyStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchBabies();
      setIsLoading(false);
    };
    loadData();
  }, [fetchBabies]);

  const handleBabySelect = (baby: Baby) => {
    setSelectedBaby(baby);
    navigate('/chat');
  };

  const handleDeleteBaby = async (e: React.MouseEvent, babyId: string) => {
    e.stopPropagation();
    if (!confirm('정말로 이 프로필을 삭제하시겠습니까?')) return;

    setDeletingId(babyId);
    try {
      await babyApi.delete(babyId);
      removeBaby(babyId);
      notifications.show({
        title: '삭제 완료',
        message: '아기 프로필이 삭제되었습니다.',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to delete baby:', error);
      notifications.show({
        title: '삭제 실패',
        message: '삭제 중 오류가 발생했습니다.',
        color: 'red',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <LoadingOverlay visible={true} />
      </Center>
    );
  }

  return (
    <Container py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>아기 프로필</Title>
          <Text c="dimmed" size="sm">채팅을 시작하려면 아기를 선택하거나 새로 등록하세요</Text>
        </div>
        {babies.length > 0 && (
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/babies/new')}
          >
            새 프로필 등록
          </Button>
        )}
      </Group>

      {babies.length === 0 ? (
        <Card withBorder padding="xl" radius="md" style={{ textAlign: 'center' }}>
          <Stack align="center" gap="md">
            <Text c="dimmed">등록된 아기 프로필이 없습니다</Text>
            <Button onClick={() => navigate('/babies/new')}>
              아기 프로필 등록하기
            </Button>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {babies.map((baby) => (
            <Card 
              key={baby.id} 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => handleBabySelect(baby)}
            >
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text fw={500}>{baby.name}</Text>
                    {baby.gender && (
                      <Badge color={baby.gender === 'M' ? 'blue' : 'pink'} variant="light">
                        {baby.gender === 'M' ? '남아' : '여아'}
                      </Badge>
                    )}
                  </Group>
                  <Group gap={4}>
                    <ActionIcon 
                      variant="subtle" 
                      color="gray" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/babies/${baby.id}/edit`);
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="subtle" 
                      color="red" 
                      loading={deletingId === baby.id}
                      onClick={(e) => handleDeleteBaby(e, baby.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card.Section>

              <Stack mt="md" gap="xs">
                <Text size="sm" c="dimmed">
                  출생일: {new Date(baby.birth_date).toLocaleDateString()}
                </Text>
                <Text size="sm" c="dimmed">
                  예정일: {new Date(baby.due_date).toLocaleDateString()}
                </Text>
                <Text size="sm" c="dimmed">
                  출생 체중: {baby.birth_weight}kg
                </Text>
                {baby.medical_history.length > 0 && (
                  <Text size="sm" c="dimmed">
                    기저질환: {baby.medical_history.join(', ')}
                  </Text>
                )}
              </Stack>

              <Button 
                fullWidth 
                mt="md" 
                variant="light" 
                leftSection={<IconMessageChatbot size={16} />}
              >
                채팅 시작하기
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
