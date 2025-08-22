import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import SettingsPage from '../page';

// Mock the useAuth hook
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  organization: { name: 'Test Org' }
};

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false
  })
}));

describe('SettingsPage', () => {
  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  it('renders settings page with user information', () => {
    renderWithAuth(<SettingsPage />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your account preferences and system configuration')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('displays all navigation tabs', () => {
    renderWithAuth(<SettingsPage />);
    
    expect(screen.getByText('👤 Profile')).toBeInTheDocument();
    expect(screen.getByText('🔔 Notifications')).toBeInTheDocument();
    expect(screen.getByText('🔒 Security')).toBeInTheDocument();
    expect(screen.getByText('⚙️ System')).toBeInTheDocument();
    expect(screen.getByText('🔗 Integrations')).toBeInTheDocument();
  });

  it('shows profile tab by default', () => {
    renderWithAuth(<SettingsPage />);
    
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Account Status')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('switches to notifications tab when clicked', async () => {
    renderWithAuth(<SettingsPage />);
    
    const notificationsTab = screen.getByText('🔔 Notifications');
    fireEvent.click(notificationsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      expect(screen.getByText('Communication Channels')).toBeInTheDocument();
      expect(screen.getByText('Notification Types')).toBeInTheDocument();
    });
  });

  it('switches to security tab when clicked', async () => {
    renderWithAuth(<SettingsPage />);
    
    const securityTab = screen.getByText('🔒 Security');
    fireEvent.click(securityTab);
    
    await waitFor(() => {
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Session Management')).toBeInTheDocument();
    });
  });

  it('switches to system tab when clicked', async () => {
    renderWithAuth(<SettingsPage />);
    
    const systemTab = screen.getByText('⚙️ System');
    fireEvent.click(systemTab);
    
    await waitFor(() => {
      expect(screen.getByText('Display & Language')).toBeInTheDocument();
      expect(screen.getByText('Data & Privacy')).toBeInTheDocument();
    });
  });

  it('switches to integrations tab when clicked', async () => {
    renderWithAuth(<SettingsPage />);
    
    const integrationsTab = screen.getByText('🔗 Integrations');
    fireEvent.click(integrationsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Third-Party Integrations')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
    });
  });

  it('handles profile form changes', () => {
    renderWithAuth(<SettingsPage />);
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    expect(nameInput).toHaveValue('Updated Name');
  });

  it('handles notification settings changes', async () => {
    renderWithAuth(<SettingsPage />);
    
    const notificationsTab = screen.getByText('🔔 Notifications');
    fireEvent.click(notificationsTab);
    
    await waitFor(() => {
      const emailCheckbox = screen.getByLabelText('Email Notifications');
      fireEvent.click(emailCheckbox);
      
      expect(emailCheckbox).not.toBeChecked();
    });
  });

  it('handles security settings changes', async () => {
    renderWithAuth(<SettingsPage />);
    
    const securityTab = screen.getByText('🔒 Security');
    fireEvent.click(securityTab);
    
    await waitFor(() => {
      const twoFactorButton = screen.getByText('Enable');
      fireEvent.click(twoFactorButton);
      
      expect(screen.getByText('Disable')).toBeInTheDocument();
    });
  });

  it('shows save button with correct states', async () => {
    renderWithAuth(<SettingsPage />);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Saved!')).toBeInTheDocument();
    });
  });

  it('displays account status information', () => {
    renderWithAuth(<SettingsPage />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows role information correctly', () => {
    renderWithAuth(<SettingsPage />);
    
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Contact administrator to change role')).toBeInTheDocument();
  });
});
