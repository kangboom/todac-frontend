import { useState, useEffect } from 'react';
import { 
  Group, 
  Text, 
  Button, 
  Textarea, 
  Stack, 
  ActionIcon,
  Collapse,
  Rating,
  Box,
  Paper
} from '@mantine/core';
import { IconThumbUp, IconThumbDown, IconMessage } from '@tabler/icons-react';
import { chatApi } from '../../api/chat';
import { notifications } from '@mantine/notifications';

interface FeedbackProps {
  messageId: string;
  initialScore?: number;
  onClose: () => void;
}

export default function Feedback({ messageId, initialScore = 0, onClose }: FeedbackProps) {
  const [score, setScore] = useState(initialScore);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialScore > 0) {
      setScore(initialScore);
    }
  }, [initialScore]);

  const handleSubmit = async () => {
    if (score === 0) {
      notifications.show({
        title: '별점을 선택해주세요',
        message: '최소 1점 이상의 별점이 필요합니다.',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await chatApi.sendFeedback(messageId, score, comment);
      setIsSubmitted(true);
      onClose(); // Close form on success? Or show success message?
      // Let's show success message briefly or just close.
      // User requirement: "Feedback form"
      notifications.show({
        title: '소중한 의견 감사합니다',
        message: '더 나은 답변을 위해 노력하겠습니다.',
        color: 'green',
      });
    } catch (error) {
      console.error('Feedback failed:', error);
      notifications.show({
        title: '전송 실패',
        message: '피드백 전송 중 오류가 발생했습니다.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Paper p="sm" radius="md" bg="green.0" withBorder style={{ borderColor: 'var(--mantine-color-green-2)' }}>
        <Text size="sm" c="green.8" ta="center">피드백이 전송되었습니다. 감사합니다!</Text>
      </Paper>
    );
  }

  return (
    <Box w="100%">
      <Paper withBorder p="sm" radius="md" bg="gray.0">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={500}>답변 평가</Text>
            <Rating value={score} onChange={setScore} />
          </Group>
          
          <Textarea
            placeholder="어떤 점이 좋거나 아쉬웠나요? (선택사항)"
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            minRows={2}
            autosize
          />
          
          <Group justify="flex-end" gap="xs">
            <Button 
              variant="subtle" 
              size="xs" 
              color="gray" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button 
              variant="filled" 
              size="xs" 
              color="green" 
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              보내기
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
