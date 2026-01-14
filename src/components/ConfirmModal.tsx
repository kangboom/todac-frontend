import { Modal, Text, Group, Button, Stack } from '@mantine/core';

type ConfirmModalProps = {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
  zIndex?: number;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmColor = 'red',
  loading = false,
  zIndex = 4000,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (loading) return;
        onClose();
      }}
      title={title}
      centered
      zIndex={zIndex}
      overlayProps={{ zIndex: zIndex - 1 }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {message}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={confirmColor} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}


