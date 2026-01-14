import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBabyStore } from '../store/babyStore';
import { babyApi } from '../api/baby';
import type { BabyCreateRequest, BabyUpdateRequest } from '../types';
import {
  Container,
  Paper,
  Title,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Textarea,
  Box,
  Text,
  Center,
  Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { 
  IconCheck, 
  IconGenderFemale, 
  IconGenderMale,
  IconUser,
  IconCalendar,
  IconScale,
  IconRuler
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import CommonHeader from '../components/CommonHeader';

export default function BabyForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addBaby, updateBaby, babies } = useBabyStore();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [birthWeight, setBirthWeight] = useState<number | string>('');
  const [birthHeight, setBirthHeight] = useState<number | string>('');
  const [medicalHistory, setMedicalHistory] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const baby = babies.find((b) => b.id === id);
      if (baby) {
        setName(baby.name);
        setBirthDate(new Date(baby.birth_date));
        setDueDate(new Date(baby.due_date));
        
        // 서버는 M/F를 사용하지만, 과거 데이터(BOY/GIRL)가 있을 수 있어 호환 처리
        const normalizedGender =
          baby.gender === 'M' || baby.gender === 'F'
            ? baby.gender
            : baby.gender === 'BOY'
              ? 'M'
              : baby.gender === 'GIRL'
                ? 'F'
                : null;
        setGender(normalizedGender);
        
        // 백엔드가 이미 kg 단위이므로 변환 없이 그대로 사용
        setBirthWeight(baby.birth_weight);
        setBirthHeight(baby.birth_height || '');
        setMedicalHistory(baby.medical_history.join(', '));
      }
    }
  }, [isEdit, id, babies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const medicalHistoryList = medicalHistory
        ? medicalHistory.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      if (!birthDate || !dueDate || !birthWeight) {
        throw new Error('필수 항목을 모두 입력해주세요.');
      }

      const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
      const dueDateObj = dueDate instanceof Date ? dueDate : new Date(dueDate);

      const formattedBirthDate = birthDateObj.toISOString().split('T')[0];
      const formattedDueDate = dueDateObj.toISOString().split('T')[0];
      
      const weight = typeof birthWeight === 'string' ? parseFloat(birthWeight) : birthWeight;
      const height = typeof birthHeight === 'string' ? parseFloat(birthHeight) : birthHeight;

      // Ensure gender is M or F
      const submitGender = (gender === 'M' || gender === 'F') ? gender : null;

      if (isEdit && id) {
        const updateData: BabyUpdateRequest = {
          name,
          birth_date: formattedBirthDate,
          due_date: formattedDueDate,
          gender: submitGender, // M or F or null
          birth_weight: weight,
          birth_height: height || undefined,
          medical_history: medicalHistoryList,
        };
        const updated = await babyApi.update(id, updateData);
        updateBaby(updated);
        notifications.show({
            title: '수정 완료',
            message: '아기 프로필이 수정되었습니다.',
            color: 'green',
        });
      } else {
        const createData: BabyCreateRequest = {
          name,
          birth_date: formattedBirthDate,
          due_date: formattedDueDate,
          gender: submitGender, // M or F or null
          birth_weight: weight,
          birth_height: height || undefined,
          medical_history: medicalHistoryList,
        };
        const created = await babyApi.create(createData);
        addBaby(created);
        notifications.show({
            title: '등록 완료',
            message: '아기 프로필이 등록되었습니다.',
            color: 'green',
        });
      }
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '저장에 실패했습니다.';
      notifications.show({
        title: '오류',
        message: msg,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid h="100dvh" p={0} m={0} bg="gray.0">
      <Stack h="100%" gap={0}>
        {/* Header */}
        <CommonHeader 
          title={isEdit ? '프로필 수정' : '아기 등록'} 
          showBack={true} 
        />

        {/* Content */}
        <Box flex={1} style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }} p="md">
            {/* margin: auto를 사용하여 세로 중앙 정렬하되, 넘치면 스크롤 가능하게 함 */}
            <Paper w="100%" maw={500} shadow="sm" radius="lg" p="xl" bg="white" style={{ margin: 'auto' }}>
                <Stack gap="md" pt={0}>
                    <Center>
                        <Stack gap={0} align="center">
                            <Title order={4} c="gray.8">
                                {isEdit ? '정보 수정' : '아기 등록'}
                            </Title>
                            <Text size="xs" c="dimmed">
                                {isEdit ? '수정할 정보를 입력해주세요' : '우리 아기를 소개해주세요'}
                            </Text>
                        </Stack>
                    </Center>

                    <Divider label="기본 정보" labelPosition="center" color="green.2" />

                    <TextInput
                        label="이름/태명"
                        placeholder="예: 튼튼이"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        radius="md"
                        size="md"
                        leftSection={<IconUser size={16} />}
                        variant="filled"
                    />

                    <Group grow>
                        <Select
                            label="성별"
                            placeholder="선택"
                            data={[
                                { value: 'M', label: '남아' },
                                { value: 'F', label: '여아' },
                            ]}
                            value={gender}
                            onChange={setGender}
                            radius="md"
                            size="md"
                            leftSection={gender === 'M' ? <IconGenderMale size={16} /> : gender === 'F' ? <IconGenderFemale size={16} /> : <IconUser size={16} />}
                            variant="filled"
                        />
                    </Group>

                    <Group grow>
                        <DateInput
                            value={birthDate}
                            onChange={(date) => setBirthDate(date as Date | null)}
                            label="실제 출생일"
                            placeholder="YYYY-MM-DD"
                            required
                            valueFormat="YYYY-MM-DD"
                            radius="md"
                            size="md"
                            leftSection={<IconCalendar size={16} />}
                            variant="filled"
                        />
                        <DateInput
                            value={dueDate}
                            onChange={(date) => setDueDate(date as Date | null)}
                            label="출산 예정일"
                            placeholder="YYYY-MM-DD"
                            required
                            valueFormat="YYYY-MM-DD"
                            radius="md"
                            size="md"
                            leftSection={<IconCalendar size={16} />}
                            variant="filled"
                        />
                    </Group>

                    <Divider label="신체 정보" labelPosition="center" color="green.2" mt="sm" />

                    <Group grow>
                        <NumberInput
                            label="출생 체중 (kg)"
                            placeholder="예: 2.5"
                            required
                            value={birthWeight}
                            onChange={setBirthWeight}
                            min={0}
                            decimalScale={2}
                            radius="md"
                            size="md"
                            hideControls
                            suffix=" kg"
                            leftSection={<IconScale size={16} />}
                            variant="filled"
                        />
                        <NumberInput
                            label="출생 키 (cm)"
                            placeholder="예: 45"
                            value={birthHeight}
                            onChange={setBirthHeight}
                            min={0}
                            radius="md"
                            size="md"
                            hideControls
                            suffix=" cm"
                            leftSection={<IconRuler size={16} />}
                            variant="filled"
                        />
                    </Group>

                    <Textarea
                        label="기저질환 (선택)"
                        placeholder="예: RDS, 황달 등 (쉼표로 구분)"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        minRows={3}
                        radius="md"
                        size="md"
                        variant="filled"
                    />

                    <Button 
                        fullWidth 
                        size="lg" 
                        radius="xl" 
                        color="green" 
                        mt="md"
                        loading={isLoading} 
                        onClick={handleSubmit}
                        leftSection={<IconCheck size={20} />}
                    >
                        {isEdit ? '수정 완료' : '등록 완료'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
      </Stack>
    </Container>
  );
}