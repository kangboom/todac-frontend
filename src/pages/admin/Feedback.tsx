import { useState, useEffect } from 'react';
import { 
  Title, Paper, Group, Stack, LoadingOverlay, 
  Text, Pagination, Rating, Badge, Accordion, Box
} from '@mantine/core';
import { feedbackApi, AdminFeedback } from '../../api/admin/feedback';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const skip = (activePage - 1) * ITEMS_PER_PAGE;
      const data = await feedbackApi.getFeedbackList(skip, ITEMS_PER_PAGE);
      setFeedbacks(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      notifications.show({ title: '오류', message: '목록을 불러오지 못했습니다.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [activePage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>사용자 피드백 관리</Title>
      </Group>

      <Paper shadow="sm" radius="md" p="md" withBorder style={{ position: 'relative', minHeight: '200px' }}>
        <LoadingOverlay visible={loading} />
        <Stack justify="space-between" style={{ minHeight: '500px' }}>
          {feedbacks.length === 0 && !loading ? (
             <Text c="dimmed" ta="center" py="xl">등록된 피드백이 없습니다.</Text>
          ) : (
            <Accordion variant="separated">
              {feedbacks.map((item) => (
                <Accordion.Item key={item.id} value={item.id}>
                  <Accordion.Control>
                    <Group justify="space-between" pr="md">
                        <Group>
                            <Rating value={item.score} readOnly />
                            <Stack gap={0}>
                                <Text size="sm" fw={500}>
                                    {item.user_nickname || '알 수 없음'} 
                                    <Text span size="xs" c="dimmed" ml={4}>({item.user_email || 'no-email'})</Text>
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                                </Text>
                            </Stack>
                        </Group>
                        {item.comment && (
                            <Badge color="blue" variant="light">코멘트 있음</Badge>
                        )}
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                        <Box>
                            <Text size="xs" c="dimmed" fw={700}>사용자 질문</Text>
                            <Paper withBorder p="xs" bg="gray.0">
                                <Text size="sm">{item.question || "(질문 내용 없음)"}</Text>
                            </Paper>
                        </Box>
                        <Box>
                            <Text size="xs" c="dimmed" fw={700}>AI 답변</Text>
                            <Paper withBorder p="xs" bg="blue.0">
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{item.answer}</Text>
                            </Paper>
                        </Box>
                        {item.comment && (
                            <Box>
                                <Text size="xs" fw={700} c="blue">사용자 코멘트</Text>
                                <Paper withBorder p="xs" bg="yellow.0">
                                    <Text size="sm">{item.comment}</Text>
                                </Paper>
                            </Box>
                        )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          )}

          {total > 0 && (
            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={activePage} onChange={setPage} />
            </Group>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
