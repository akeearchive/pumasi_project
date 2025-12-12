import { User } from '../types';

const USER_KEY = 'pumasi_user';

export const authService = {
  // Check if user is logged in
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Simulate Google Login
  loginWithGoogle: async (): Promise<User> => {
    // In a real app, this would trigger Firebase Auth or OAuth flow.
    // Here we simulate a successful login with a mock user.
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: 'google_12345',
          name: '김품앗',
          email: 'pumasi_user@gmail.com',
          photoUrl: 'https://ui-avatars.com/api/?name=Kim+Pumasi&background=3182F6&color=fff'
        };
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        resolve(mockUser);
      }, 800); // Fake network delay
    });
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(USER_KEY);
  }
};
