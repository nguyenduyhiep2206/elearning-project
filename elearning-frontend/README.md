# E-Learning Frontend

Dự án frontend React cho nền tảng E-Learning được xây dựng với Vite, React Router v6, và Tailwind CSS.

## 🚀 Tính năng

- **Authentication**: Đăng nhập, đăng ký với Context API
- **Routing**: Điều hướng với React Router v6
- **API Integration**: Axios với interceptors cho authentication
- **UI Components**: Component library với Tailwind CSS
- **State Management**: Context API cho global state
- **Responsive Design**: Mobile-first responsive design

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Các component UI
│   ├── common/         # Component tái sử dụng
│   ├── Header.jsx      # Header component
│   └── Footer.jsx      # Footer component
├── pages/              # Các trang chính
│   ├── HomePage.jsx    # Trang chủ
│   ├── LoginPage.jsx   # Trang đăng nhập
│   ├── RegisterPage.jsx # Trang đăng ký
│   └── DashboardPage.jsx # Trang dashboard
├── context/            # Context API
│   └── AuthContext.js  # Authentication context
├── services/           # API services
│   ├── api.js         # Axios configuration
│   └── index.js       # API service exports
├── hooks/              # Custom hooks
│   └── index.js       # Custom hooks collection
├── utils/              # Utility functions
│   └── index.js       # Utility functions
└── assets/             # Static assets
```

## 🛠️ Cài đặt và chạy

### Yêu cầu
- Node.js >= 16.0.0
- npm >= 8.0.0

### Cài đặt dependencies
```bash
npm install
```

### Cấu hình môi trường
Tạo file `.env` trong thư mục root:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000/api

# App Configuration
REACT_APP_APP_NAME=E-Learning Platform
REACT_APP_VERSION=1.0.0
```

### Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build cho production
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

## 🔧 Cấu hình

### API Configuration
File `src/services/api.js` chứa cấu hình Axios:
- Base URL từ environment variable
- Request/Response interceptors
- Automatic token handling
- Error handling

### Authentication
File `src/context/AuthContext.js` quản lý:
- Login/Logout state
- Token storage
- User information
- Protected routes

### Routing
File `src/App.jsx` định nghĩa các routes:
- `/` - Trang chủ
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/dashboard` - Dashboard (protected)
- `/courses` - Danh sách khóa học
- `/categories` - Danh mục

## 📦 Dependencies chính

- **React 18**: UI library
- **React Router v6**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool và dev server

## 🎨 UI Components

### Button
```jsx
import Button from './components/common/Button';

<Button variant="primary" size="medium" loading={false}>
  Click me
</Button>
```

### Input
```jsx
import Input from './components/common/Input';

<Input 
  label="Email" 
  type="email" 
  error={errors.email}
  value={values.email}
  onChange={handleChange}
/>
```

### Card
```jsx
import Card from './components/common/Card';

<Card hover>
  <Card.Header>
    <h3>Card Title</h3>
  </Card.Header>
  <Card.Body>
    Card content
  </Card.Body>
</Card>
```

## 🔌 API Services

### User Service
```javascript
import { userService } from './services';

// Đăng nhập
const response = await userService.login(credentials);

// Lấy thông tin user
const user = await userService.getCurrentUser();
```

### Course Service
```javascript
import { courseService } from './services';

// Lấy danh sách khóa học
const courses = await courseService.getAllCourses();

// Tìm kiếm khóa học
const results = await courseService.searchCourses(query);
```

## 🎣 Custom Hooks

### useForm
```javascript
import { useForm } from './hooks';

const { values, errors, handleChange, reset } = useForm({
  email: '',
  password: ''
});
```

### useLoading
```javascript
import { useLoading } from './hooks';

const { loading, startLoading, stopLoading } = useLoading();
```

### useError
```javascript
import { useError } from './hooks';

const { error, setErrorMsg, clearError } = useError();
```

## 🚀 Deployment

### Vercel
1. Connect repository với Vercel
2. Set environment variables
3. Deploy

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview build
- `npm run lint` - Chạy ESLint

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ:
- Email: support@elearning.com
- GitHub Issues: [Tạo issue mới](https://github.com/your-repo/issues)