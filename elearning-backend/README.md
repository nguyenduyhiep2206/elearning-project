# E-Learning Web Platform Backend

Đây là mã nguồn backend cho một nền tảng E-Learning hoàn chỉnh, được xây dựng bằng **Node.js**, **Express.js**, và **PostgreSQL**. Dự án cung cấp đầy đủ các API cần thiết để quản lý người dùng, khóa học, thanh toán và nhiều tính năng khác.

## ✨ Tính năng nổi bật

* [cite_start]**Quản lý người dùng & Phân quyền**: Đăng ký, đăng nhập, và phân quyền rõ ràng cho Học viên (Student), Giáo viên (Teacher), và Quản trị viên (Admin)[cite: 1, 2].
* **Quản lý khóa học**: Tạo, chỉnh sửa, xóa và duyệt các khóa học theo danh mục. [cite_start]Bao gồm quản lý chương và bài học chi tiết[cite: 4].
* [cite_start]**Theo dõi tiến độ học tập**: Ghi nhận các bài học đã hoàn thành, làm bài tập, bài kiểm tra và cấp chứng chỉ tự động[cite: 5, 7].
* [cite_start]**Hệ thống thanh toán**: Tích hợp giỏ hàng, quản lý đơn hàng, áp dụng mã khuyến mãi và tính toán doanh thu[cite: 8, 10].
* [cite_start]**Tương tác cộng đồng**: Cho phép học viên đánh giá khóa học, tham gia thảo luận trên diễn đàn và nhắn tin với giáo viên[cite: 6, 9].

## 🛠️ Công nghệ sử dụng

* **Backend**: Node.js, Express.js
* **Cơ sở dữ liệu**: PostgreSQL
* **Xác thực**: JSON Web Tokens (JWT)

## 🚀 Bắt đầu

Để chạy dự án này trên máy cục bộ của bạn, hãy làm theo các bước dưới đây.

### Yêu cầu cài đặt

Trước khi bắt đầu, hãy chắc chắn bạn đã cài đặt các công cụ sau:

* [Node.js](https://nodejs.org/) (phiên bản LTS được khuyên dùng)
* [PostgreSQL](https://www.postgresql.org/download/)
* [Git](https://git-scm.com/)

### Hướng dẫn cài đặt & Chạy dự án

1.  **Clone repository về máy:**
    ```bash
    git clone [https://your-repository-url.git](https://your-repository-url.git)
    cd elearning-project
    ```

2.  **Cài đặt các dependencies:**
    ```bash
    npm install
    ```

3.  **Thiết lập cơ sở dữ liệu:**
    * Mở `psql` hoặc một công cụ quản lý PostgreSQL.
    * Tạo một database mới cho dự án:
        ```sql
        CREATE DATABASE ELEARN_WEB;
        ```

4.  **Cấu hình biến môi trường:**
    * Tạo một bản sao của file `.env.example` và đổi tên thành `.env`:
        ```bash
        cp .env.example .env
        ```
    * Mở file `.env` và điền các thông tin cần thiết, đặc biệt là thông tin kết nối database:
        ```env
        DB_USER=your_postgres_user
        DB_HOST=localhost
        DB_DATABASE=ELEARN_WEB
        DB_PASSWORD=your_postgres_password
        DB_PORT=5432

        JWT_SECRET=your_super_secret_key
        PORT=3000
        ```

5.  **Chạy Database Migrations (Tùy chọn, nếu có):**
    * Nếu bạn sử dụng một công cụ migration như `node-pg-migrate`, hãy chạy lệnh để tạo các bảng trong database.
        ```bash
        npm run migrate up
        ```
    * *Nếu không, bạn có thể chạy file `Script-1.sql` trực tiếp vào database `ELEARN_WEB`.*

6.  **Chạy Seeding Scripts (để có dữ liệu mẫu):**
    * [cite_start]Các script này sẽ tạo ra dữ liệu mẫu như người dùng, khóa học, v.v.[cite: 3, 6, 10, 11].
        ```bash
        npm run seed
        ```

7.  **Khởi động server:**
    ```bash
    # Chạy ở chế độ phát triển (tự động reload khi có thay đổi)
    npm run dev

    # Hoặc chạy ở chế độ production
    npm start
    ```

    Server sẽ khởi động và lắng nghe tại `http://localhost:3000`.

## ⚙️ API Endpoints

[cite_start]Hệ thống API được thiết kế theo chuẩn RESTful[cite: 13]. Tất cả các endpoints đều có tiền tố là `/api/v1`. [cite_start]Vui lòng sử dụng Postman hoặc các công cụ tương tự để kiểm thử[cite: 13].

Một vài ví dụ:
* `POST /api/v1/auth/register` - Đăng ký người dùng mới.
* `POST /api/v1/auth/login` - Đăng nhập.
* `GET /api/v1/courses` - Lấy danh sách tất cả khóa học.
* `GET /api/v1/courses/:id` - Lấy chi tiết một khóa học.
* `POST /api/v1/orders` - Tạo một đơn hàng mới (yêu cầu xác thực).

---
_Dự án này được tạo ra cho mục đích học tập và phát triển._