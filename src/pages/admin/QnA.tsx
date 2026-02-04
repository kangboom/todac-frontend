import { useState, useEffect } from 'react';
import { 
  Title, Paper, Button, Group, Table, Modal, TextInput, 
  Textarea, Stack, LoadingOverlay, Badge, Text, Pagination 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconRefresh, IconDatabase } from '@tabler/icons-react';
import { qnaApi, QnA } from '../../api/admin/qna';
import { notifications } from '@mantine/notifications';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminQnA() {
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  // Pagination State
  const [activePage, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    source: '',
    category: ''
  });

  const fetchQnAs = async () => {
    setLoading(true);
    try {
      const skip = (activePage - 1) * ITEMS_PER_PAGE;
      const data = await qnaApi.getQnAList(skip, ITEMS_PER_PAGE);
      setQnas(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      notifications.show({ title: '오류', message: '목록을 불러오지 못했습니다.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQnAs();
  }, [activePage]);

  const handleSubmit = async () => {
    if (!formData.question || !formData.answer) return;
    
    try {
      setLoading(true);
      await qnaApi.createQnA(formData);
      notifications.show({ title: '성공', message: 'QnA가 등록되었습니다.', color: 'green' });
      close();
      setFormData({ question: '', answer: '', source: '', category: '' });
      // 등록 후 첫 페이지로 이동하여 최신 데이터 확인
      setPage(1);
      if (activePage === 1) {
        fetchQnAs();
      }
    } catch (error) {
      console.error(error);
      notifications.show({ title: '실패', message: '등록 중 오류가 발생했습니다.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSyncClick = () => {
    openConfirm();
  };

  const handleSyncConfirm = async () => {
    closeConfirm();
    try {
      setSyncing(true);
      const res = await qnaApi.syncQnA();
      notifications.show({ 
        title: '동기화 완료', 
        message: res.message, 
        color: 'blue',
        icon: <IconDatabase size={16} />
      });
    } catch (error) {
      console.error(error);
      notifications.show({ title: '실패', message: '동기화 중 오류가 발생했습니다.', color: 'red' });
    } finally {
      setSyncing(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>QnA 데이터 관리</Title>
        <Group>
            <Button 
                variant="light" 
                color="orange" 
                leftSection={<IconRefresh size={16} />} 
                onClick={handleSyncClick}
                loading={syncing}
            >
                DB-Milvus 동기화
            </Button>
            <Button leftSection={<IconPlus size={16} />} onClick={open}>
                QnA 등록
            </Button>
        </Group>
      </Group>

      <Paper shadow="sm" radius="md" p="md" withBorder style={{ position: 'relative', minHeight: '200px' }}>
        <LoadingOverlay visible={loading} />
        <Stack justify="space-between" style={{ minHeight: '500px' }}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '60px' }}>ID</Table.Th>
                <Table.Th style={{ width: '100px' }}>카테고리</Table.Th>
                <Table.Th>질문</Table.Th>
                <Table.Th>답변</Table.Th>
                <Table.Th style={{ width: '150px' }}>출처</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {qnas.map((qna) => (
                <Table.Tr key={qna.id}>
                  <Table.Td>{qna.id}</Table.Td>
                  <Table.Td><Badge color="gray" variant="light">{qna.category}</Badge></Table.Td>
                  <Table.Td><Text fw={500} lineClamp={1}>{qna.question}</Text></Table.Td>
                  <Table.Td><Text size="sm" lineClamp={2} c="dimmed">{qna.answer}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{qna.source}</Text></Table.Td>
                </Table.Tr>
              ))}
              {!loading && qnas.length === 0 && (
                  <Table.Tr>
                      <Table.Td colSpan={5} align="center" py="xl">
                          <Text c="dimmed">등록된 데이터가 없습니다.</Text>
                      </Table.Td>
                  </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {total > 0 && (
            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={activePage} onChange={setPage} />
            </Group>
          )}
        </Stack>
      </Paper>

      <Modal opened={opened} onClose={close} title="QnA 등록">
        <Stack>
          <TextInput
            label="질문"
            placeholder="예: 미숙아 예방접종 시기는?"
            required
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          />
          <Textarea
            label="답변"
            placeholder="답변 내용을 입력하세요"
            required
            minRows={4}
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          />
          <TextInput
            label="카테고리"
            placeholder="예: 예방접종"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <TextInput
            label="출처"
            placeholder="예: 대한신생아학회"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>취소</Button>
            <Button onClick={handleSubmit} loading={loading}>등록</Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmModal
        opened={confirmOpened}
        onClose={closeConfirm}
        onConfirm={handleSyncConfirm}
        title="DB-Milvus 동기화"
        message="경고: Milvus의 기존 QnA 데이터가 모두 삭제되고, DB 데이터로 새로 생성됩니다. 진행하시겠습니까?"
        confirmLabel="동기화"
        confirmColor="orange"
      />
    </Stack>
  );
}
