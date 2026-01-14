import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper,
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
import { IconAt, IconLock } from '@tabler/icons-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await login(email, password);
      notifications.show({
        title: '로그인 성공',
        message: '환영합니다!',
        color: 'green',
      });
      navigate('/');
    } catch (error) {
      notifications.show({
        title: '로그인 실패',
        message: '이메일 또는 비밀번호를 확인해주세요.',
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
            <Stack gap={0} align="center">
              <Image src="/logo.png" w={280} fit="contain" alt="Todac Logo" mb="sm" />
              <Text c="dimmed" size="sm" ta="center">
                미숙아를 위한 똑똑한 양육 가이드
              </Text>
            </Stack>

            {/* Login Form Card */}
            <Paper w="100%" shadow="xl" radius="lg" p="xl" bg="white">
              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput 
                    label="이메일" 
                    placeholder="hello@todac.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftSection={<IconAt size={16} />}
                    radius="md"
                    size="md"
                    styles={{ input: { backgroundColor: '#f8f9fa' } }}
                  />
                  
                  <PasswordInput 
                    label="비밀번호" 
                    placeholder="비밀번호 입력" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftSection={<IconLock size={16} />}
                    radius="md"
                    size="md"
                    styles={{ input: { backgroundColor: '#f8f9fa' } }}
                  />
                  
                  <Button 
                      fullWidth 
                      mt="sm" 
                      type="submit" 
                      loading={isLoading}
                      color="green"
                      radius="md"
                      size="lg"
                      fw={600}
                  >
                    로그인
                  </Button>
                </Stack>
              </form>
            </Paper>

            {/* Footer Actions */}
            <Group justify="center" gap="xs">
              <Text size="sm" c="dimmed">아직 계정이 없으신가요?</Text>
              <Anchor 
                component="button" 
                type="button" 
                c="green.7" 
                fw={600} 
                size="sm"
                onClick={() => navigate('/signup')}
              >
                회원가입
              </Anchor>
            </Group>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
