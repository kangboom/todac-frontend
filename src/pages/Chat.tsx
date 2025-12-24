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
  Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconSend, 
  IconMenu2, 
  IconPlus, 
  IconX,
  IconBook,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

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

  const deleteSession = async (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    if (!confirm('이 채팅방을 삭제하시겠습니까?')) return;

    try {
      await chatApi.deleteSession(session.id);
      if (sessionId === session.id) {
        startNewChat();
      }
      await loadSessions();
      notifications.show({
        title: '삭제 완료',
        message: '채팅방이 삭제되었습니다.',
        color: 'blue',
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
      notifications.show({
        title: '삭제 실패',
        message: '채팅방 삭제에 실패했습니다.',
        color: 'red',
      });
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
    <Container size="md" h="calc(100vh - 100px)" py="md">
      <Paper withBorder radius="lg" h="100%" display="flex" style={{ flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Group p="md" justify="space-between" bg="blue.0" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <Group>
            <ActionIcon variant="subtle" onClick={openDrawer} display={{ base: 'block', sm: 'block' }}>
              <IconMenu2 size={20} />
            </ActionIcon>
            <div>
              <Text fw={700}>{selectedBaby.name}</Text>
              <Text size="xs" c="dimmed">미숙아 챗봇</Text>
            </div>
          </Group>
          <Button variant="light" size="xs" onClick={() => navigate('/')}>
            나가기
          </Button>
        </Group>

        {/* Chat Area */}
        <ScrollArea viewportRef={viewport} flex={1} p="md" bg="gray.0">
          <Stack gap="md">
            {messages.length === 0 && (
              <Center h={200}>
                <Stack align="center" gap="xs">
                  <Text size="lg">👋 안녕하세요!</Text>
                  <Text size="sm" c="dimmed">{selectedBaby.name}에 대해 궁금한 점을 물어보세요.</Text>
                </Stack>
              </Center>
            )}

            {messages.map((msg) => (
              <Group 
                key={msg.message_id} 
                justify={msg.role === 'USER' ? 'flex-end' : 'flex-start'} 
                align="flex-start"
              >
                {msg.role === 'ASSISTANT' && (
                  <Avatar src={null} alt="AI" color="blue" radius="xl">AI</Avatar>
                )}
                
                <Stack gap={4} maw="75%">
                  <Paper
                    p="sm"
                    radius="lg"
                    bg={msg.role === 'USER' ? 'blue.6' : 'white'}
                    c={msg.role === 'USER' ? 'white' : 'black'}
                    shadow="sm"
                  >
                    {msg.is_emergency && (
                      <Badge color="red" variant="filled" mb="xs">⚠️ 응급 상황 감지</Badge>
                    )}
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                  </Paper>

                  {/* Reference Docs */}
                  {msg.role === 'ASSISTANT' && msg.rag_sources && msg.rag_sources.length > 0 && (
                    <Box>
                      <Button 
                        variant="subtle" 
                        size="xs" 
                        leftSection={<IconBook size={12} />}
                        rightSection={expandedSources.has(msg.message_id) ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                        onClick={() => toggleSource(msg.message_id)}
                        styles={{ root: { color: 'var(--mantine-color-dimmed)' } }}
                      >
                        참고 문서 {msg.rag_sources.length}개
                      </Button>
                      
                      <Collapse in={expandedSources.has(msg.message_id)}>
                        <Stack gap="xs" mt="xs">
                          {msg.rag_sources.map((source, idx) => (
                            <Paper key={idx} p="xs" withBorder radius="md" bg="gray.0">
                              <Group justify="space-between" mb={4}>
                                <Text size="xs" fw={700} lineClamp={1}>{source.filename}</Text>
                                <Badge size="xs" variant="outline">{(source.score * 100).toFixed(0)}%</Badge>
                              </Group>
                              <Text size="xs" c="dimmed">카테고리: {source.category}</Text>
                            </Paper>
                          ))}
                        </Stack>
                      </Collapse>
                    </Box>
                  )}
                  
                  <Text size="xs" c="dimmed" ta={msg.role === 'USER' ? 'right' : 'left'}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Stack>
              </Group>
            ))}
            {isLoading && (
              <Group align="flex-start">
                <Avatar src={null} alt="AI" color="blue" radius="xl">AI</Avatar>
                <Paper p="sm" radius="lg" bg="white" shadow="sm">
                  <Loader size="xs" type="dots" />
                </Paper>
              </Group>
            )}
          </Stack>
        </ScrollArea>

        {/* Input Area */}
        <Box p="md" bg="white" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <form onSubmit={handleSendMessage}>
            <Group align="flex-end">
              <TextInput
                placeholder="메시지를 입력하세요..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{ flex: 1 }}
                disabled={isLoading}
                rightSection={
                  <ActionIcon 
                    type="submit" 
                    variant="filled" 
                    color="blue" 
                    radius="xl"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <IconSend size={18} />
                  </ActionIcon>
                }
              />
            </Group>
          </form>
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
                    bg={sessionId === session.id ? 'blue.0' : 'transparent'}
                    style={{ 
                      cursor: 'pointer',
                      borderColor: sessionId === session.id ? 'var(--mantine-color-blue-2)' : undefined
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
                          onClick={(e) => deleteSession(e, session)}
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
