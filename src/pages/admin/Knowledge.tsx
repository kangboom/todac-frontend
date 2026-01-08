import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Button,
  Select,
  FileInput,
  Table,
  ActionIcon,
  Text,
  Badge,
  Pagination,
  LoadingOverlay,
} from '@mantine/core';
import { IconUpload, IconTrash, IconFile, IconCheck, IconX } from '@tabler/icons-react';
import { adminApi } from '../../api/admin/knowledge';
import { KnowledgeDoc } from '../../types/knowledge';
import { notifications } from '@mantine/notifications';

const CATEGORIES = ["식이", "수면", "호흡", "발달", "예방접종", "피부", "응급", "기타"];

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Upload State
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await adminApi.getKnowledgeList({
        category: filterCategory || undefined,
        limit,
        offset,
      });
      setDocs(response.documents);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      notifications.show({
        title: '오류',
        message: '문서 목록을 불러오는데 실패했습니다.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [page, filterCategory]);

  const handleUpload = async () => {
    if (files.length === 0 || !category) {
      notifications.show({
        title: '알림',
        message: '파일과 카테고리를 모두 선택해주세요.',
        color: 'yellow',
      });
      return;
    }

    try {
      setUploading(true);
      const result = await adminApi.uploadKnowledge(files, category);
      
      // 배치 결과 처리
      const successCount = result.success_count;
      const failureCount = result.failure_count;
      
      if (successCount > 0 && failureCount === 0) {
        notifications.show({
          title: '성공',
          message: `${successCount}개 문서가 성공적으로 업로드되었습니다.`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else if (successCount > 0 && failureCount > 0) {
        notifications.show({
          title: '부분 성공',
          message: `${successCount}개 성공, ${failureCount}개 실패`,
          color: 'yellow',
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: '실패',
          message: '모든 파일 업로드에 실패했습니다.',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
      
      // 실패한 파일이 있으면 상세 정보 표시
      if (failureCount > 0) {
        const failedFiles = result.results
          .filter(r => !r.success)
          .map(r => r.filename)
          .join(', ');
        notifications.show({
          title: '실패한 파일',
          message: failedFiles,
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
      
      setFiles([]);
      setCategory(null);
      fetchDocs(); // Refresh list
    } catch (error) {
      console.error('Upload failed:', error);
      notifications.show({
        title: '실패',
        message: '문서 업로드에 실패했습니다.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('정말 이 문서를 삭제하시겠습니까?')) return;

    try {
      await adminApi.deleteKnowledge(docId);
      
      notifications.show({
        title: '삭제 완료',
        message: '문서가 성공적으로 삭제되었습니다.',
        color: 'blue',
        icon: <IconTrash size={16} />,
      });
      
      fetchDocs(); // Refresh list
    } catch (error) {
      console.error('Delete failed:', error);
      notifications.show({
        title: '삭제 실패',
        message: '문서 삭제 중 오류가 발생했습니다.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  return (
    <Container fluid>
      <Title order={2} mb="lg">지식 베이스 관리</Title>

      {/* Upload Section */}
      <Paper p="md" withBorder radius="md" mb="xl">
        <Title order={4} mb="md">새 문서 업로드</Title>
        <Group align="flex-end">
          <FileInput
            label="파일 선택"
            placeholder="PDF 파일 선택 (여러 개 선택 가능)"
            accept=".pdf"
            multiple
            value={files}
            onChange={(newFiles) => setFiles(newFiles || [])}
            leftSection={<IconFile size={16} />}
            style={{ flex: 1 }}
          />
          <Select
            label="카테고리"
            placeholder="카테고리 선택"
            data={CATEGORIES}
            value={category}
            onChange={setCategory}
            style={{ width: 200 }}
            description={files.length > 0 ? `${files.length}개 파일 선택됨` : undefined}
          />
          <Button 
            onClick={handleUpload} 
            loading={uploading}
            leftSection={<IconUpload size={16} />}
            disabled={files.length === 0 || !category}
          >
            업로드 {files.length > 0 && `(${files.length}개)`}
          </Button>
        </Group>
        {files.length > 0 && (
          <Group mt="sm" gap="xs">
            {files.map((file, index) => (
              <Badge key={index} variant="light" color="blue">
                {file.name}
              </Badge>
            ))}
          </Group>
        )}
      </Paper>

      {/* List Section */}
      <Paper p="md" withBorder radius="md" pos="relative">
        <LoadingOverlay visible={loading} />
        
        <Group justify="space-between" mb="md">
          <Title order={4}>문서 목록 ({total}개)</Title>
          <Select
            placeholder="카테고리 필터"
            data={[{ value: '', label: '전체' }, ...CATEGORIES]}
            value={filterCategory}
            onChange={(val) => {
                setFilterCategory(val === '' ? null : val);
                setPage(1); // Reset to first page on filter change
            }}
            clearable
            style={{ width: 200 }}
          />
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>파일명</Table.Th>
                <Table.Th>카테고리</Table.Th>
                <Table.Th>크기</Table.Th>
                <Table.Th>청크 수</Table.Th>
                <Table.Th>등록일</Table.Th>
                <Table.Th style={{ width: 80 }}>관리</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {docs.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                    <Text c="dimmed">등록된 문서가 없습니다.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                docs.map((doc) => (
                  <Table.Tr key={doc.id}>
                    <Table.Td>
                      <Text size="sm" lineClamp={1} title={doc.filename}>
                        {doc.filename}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light" size="sm">
                        {doc.meta_info.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{doc.meta_info.chunk_count}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{new Date(doc.created_at).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        color="red" 
                        variant="subtle" 
                        onClick={() => handleDelete(doc.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {total > limit && (
          <Group justify="center" mt="lg">
            <Pagination 
              total={Math.ceil(total / limit)} 
              value={page} 
              onChange={setPage} 
            />
          </Group>
        )}
      </Paper>
    </Container>
  );
}

