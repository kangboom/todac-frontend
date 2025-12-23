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

export default function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signup({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      });
      setAuth(response.user, response.token.access_token);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || '회원가입에 실패했습니다.');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        회원가입
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        TODAC 서비스에 가입하세요
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="닉네임"
              placeholder="닉네임을 입력하세요"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
            <TextInput
              label="이메일"
              placeholder="you@example.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <PasswordInput
              label="비밀번호"
              placeholder="최소 8자 이상"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <PasswordInput
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="오류" color="red">
                {error}
              </Alert>
            )}

            <Button fullWidth mt="xl" type="submit" loading={isLoading}>
              회원가입
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md" size="sm">
          이미 계정이 있으신가요?{' '}
          <Anchor component={Link} to="/login" fw={700}>
            로그인
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}
