import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  PasswordInput, 
  Button, 
  Anchor, 
  Stack, 
  Alert 
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      setAuth(response.user, response.token.access_token);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || '로그인에 실패했습니다.');
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        TODAC
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        미숙아 챗봇 서비스에 오신 것을 환영합니다
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput 
              label="이메일" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput 
              label="비밀번호" 
              placeholder="비밀번호를 입력하세요" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="오류" color="red">
                {error}
              </Alert>
            )}

            <Button fullWidth mt="xl" type="submit" loading={isLoading}>
              로그인
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md" size="sm">
          계정이 없으신가요?{' '}
          <Anchor component={Link} to="/signup" fw={700}>
            회원가입
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}
