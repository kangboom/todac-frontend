import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBabyStore } from '../store/babyStore';
import { babyApi } from '../api/baby';
import { Baby } from '../types';
import { 
  Container, 
  Text, 
  Button, 
  Paper, 
  Group, 
  Badge, 
  ActionIcon, 
  Center,
  Stack,
  Box,
  Avatar,
  Image,
  Loader,
  ThemeIcon
} from '@mantine/core';
import { 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconMessageChatbot,
  IconGenderMale,
  IconGenderFemale
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ConfirmModal from '../components/ConfirmModal';
import CommonHeader from '../components/CommonHeader';

export default function Home() {
  const navigate = useNavigate();
  const { babies, setSelectedBaby, fetchBabies, removeBaby } = useBabyStore();
  const [isLoading, setIsLoading] = useState(true);
  
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState<Baby | null>(null);
  const [isDeletingBaby, setIsDeletingBaby] = useState(false);
  
  // 현재 보고 있는 카드의 인덱스 (0부터 시작)
  const [activeIndex, setActiveIndex] = useState(0);
  
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

  const requestDeleteBaby = (e: React.MouseEvent, baby: Baby) => {
    e.stopPropagation();
    setBabyToDelete(baby);
    setDeleteModalOpened(true);
  };

  const confirmDeleteBaby = async () => {
    if (!babyToDelete) return;
    setIsDeletingBaby(true);
    
    try {
      await babyApi.delete(babyToDelete.id);
      removeBaby(babyToDelete.id);
      notifications.show({
        title: '삭제 완료',
        message: '아기 프로필이 삭제되었습니다.',
        color: 'green',
      });
      setDeleteModalOpened(false);
      setBabyToDelete(null);
    } catch (error) {
      console.error('Failed to delete baby:', error);
      notifications.show({
        title: '삭제 실패',
        message: '삭제 중 오류가 발생했습니다.',
        color: 'red',
      });
    } finally {
      setIsDeletingBaby(false);
    }
  };

  const calculateCorrectedAge = (birthDate: string, dueDate: string) => {
    const birth = new Date(birthDate);
    const due = new Date(dueDate);
    const now = new Date();
    
    // 교정일수 계산
    const diffTime = Math.abs(now.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // 생후일수
    const bornDiff = Math.ceil((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    return { bornDays: bornDiff, correctedDays: now < due ? -diffDays : diffDays };
  };

  // 스크롤 이벤트 핸들러: 현재 보이는 카드의 인덱스를 계산
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth; // 카드가 화면 너비(100%)를 차지하므로
    
    // 반올림하여 가장 가까운 인덱스를 찾음
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <Container fluid h="100dvh" p={0} m={0} bg="gray.0">
      <Stack h="100%" gap={0}>
        <ConfirmModal
          opened={deleteModalOpened}
          title="프로필 삭제"
          message={`'${babyToDelete?.name}' 프로필을 정말 삭제하시겠습니까?`}
          confirmLabel="삭제"
          confirmColor="red"
          loading={isDeletingBaby}
          onConfirm={confirmDeleteBaby}
          onClose={() => {
            if (isDeletingBaby) return;
            setDeleteModalOpened(false);
            setBabyToDelete(null);
          }}
        />

        {/* Header */}
        <CommonHeader title="프로필 선택" />

        {/* Main Content - Horizontal Scroll */}
        <Box flex={1} style={{ overflowX: 'hidden', position: 'relative' }}>
          {isLoading ? (
            <Center h="100%">
              <Loader color="green" />
            </Center>
          ) : babies.length === 0 ? (
            <Center h="100%">
              <Stack align="center" gap="xl">
                <Image src="/mascot.png" w={180} h={180} fit="contain" opacity={0.8} />
                <Text size="lg" c="dimmed" ta="center">등록된 아기가 없습니다.<br/>새로운 프로필을 등록해보세요!</Text>
                <Button 
                  leftSection={<IconPlus size={20} />}
                  size="md"
                  radius="xl"
                  color="green"
                  onClick={() => navigate('/babies/new')}
                >
                  아기 등록하기
                </Button>
              </Stack>
            </Center>
          ) : (
            <Box 
              w="100%" 
              h="100%" 
              onScroll={handleScroll} // 스크롤 이벤트 연결
              style={{ 
                overflowX: 'auto', 
                whiteSpace: 'nowrap', 
                scrollSnapType: 'x mandatory',
                display: 'flex',
                alignItems: 'center',
                padding: '20px'
              }}
            >
              {babies.map((baby) => {
                const { bornDays, correctedDays } = calculateCorrectedAge(baby.birth_date, baby.due_date);
                return (
                  <Box 
                    key={baby.id}
                    style={{ 
                      scrollSnapAlign: 'center', 
                      minWidth: '100%', 
                      display: 'inline-block',
                      padding: '0 10px'
                    }}
                  >
                    <Center h="100%">
                      <Paper 
                        shadow="xl" 
                        radius="xl" 
                        p="xl" 
                        w="100%" 
                        maw={340} 
                        bg="white"
                        withBorder
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative' }}
                      >
                         <Group style={{ position: 'absolute', top: 15, right: 15 }}>
                            <ActionIcon variant="subtle" color="gray" onClick={(e) => { e.stopPropagation(); navigate(`/babies/${baby.id}/edit`); }}>
                              <IconEdit size={18} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={(e) => requestDeleteBaby(e, baby)}>
                              <IconTrash size={18} />
                            </ActionIcon>
                         </Group>

                         <Avatar size={120} radius={120} color="green" variant="light" mt="lg">
                           {baby.gender === 'M' || baby.gender === 'BOY' ? <IconGenderMale size={60} /> : <IconGenderFemale size={60} />}
                         </Avatar>
                         
                         <Stack gap={0} align="center">
                           <Text size="xl" fw={700}>{baby.name}</Text>
                           <Text size="sm" c="dimmed">{baby.birth_date} 출생</Text>
                         </Stack>

                         <Group gap="xs">
                           <Badge size="lg" variant="dot" color="green">생후 {bornDays}일</Badge>
                           <Badge size="lg" variant="dot" color="teal">교정 {correctedDays > 0 ? correctedDays : 0}일</Badge>
                         </Group>

                         <Paper w="100%" bg="green.0" p="md" radius="md">
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" c="dimmed">출생 체중</Text>
                                <Text fw={500}>{baby.birth_weight}kg</Text>
                              </Group>
                              <Group justify="space-between">
                                <Text size="sm" c="dimmed">출생 키</Text>
                                <Text fw={500}>{baby.birth_height}cm</Text>
                              </Group>
                            </Stack>
                         </Paper>

                         <Button 
                           fullWidth 
                           size="lg" 
                           radius="xl" 
                           color="green" 
                           leftSection={<IconMessageChatbot />}
                           onClick={() => handleBabySelect(baby)}
                           mt="sm"
                         >
                           대화 시작하기
                         </Button>
                      </Paper>
                    </Center>
                  </Box>
                );
              })}
              
              {/* Add New Baby Card (Last Slide) */}
              <Box 
                style={{ 
                  scrollSnapAlign: 'center', 
                  minWidth: '100%', 
                  display: 'inline-block',
                  padding: '0 10px'
                }}
              >
                <Center h="100%">
                  <Paper 
                    shadow="sm" 
                    radius="xl" 
                    p="xl" 
                    w="100%" 
                    maw={340} 
                    h={450}
                    bg="gray.0"
                    style={{ border: '2px dashed #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', cursor: 'pointer' }}
                    onClick={() => navigate('/babies/new')}
                  >
                     <ThemeIcon size={80} radius={80} color="green" variant="light">
                       <IconPlus size={40} />
                     </ThemeIcon>
                     <Text fw={500} c="dimmed">새로운 아기 등록하기</Text>
                  </Paper>
                </Center>
              </Box>

            </Box>
          )}
        </Box>
        
        {/* Indicator Dots - Active Index Logic Applied */}
        {babies.length > 0 && (
          <Center p="md" pb="xl">
             <Group gap="xs">
               {Array.from({ length: babies.length + 1 }).map((_, idx) => (
                 <Box 
                    key={idx} 
                    w={8} 
                    h={8} 
                    bg={activeIndex === idx ? "green.6" : "gray.3"} 
                    style={{ 
                        borderRadius: '50%',
                        transition: 'background-color 0.3s ease'
                    }} 
                />
               ))}
             </Group>
          </Center>
        )}
      </Stack>
    </Container>
  );
}