import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Group, ActionIcon, Text, Menu, Avatar } from '@mantine/core';
import { 
  IconMenu2, 
  IconArrowLeft, 
  IconUserCircle, 
  IconSettings, 
  IconLogout 
} from '@tabler/icons-react';

interface CommonHeaderProps {
  title: string;
  onMenuClick?: () => void; // For drawer
  showMenu?: boolean;       // Show menu icon on left
  showBack?: boolean;       // Show back button on right
  backPath?: string;        // Path for back button (default: '/')
}

export default function CommonHeader({ 
  title, 
  onMenuClick, 
  showMenu = false, 
  showBack = false,
  backPath = '/'
}: CommonHeaderProps) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Group p="sm" justify="space-between" bg="white" style={{ zIndex: 10, borderBottom: '1px solid #eee', position: 'relative' }}>
      {/* Left Section */}
      <Group gap="xs">
        {showMenu && (
          <ActionIcon variant="subtle" color="gray" onClick={onMenuClick} size="lg">
            <IconMenu2 size={24} />
          </ActionIcon>
        )}
        <Text 
          fw={600} 
          size="xl" 
          lh={1.2} 
          c="green.8" 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Todac
        </Text>
      </Group>

      {/* Center Section - Title */}
      <Text 
        size="md" 
        fw={600} 
        style={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          userSelect: 'none'
        }}
      >
        {title}
      </Text>

      {/* Right Section */}
      <Group gap="xs">
        {showBack && (
          <ActionIcon variant="subtle" color="gray" onClick={() => navigate(backPath)} size="lg">
            <IconArrowLeft size={24} />
          </ActionIcon>
        )}
        
        {/* Profile Menu */}
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
               <Avatar src={null} alt={user?.nickname} radius="xl" size="sm" color="green">
                 {user?.nickname?.charAt(0)}
               </Avatar>
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>사용자</Menu.Label>
            <Menu.Item leftSection={<IconUserCircle size={14} />}>
              마이페이지
            </Menu.Item>
            {user?.role === 'ADMIN' && (
              <Menu.Item 
                leftSection={<IconSettings size={14} />}
                onClick={() => navigate('/admin')}
              >
                관리자 설정
              </Menu.Item>
            )}
            
            <Menu.Divider />
            
            <Menu.Item 
              color="red" 
              leftSection={<IconLogout size={14} />}
              onClick={handleLogout}
            >
              로그아웃
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}

