// src/lib/directus.js
import { createDirectus, rest } from '@directus/sdk';

/**
 * Khởi tạo Directus Client.
 * URL này trỏ đến Directus đang chạy trên máy của BẠN.
 * * QUAN TRỌNG: Khi làm việc nhóm, mỗi thành viên 
 * đều phải tự chạy Directus (bằng Docker)
 * để họ cũng có 'http://localhost:8055' trên máy của họ.
 * (Như Lựa chọn 1 chúng ta đã bàn).
 */
const directusClient = createDirectus('http://localhost:8055').with(rest());

export default directusClient;