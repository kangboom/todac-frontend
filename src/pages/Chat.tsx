import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '../store/babyStore';
import { chatApi } from '../api/chat';
import type { ChatMessage, ChatSession, RAGSource } from '../types';
import {
  Container,
  Paper,
  TextInput,
  Button,
  ScrollArea,
  Text,
  Group,
  Avatar,
  Stack,
  Loader,
  Badge,
  ActionIcon,
  Drawer,
  Box,
  Collapse,
  Center,
  Image
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  IconSend, 
  IconPlus, 
  IconX, 
  IconBook, 
  IconChevronDown, 
  IconChevronUp
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ConfirmModal from '../components/ConfirmModal';
import CommonHeader from '../components/CommonHeader';

export default function Chat() {
  const navigate = useNavigate();
  const { selectedBaby } = useBabyStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedBaby) {
      navigate('/');
      return;
    }
    loadSessions();
  }, [selectedBaby, navigate]);

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const loadSessions = async () => {
    if (!selectedBaby) return;
    setIsLoadingSessions(true);
    try {
      const data = await chatApi.getSessions(selectedBaby.id);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadSessionMessages = async (session: ChatSession) => {
    setIsLoading(true);
    try {
      const detail = await chatApi.getSessionDetail(session.id);
      const loadedMessages: ChatMessage[] = detail.messages.map((msg) => ({
        message_id: msg.message_id,
        session_id: msg.session_id,
        role: msg.role,
        content: msg.content,
        is_emergency: msg.is_emergency,
        rag_sources: msg.rag_sources as RAGSource[] | undefined,
        qna_sources: msg.qna_sources as RAGSource[] | undefined,
        created_at: msg.created_at,
      }));
      setMessages(loadedMessages);
      setSessionId(session.id);
      closeDrawer();
    } catch (error) {
      console.error('Failed to load session messages:', error);
      notifications.show({
        title: '오류',
        message: '대화 내용을 불러오는데 실패했습니다.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    closeDrawer();
  };

  const requestDeleteSession = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setSessionToDelete(session);
    setDeleteModalOpened(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeletingSession(true);
    try {
      await chatApi.deleteSession(sessionToDelete.id);
      if (sessionId === sessionToDelete.id) {
        startNewChat();
      }
      await loadSessions();
      notifications.show({
        title: '삭제 완료',
        message: '채팅방이 삭제되었습니다.',
        color: 'green',
      });
      setDeleteModalOpened(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Failed to delete session:', error);
      notifications.show({
        title: '삭제 실패',
        message: '채팅방 삭제에 실패했습니다.',
        color: 'red',
      });
    } finally {
      setIsDeletingSession(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedBaby || isLoading) return;

    const userMessage: ChatMessage = {
      message_id: crypto.randomUUID(),
      session_id: sessionId || '',
      role: 'USER',
      content: inputMessage,
      is_emergency: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({
        baby_id: selectedBaby.id,
        message: inputMessage,
        session_id: sessionId || undefined,
      });

      setSessionId(response.session_id);

      const assistantMessage: ChatMessage = {
        message_id: crypto.randomUUID(),
        session_id: response.session_id,
        role: 'ASSISTANT',
        content: response.response,
        is_emergency: response.is_emergency,
        rag_sources: response.rag_sources as RAGSource[] | undefined,
        qna_sources: response.qna_sources as RAGSource[] | undefined,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      loadSessions();
    } catch (error) {
      console.error('Failed to send message:', error);
      notifications.show({
        title: '전송 실패',
        message: '메시지 전송에 실패했습니다.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSource = (messageId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  if (!selectedBaby) return null;

  return (
    <Container fluid h="100dvh" p={0} m={0}>
      <Paper h="100%" display="flex" style={{ flexDirection: 'column', overflow: 'hidden' }} radius={0} bg="white">
        <ConfirmModal
          opened={deleteModalOpened}
          title="채팅방 삭제"
          message="이 채팅방을 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmColor="red"
          loading={isDeletingSession}
          onConfirm={confirmDeleteSession}
          onClose={() => {
            if (isDeletingSession) return;
            setDeleteModalOpened(false);
            setSessionToDelete(null);
          }}
        />

        {/* Header */}
        <CommonHeader 
          title={selectedBaby.name} 
          onMenuClick={openDrawer} 
          showMenu={true} 
          showBack={true} 
        />

        {/* Chat Area */}
        <ScrollArea viewportRef={viewport} flex={1} px="md" pb="md" bg="white">
          <Stack gap="xl" py="lg" maw={800} mx="auto">
            {messages.length === 0 && (
              <Center h={400}>
                <Stack align="center" gap="md">
                  <Image src="/mascot.png" w={180} h={180} fit="contain" alt="Todac Mascot" />
                  <Text size="md" c="dimmed">미숙아를 돌보며 걱정되는 점을 편하게 물어보세요</Text>
                </Stack>
              </Center>
            )}

            {messages.map((msg) => (
              <Group 
                key={msg.message_id} 
                justify={msg.role === 'USER' ? 'flex-end' : 'flex-start'} 
                align="flex-start"
                wrap="nowrap"
              >
                {msg.role === 'ASSISTANT' && (
                  <Avatar src="/mascot.png" alt="Todac" color="transparent" radius="xl" size="md" />
                )}
                
                <Stack gap={4} maw="85%">
                  {msg.role === 'USER' ? (
                     <Paper
                       px="lg"
                       py="sm"
                       radius="xl"
                       bg="green.1"
                       c="black"
                     >
                       <Text size="md" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                     </Paper>
                  ) : (
                     <Paper
                        px="lg"
                        py="sm"
                        radius="xl"
                        bg="gray.1"
                        style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                     >
                        {msg.is_emergency && (
                          <Badge color="red" variant="filled" mb="xs">⚠️ 응급 상황 감지</Badge>
                        )}
                        <Box>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              p: ({ node, ref, ...props }: any) => <Text size="md" style={{ lineHeight: 1.6 }} mb="xs" {...props} />,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              a: ({ node, ref, ...props }: any) => <Text component="a" c="blue.6" style={{ textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" {...props} />,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              ul: ({ node, ref, ...props }: any) => <Box component="ul" pl="md" my="xs" {...props} />,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              ol: ({ node, ref, ...props }: any) => <Box component="ol" pl="md" my="xs" {...props} />,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              li: ({ node, ref, ...props }: any) => <li style={{ marginBottom: 4 }} {...props}><Text span size="md" style={{ lineHeight: 1.6 }}>{props.children}</Text></li>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </Box>
                     </Paper>
                  )}

                  {/* Reference Docs */}
                  {msg.role === 'ASSISTANT' && (() => {
                    // RAG와 QnA 소스 병합 및 중복 제거 (파일명 기준)
                    const combinedSources = [
                      ...(msg.rag_sources || []),
                      ...(msg.qna_sources || [])
                    ].filter((item, index, self) =>
                      index === self.findIndex((t) => t.filename === item.filename)
                    );

                    if (combinedSources.length === 0) return null;

                    return (
                      <Box pl="xs">
                        <Button 
                          variant="subtle" 
                          size="xs" 
                          leftSection={<IconBook size={12} />}
                          rightSection={expandedSources.has(msg.message_id) ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                          onClick={() => toggleSource(msg.message_id)}
                          styles={{ root: { color: 'var(--mantine-color-dimmed)' } }}
                        >
                          참고 문서 {combinedSources.length}개
                        </Button>
                        
                        <Collapse in={expandedSources.has(msg.message_id)}>
                          <Stack gap="xs" mt="xs">
                            {combinedSources.map((source, idx) => (
                              <Paper key={idx} p="xs" withBorder radius="md" bg="gray.0">
                                <Text size="xs" fw={700} lineClamp={1}>{source.filename}</Text>
                              </Paper>
                            ))}
                          </Stack>
                        </Collapse>
                      </Box>
                    );
                  })()}
                </Stack>
              </Group>
            ))}
            {isLoading && (
              <Group align="flex-start">
                <Avatar src="/mascot.png" alt="Todac" color="transparent" radius="xl" size="md" />
                <Loader size="xs" type="dots" color="gray" ml="xs" mt="xs" />
              </Group>
            )}
          </Stack>
        </ScrollArea>

        {/* Input Area */}
        <Box p="md" bg="white">
          <Box maw={800} mx="auto">
            <form onSubmit={handleSendMessage}>
                <TextInput
                  size="lg"
                  radius="xl"
                  placeholder="Todac에게 물어보기"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  styles={{ 
                    input: { 
                      backgroundColor: 'var(--mantine-color-gray-1)', 
                      border: 'none',
                      fontSize: '16px',
                      paddingLeft: '20px'
                    } 
                  }}
                  rightSection={
                    <ActionIcon 
                      type="submit" 
                      variant="transparent" 
                      color={inputMessage.trim() ? "blue" : "gray"}
                      size="lg"
                      disabled={!inputMessage.trim() || isLoading}
                    >
                      <IconSend size={24} />
                    </ActionIcon>
                  }
                  rightSectionWidth={50}
                />
            </form>
            <Text size="xs" c="dimmed" ta="center" mt="xs" style={{ fontSize: '0.7rem' }}>
              ⚠️ 이 정보는 의학적 진단을 대신할 수 없습니다.
            </Text>
          </Box>
        </Box>
      </Paper>

      {/* Sidebar Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="채팅 목록"
        padding="md"
        size="xs"
      >
        <Stack h="calc(100vh - 80px)">
          <Button 
            fullWidth 
            leftSection={<IconPlus size={16} />} 
            onClick={startNewChat}
            variant="light"
            color="green"
          >
            새 채팅 시작
          </Button>
          
          <ScrollArea flex={1}>
            {isLoadingSessions ? (
              <Center py="xl"><Loader size="sm" /></Center>
            ) : sessions.length === 0 ? (
              <Text c="dimmed" ta="center" size="sm" mt="xl">채팅 기록이 없습니다.</Text>
            ) : (
              <Stack gap="xs">
                {sessions.map((session) => (
                  <Paper
                    key={session.id}
                    p="sm"
                    withBorder={sessionId !== session.id}
                    bg={sessionId === session.id ? 'green.0' : 'transparent'}
                    style={{ 
                      cursor: 'pointer',
                      borderColor: sessionId === session.id ? 'var(--mantine-color-green-2)' : undefined
                    }}
                    onClick={() => loadSessionMessages(session)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Box style={{ overflow: 'hidden' }}>
                        <Text size="sm" fw={500} truncate>{session.title || '새 채팅'}</Text>
                        <Text size="xs" c="dimmed">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </Text>
                      </Box>
                      {sessionId !== session.id && (
                        <ActionIcon 
                          variant="subtle" 
                          color="gray" 
                          size="sm"
                          onClick={(e) => requestDeleteSession(e, session)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Drawer>
    </Container>
  );
}