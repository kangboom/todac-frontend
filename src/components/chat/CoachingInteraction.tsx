import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { CoachingInteraction as CoachingInteractionType } from '../../types';

interface Props {
  interaction: CoachingInteractionType;
  disabled?: boolean;
  onSelect: (optionId: string, label: string) => void;
}

export default function CoachingInteraction({ interaction, disabled, onSelect }: Props) {
  return (
    <Paper withBorder radius="lg" p="md" bg="green.0">
      <Stack gap="sm">
        <Text size="sm" fw={500}>{interaction.prompt}</Text>
        {interaction.options.length > 0 && (
          <Group gap="xs" wrap="wrap">
            {interaction.options.map((option) => (
              <Button
                key={option.id}
                size="xs"
                variant="light"
                color="green"
                disabled={disabled}
                onClick={() => onSelect(option.id, option.label)}
              >
                {option.label}
              </Button>
            ))}
          </Group>
        )}
        {interaction.allow_free_text && (
          <Text size="xs" c="dimmed">선택하거나 아래 입력창에 직접 적어도 돼요.</Text>
        )}
      </Stack>
    </Paper>
  );
}
