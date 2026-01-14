import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Container, 
  Group, 
  Text,
  Stack,
  Image,
  Box,
  Center,
  Anchor
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAt, IconLock, IconUser } from '@tabler/icons-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      notifications.show({
        title: '오류',
        message: '비밀번호가 일치하지 않습니다.',
        color: 'red',
      });
      return;
    }

    if (formData.password.length < 8) {
      notifications.show({
        title: '오류',
        message: '비밀번호는 최소 8자 이상이어야 합니다.',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      });
      notifications.show({
        title: '가입 성공',
        message: '환영합니다! 회원가입이 완료되었습니다.',
        color: 'green',
      });
      navigate('/');
    } catch (err: unknown) {
      notifications.show({
        title: '가입 실패',
        message: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box h="100dvh" bg="green.0">
      <Container size="xs" h="100%" p={0}>
        <Center h="100%" px="md">
          <Stack w="100%" align="center" gap="xl">
            {/* Logo Section */}
            <Stack gap="xs" align="center">
              <Image src="/mascot.png" w={100} h={100} fit="contain" alt="Todac Mascot" />
              <Title order={2} c="green.9" style={{ fontFamily: 'sans-serif', fontWeight: 800 }}>
                회원가입
              </Title>
              <Text c="dimmed" size="sm" ta="center">
                Todac과 함께 스마트한 육아를 시작하세요
              </Text>
            </Stack>

            {/* Signup Form Card */}
            <Paper w="100%" shadow="xl" radius="lg" p="xl" bg="white">
              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    label="닉네임"
                    placeholder="닉네임을 입력하세요"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    required
                    leftSection={<IconUser size={16} />}
                    radius="md"
                    size="md"
                    styles={{ input: { backgroundColor: '#f8f9fa' } }}
                  />
                  <TextInput
                    label="이메일"
                    placeholder="you@example.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    leftSection={<IconAt size={16} />}
                    radius="md"
                    size="md"
                    styles={{ input: { backgroundColor: '#f8f9fa' } }}
                  />
                  <PasswordInput
                    label="비밀번호"
                    placeholder="최소 8자 이상"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    leftSection={<IconLock size={16} />}
                    radius="md"
                    size="md"
                    styles={{ input: { backgroundColor: '#f8f9fa' } }}
                  />
                  <PasswordInput
                    label="비밀번호 확인"
                    placeholder="비밀번호를 다시 입력하세요"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    leftSection={<IconLock size={16} />}
                    radius="md"
                    size="md"
                    styles={{ input: { backgroundColor: '#f8f9fa' } }}
                  />

                  <Button 
                    fullWidth 
                    mt="md" 
                    type="submit" 
                    loading={isLoading}
                    color="green"
                    radius="md"
                    size="lg"
                    fw={600}
                  >
                    가입하기
                  </Button>
                </Stack>
              </form>
            </Paper>

            {/* Footer Actions */}
            <Group justify="center" gap="xs">
              <Text size="sm" c="dimmed">이미 계정이 있으신가요?</Text>
              <Anchor 
                component="button" 
                type="button" 
                c="green.7" 
                fw={600} 
                size="sm"
                onClick={() => navigate('/login')}
              >
                로그인
              </Anchor>
            </Group>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
