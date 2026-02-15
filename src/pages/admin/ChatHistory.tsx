import { useState, useEffect } from 'react';
import {
    Title, Paper, Group, Stack, LoadingOverlay, Text, Pagination,
    Table, TextInput, Badge, ActionIcon, Box, Breadcrumbs, Anchor,
    ScrollArea, Center, Tooltip, Divider
} from '@mantine/core';
import { IconSearch, IconArrowLeft, IconAlertTriangle, IconMessage } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
    chatHistoryApi,
    ChatUserSummary,
    ChatSessionSummary,
    ChatMessageDetail,
} from '../../api/admin/chat_history';
import dayjs from 'dayjs';

// ── 뷰 상태 타입 ────────────────────────────────────────────────
type ViewState =
    | { view: 'users' }
    | { view: 'sessions'; userId: string; userNickname: string; userEmail: string }
    | { view: 'messages'; sessionId: string; sessionTitle: string | null; userId: string; userNickname: string; userEmail: string };

export default function ChatHistoryPage() {
    const [viewState, setViewState] = useState<ViewState>({ view: 'users' });
    const [loading, setLoading] = useState(false);

    // ── 사용자 목록 상태 ──
    const [users, setUsers] = useState<ChatUserSummary[]>([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const ITEMS_PER_PAGE = 15;

    // ── 세션 목록 상태 ──
    const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);

    // ── 메시지 목록 상태 ──
    const [messages, setMessages] = useState<ChatMessageDetail[]>([]);

    // ── 사용자 목록 로드 ──
    const fetchUsers = async (page: number, search?: string) => {
        setLoading(true);
        try {
            const skip = (page - 1) * ITEMS_PER_PAGE;
            const data = await chatHistoryApi.getUsers(skip, ITEMS_PER_PAGE, search || undefined);
            setUsers(data.items);
            setUserTotal(data.total);
        } catch (error) {
            console.error(error);
            notifications.show({ title: '오류', message: '사용자 목록을 불러오지 못했습니다.', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    // ── 세션 목록 로드 ──
    const fetchSessions = async (userId: string) => {
        setLoading(true);
        try {
            const data = await chatHistoryApi.getUserSessions(userId);
            setSessions(data.items);
        } catch (error) {
            console.error(error);
            notifications.show({ title: '오류', message: '세션 목록을 불러오지 못했습니다.', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    // ── 메시지 내역 로드 ──
    const fetchMessages = async (sessionId: string) => {
        setLoading(true);
        try {
            const data = await chatHistoryApi.getSessionMessages(sessionId);
            setMessages(data.items);
        } catch (error) {
            console.error(error);
            notifications.show({ title: '오류', message: '메시지를 불러오지 못했습니다.', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    // ── 이펙트 ──
    useEffect(() => {
        if (viewState.view === 'users') {
            fetchUsers(userPage, searchQuery);
        }
    }, [userPage, viewState.view]);

    // ── 검색 핸들러 ──
    const handleSearch = () => {
        setUserPage(1);
        fetchUsers(1, searchQuery);
    };

    // ── 사용자 클릭 → 세션 뷰 ──
    const handleUserClick = (user: ChatUserSummary) => {
        setViewState({
            view: 'sessions',
            userId: user.user_id,
            userNickname: user.nickname,
            userEmail: user.email,
        });
        fetchSessions(user.user_id);
    };

    // ── 세션 클릭 → 메시지 뷰 ──
    const handleSessionClick = (session: ChatSessionSummary) => {
        if (viewState.view !== 'sessions') return;
        setViewState({
            view: 'messages',
            sessionId: session.session_id,
            sessionTitle: session.title,
            userId: viewState.userId,
            userNickname: viewState.userNickname,
            userEmail: viewState.userEmail,
        });
        fetchMessages(session.session_id);
    };

    // ── Breadcrumb 네비게이션 ──
    const renderBreadcrumbs = () => {
        const crumbs: { label: string; onClick?: () => void }[] = [
            {
                label: '사용자 목록',
                onClick: viewState.view !== 'users' ? () => setViewState({ view: 'users' }) : undefined,
            },
        ];

        if (viewState.view === 'sessions' || viewState.view === 'messages') {
            crumbs.push({
                label: viewState.userNickname,
                onClick:
                    viewState.view === 'messages'
                        ? () => {
                            setViewState({
                                view: 'sessions',
                                userId: viewState.userId,
                                userNickname: viewState.userNickname,
                                userEmail: viewState.userEmail,
                            });
                            fetchSessions(viewState.userId);
                        }
                        : undefined,
            });
        }

        if (viewState.view === 'messages') {
            crumbs.push({
                label: viewState.sessionTitle || '(제목 없음)',
            });
        }

        return (
            <Breadcrumbs mb="md">
                {crumbs.map((c, i) =>
                    c.onClick ? (
                        <Anchor key={i} onClick={c.onClick} size="sm">
                            {c.label}
                        </Anchor>
                    ) : (
                        <Text key={i} size="sm" fw={600}>
                            {c.label}
                        </Text>
                    )
                )}
            </Breadcrumbs>
        );
    };

    // ═══════════════════════════════════════════════════════════════
    // 뷰 1: 사용자 목록
    // ═══════════════════════════════════════════════════════════════
    const renderUserList = () => {
        const totalPages = Math.ceil(userTotal / ITEMS_PER_PAGE);

        return (
            <>
                <Group mb="md">
                    <TextInput
                        placeholder="이메일 또는 닉네임 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        rightSection={
                            <ActionIcon variant="subtle" onClick={handleSearch}>
                                <IconSearch size={16} />
                            </ActionIcon>
                        }
                        style={{ flex: 1, maxWidth: 400 }}
                    />
                    <Text c="dimmed" size="sm">
                        총 {userTotal}명
                    </Text>
                </Group>

                <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>닉네임</Table.Th>
                            <Table.Th>이메일</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>세션 수</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>메시지 수</Table.Th>
                            <Table.Th>마지막 대화</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {users.length === 0 && !loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Text c="dimmed" ta="center" py="xl">
                                        채팅 이력이 있는 사용자가 없습니다.
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            users.map((user) => (
                                <Table.Tr
                                    key={user.user_id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <Table.Td>
                                        <Text fw={500}>{user.nickname}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {user.email}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>
                                        <Badge variant="light" color="blue">
                                            {user.total_sessions}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>
                                        <Badge variant="light" color="teal">
                                            {user.total_messages}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {user.last_chat_at
                                                ? dayjs(user.last_chat_at).format('YYYY-MM-DD HH:mm')
                                                : '-'}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>

                {totalPages > 1 && (
                    <Group justify="center" mt="md">
                        <Pagination total={totalPages} value={userPage} onChange={setUserPage} />
                    </Group>
                )}
            </>
        );
    };

    // ═══════════════════════════════════════════════════════════════
    // 뷰 2: 세션 목록
    // ═══════════════════════════════════════════════════════════════
    const renderSessionList = () => {
        if (viewState.view !== 'sessions' && viewState.view !== 'messages') return null;

        return (
            <>
                <Group mb="md">
                    <ActionIcon
                        variant="subtle"
                        onClick={() => setViewState({ view: 'users' })}
                    >
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Text fw={600}>{viewState.userNickname}</Text>
                        <Text size="xs" c="dimmed">{viewState.userEmail}</Text>
                    </div>
                </Group>

                <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>세션 제목</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>메시지 수</Table.Th>
                            <Table.Th>시작일</Table.Th>
                            <Table.Th>마지막 업데이트</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {sessions.length === 0 && !loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <Text c="dimmed" ta="center" py="xl">
                                        세션이 없습니다.
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            sessions.map((session) => (
                                <Table.Tr
                                    key={session.session_id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSessionClick(session)}
                                >
                                    <Table.Td>
                                        <Text fw={500}>{session.title || '(제목 없음)'}</Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>
                                        <Badge variant="light" color="blue">
                                            {session.message_count}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {dayjs(session.started_at).format('YYYY-MM-DD HH:mm')}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {dayjs(session.updated_at).format('YYYY-MM-DD HH:mm')}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </>
        );
    };

    // ═══════════════════════════════════════════════════════════════
    // 뷰 3: 메시지 내역 (채팅 버블)
    // ═══════════════════════════════════════════════════════════════
    const renderMessages = () => {
        if (viewState.view !== 'messages') return null;

        return (
            <>
                <Group mb="md">
                    <ActionIcon
                        variant="subtle"
                        onClick={() => {
                            setViewState({
                                view: 'sessions',
                                userId: viewState.userId,
                                userNickname: viewState.userNickname,
                                userEmail: viewState.userEmail,
                            });
                            fetchSessions(viewState.userId);
                        }}
                    >
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Text fw={600}>{viewState.sessionTitle || '(제목 없음)'}</Text>
                        <Text size="xs" c="dimmed">{viewState.userNickname} · 총 {messages.length}개 메시지</Text>
                    </div>
                </Group>

                <Divider mb="md" />

                <ScrollArea h="calc(100vh - 300px)" offsetScrollbars>
                    <Stack gap="md" px="sm">
                        {messages.length === 0 && !loading ? (
                            <Center py="xl">
                                <Text c="dimmed">메시지가 없습니다.</Text>
                            </Center>
                        ) : (
                            messages.map((msg) => {
                                const isUser = msg.role === 'USER';
                                return (
                                    <Box
                                        key={msg.message_id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: isUser ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Paper
                                            shadow="xs"
                                            p="sm"
                                            radius="lg"
                                            withBorder
                                            style={{
                                                maxWidth: '75%',
                                                backgroundColor: isUser ? '#e3f2fd' : '#f5f5f5',
                                                borderBottomRightRadius: isUser ? 4 : undefined,
                                                borderBottomLeftRadius: !isUser ? 4 : undefined,
                                            }}
                                        >
                                            <Group gap={6} mb={4}>
                                                <Badge
                                                    size="xs"
                                                    variant="light"
                                                    color={isUser ? 'blue' : 'grape'}
                                                >
                                                    {isUser ? '사용자' : 'AI'}
                                                </Badge>
                                                {msg.is_emergency && (
                                                    <Tooltip label="응급 상황 감지">
                                                        <IconAlertTriangle size={14} color="red" />
                                                    </Tooltip>
                                                )}
                                                {msg.is_retry && (
                                                    <Badge size="xs" variant="outline" color="orange">
                                                        재질문
                                                    </Badge>
                                                )}
                                            </Group>
                                            <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                {msg.content}
                                            </Text>
                                            <Text size="xs" c="dimmed" ta="right" mt={4}>
                                                {dayjs(msg.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                            </Text>
                                            {msg.rag_sources && msg.rag_sources.length > 0 && (
                                                <Box mt="xs">
                                                    <Text size="xs" c="dimmed" fw={600}>참조 문서:</Text>
                                                    {msg.rag_sources.map((src: any, idx: number) => (
                                                        <Text key={idx} size="xs" c="dimmed">
                                                            · {src.filename || src.question || src.doc_id || '(알 수 없음)'}
                                                            {src.score ? ` (${(src.score * 100).toFixed(0)}%)` : ''}
                                                        </Text>
                                                    ))}
                                                </Box>
                                            )}
                                        </Paper>
                                    </Box>
                                );
                            })
                        )}
                    </Stack>
                </ScrollArea>
            </>
        );
    };

    // ═══════════════════════════════════════════════════════════════
    // 메인 렌더  
    // ═══════════════════════════════════════════════════════════════
    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Group gap="xs">
                    <IconMessage size={28} color="#228be6" />
                    <Title order={2}>대화 내역 관리</Title>
                </Group>
            </Group>

            {renderBreadcrumbs()}

            <Paper shadow="sm" radius="md" p="md" withBorder style={{ position: 'relative', minHeight: '400px' }}>
                <LoadingOverlay visible={loading} />
                {viewState.view === 'users' && renderUserList()}
                {viewState.view === 'sessions' && renderSessionList()}
                {viewState.view === 'messages' && renderMessages()}
            </Paper>
        </Stack>
    );
}
