import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/auth.service';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
  error: null,
};

const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
      return { ...state, loading: true, error: null };
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AuthActionTypes.LOGIN_FAILURE:
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false, error: action.payload };
    case AuthActionTypes.LOGOUT:
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false, error: null };
    case AuthActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case AuthActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.verifyToken();
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: res.data.user, token },
          });
        } catch (error) {
          console.warn('❌ Token hết hạn, đăng xuất.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: AuthActionTypes.LOGOUT });
        }
      } else {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      const res = await authService.login(credentials);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch({ type: AuthActionTypes.LOGIN_SUCCESS, payload: res.data });
      return res.data;
    } catch (err) {
      dispatch({ type: AuthActionTypes.LOGIN_FAILURE, payload: err.message });
      throw err;
    }
  };

  const register = async (userData) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      const res = await authService.register(userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch({ type: AuthActionTypes.LOGIN_SUCCESS, payload: res.data });
      return res.data;
    } catch (err) {
      dispatch({ type: AuthActionTypes.LOGIN_FAILURE, payload: err.message });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  const loginWithGoogle = () => authService.loginWithGoogle();
  const loginWithFacebook = () => authService.loginWithFacebook();

  const clearError = () => dispatch({ type: AuthActionTypes.CLEAR_ERROR });

  const value = {
    ...state,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
