import { act } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { mockUser } from '@tests/fixtures';

const getState = () => useAuthStore.getState();

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('authStore', () => {
  it('setUser stores the profile and flips isAuthenticated', () => {
    act(() => getState().setUser(mockUser));

    expect(getState().user).toEqual(mockUser);
    expect(getState().isAuthenticated).toBe(true);
  });

  it('setUser(null) marks the session as unauthenticated', () => {
    act(() => getState().setUser(mockUser));
    act(() => getState().setUser(null));

    expect(getState().user).toBeNull();
    expect(getState().isAuthenticated).toBe(false);
  });

  it('clear resets the store', () => {
    act(() => getState().setUser(mockUser));
    act(() => getState().clear());

    expect(getState().user).toBeNull();
    expect(getState().isAuthenticated).toBe(false);
  });

  it('never holds a token (token lives in an httpOnly cookie)', () => {
    act(() => getState().setUser(mockUser));
    expect(getState()).not.toHaveProperty('token');
  });
});
