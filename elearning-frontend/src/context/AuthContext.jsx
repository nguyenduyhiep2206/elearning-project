import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/auth.service';

// Trạng thái ban đầu của authentication
const initialState = {
  user: null, // Thông tin người dùng
  token: localStorage.getItem('token'), // Token xác thực từ localStorage
  isAuthenticated: false, // Trạng thái đăng nhập
  loading: true, // Trạng thái loading
  error: null, // Lỗi nếu có
};

// Các loại action cho reducer
const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START', // Bắt đầu đăng nhập
  LOGIN_SUCCESS: 'LOGIN_SUCCESS', // Đăng nhập thành công
  LOGIN_FAILURE: 'LOGIN_FAILURE', // Đăng nhập thất bại
  LOGOUT: 'LOGOUT', // Đăng xuất
  SET_LOADING: 'SET_LOADING', // Set trạng thái loading
  CLEAR_ERROR: 'CLEAR_ERROR', // Xóa lỗi
};

// Reducer để quản lý state của authentication
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
      return {
        ...state,
        loading: true, // Bắt đầu loading
        error: null, // Xóa lỗi cũ
      };
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user, // Lưu thông tin user
        token: action.payload.token, // Lưu token
        isAuthenticated: true, // Đánh dấu đã đăng nhập
        loading: false, // Kết thúc loading
        error: null, // Không có lỗi
      };
    case AuthActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null, // Xóa thông tin user
        token: null, // Xóa token
        isAuthenticated: false, // Đánh dấu chưa đăng nhập
        loading: false, // Kết thúc loading
        error: action.payload, // Lưu lỗi
      };
    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null, // Xóa thông tin user
        token: null, // Xóa token
        isAuthenticated: false, // Đánh dấu chưa đăng nhập
        loading: false, // Kết thúc loading
        error: null, // Xóa lỗi
      };
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload, // Set trạng thái loading
      };
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null, // Xóa lỗi
      };
    default:
      return state; // Trả về state hiện tại nếu không có action nào khớp
  }
};

// Tạo AuthContext
const AuthContext = createContext();

// Component AuthProvider để cung cấp context cho toàn bộ app
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kiểm tra xem user đã đăng nhập chưa khi app khởi động
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token với backend
          const response = await authService.verifyToken();
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          });
        } catch (error) {
          // Nếu có lỗi, xóa token và user khỏi localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: AuthActionTypes.LOGOUT });
        }
      } else {
        // Nếu không có token, set loading = false
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Hàm đăng nhập
  const login = async (credentials) => {
    console.log('🔐 AuthContext: Bắt đầu login process');
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      console.log('📡 AuthContext: Gọi authService.login...');
      // Gọi API đăng nhập từ backend
      const response = await authService.login(credentials);
      
      console.log('✅ AuthContext: Login thành công, response:', response);

      // Lưu token và user vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: response.data,
      });

      return response.data;
    } catch (error) {
      console.log('❌ AuthContext: Login thất bại, error:', error.message);
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: error.message || 'Đăng nhập thất bại',
      });
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      // Gọi API đăng xuất từ backend
      await authService.logout();
    } catch (error) {
      // Nếu có lỗi khi gọi API, vẫn tiếp tục đăng xuất local
      console.error('Logout API error:', error);
    } finally {
      // Xóa token và user khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Hàm xóa lỗi
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Giá trị context bao gồm state và các hàm
  const value = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

