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
  Alert,
  Textarea
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import '@mantine/dates/styles.css';

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
  const [medicalHistory, setMedicalHistory] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const baby = babies.find((b) => b.id === id);
      if (baby) {
        setName(baby.name);
        setBirthDate(new Date(baby.birth_date));
        setDueDate(new Date(baby.due_date));
        setGender(baby.gender || null);
        setBirthWeight(baby.birth_weight);
        setMedicalHistory(baby.medical_history.join(', '));
      }
    }
  }, [isEdit, id, babies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const medicalHistoryList = medicalHistory
        ? medicalHistory.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      if (!birthDate || !dueDate || !birthWeight) {
        throw new Error('필수 항목을 모두 입력해주세요.');
      }

      const formattedBirthDate = birthDate.toISOString().split('T')[0];
      const formattedDueDate = dueDate.toISOString().split('T')[0];
      const weight = typeof birthWeight === 'string' ? parseFloat(birthWeight) : birthWeight;

      if (isEdit && id) {
        const updateData: BabyUpdateRequest = {
          name,
          birth_date: formattedBirthDate,
          due_date: formattedDueDate,
          gender: (gender as 'M' | 'F') || null,
          birth_weight: weight,
          medical_history: medicalHistoryList,
        };
        const updated = await babyApi.update(id, updateData);
        updateBaby(updated);
      } else {
        const createData: BabyCreateRequest = {
          name,
          birth_date: formattedBirthDate,
          due_date: formattedDueDate,
          gender: (gender as 'M' | 'F') || null,
          birth_weight: weight,
          medical_history: medicalHistoryList,
        };
        const created = await babyApi.create(createData);
        addBaby(created);
      }
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || '저장에 실패했습니다.');
      } else {
        setError('저장에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        {isEdit ? '아기 프로필 수정' : '아기 프로필 등록'}
      </Title>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="아기 이름/태명"
              placeholder="이름을 입력하세요"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Group grow>
              <DateInput
                value={birthDate}
                onChange={setBirthDate}
                label="실제 출생일"
                placeholder="YYYY-MM-DD"
                required
                description="예방접종 기준"
              />
              <DateInput
                value={dueDate}
                onChange={setDueDate}
                label="출산 예정일"
                placeholder="YYYY-MM-DD"
                required
                description="교정 연령/발달 평가 기준"
              />
            </Group>

            <Group grow>
              <Select
                label="성별"
                placeholder="선택하세요"
                data={[
                  { value: 'M', label: '남아' },
                  { value: 'F', label: '여아' },
                ]}
                value={gender}
                onChange={setGender}
              />
              <NumberInput
                label="출생 체중 (kg)"
                placeholder="예: 2.5"
                required
                value={birthWeight}
                onChange={setBirthWeight}
                min={0}
                step={0.01}
                decimalScale={2}
              />
            </Group>

            <Textarea
              label="기저질환"
              placeholder="예: RDS, 황달 (쉼표로 구분)"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              minRows={2}
            />

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="오류" color="red">
                {error}
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => navigate('/')}>
                취소
              </Button>
              <Button type="submit" loading={isLoading}>
                저장
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
