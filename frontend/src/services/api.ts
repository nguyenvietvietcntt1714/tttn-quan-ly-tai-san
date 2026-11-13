const API_URL = 'http://localhost:3000';

// Gắn token JWT đã lưu sau đăng nhập vào mọi request
const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (saved) {
        try {
            const token = JSON.parse(saved)?.token;
            if (token) headers.Authorization = `Bearer ${token}`;
        } catch (parseError) {
            // Dữ liệu user trong storage bị hỏng: không gắn token
            console.error('Không đọc được user đã lưu', parseError);
        }
    }
    return headers;
};

export const authApi = {
    // Đăng nhập qua backend POST /auth/login, trả { accessToken, user }
    login: async (data: { username: string; password: string }) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: data.username, password: data.password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Sai email hoặc mật khẩu');
        }
        return res.json();
    },
};

export const userApi = {
    // Lấy danh sách người dùng trong hệ thống
    getAll: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
        return res.json();
    },

    // Thêm người dùng mới (Dành cho Manager)
    create: async (data: { username: string; fullName: string; role: string; email?: string }) => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Lỗi khi thêm người dùng mới');
        }
        return res.json();
    },
};

export const assetApi = {
    // Ghép tham số lọc thành query string, bỏ giá trị rỗng
    buildQuery: (params: Record<string, string | number | undefined>) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') search.set(key, String(value));
        });
        return search.toString();
    },

    // Lấy danh sách tài sản (tìm kiếm, lọc, phân trang) - GET /assets
    getFiltered: async (params: Record<string, string | number | undefined>) => {
        const res = await fetch(`${API_URL}/assets?${assetApi.buildQuery(params)}`, {
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Không thể tải danh sách tài sản');
        return res.json();
    },

    // Xuất CSV toàn bộ kết quả đang lọc - GET /assets/export (trả blob để tải xuống kèm token)
    exportCsv: async (params: Record<string, string | number | undefined>) => {
        const res = await fetch(`${API_URL}/assets/export?${assetApi.buildQuery(params)}`, {
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Không thể xuất CSV');
        return res.blob();
    },
};

export const dashboardApi = {
    // Số liệu tổng quan cho dashboard - GET /dashboard/stats
    getStats: async () => {
        const res = await fetch(`${API_URL}/dashboard/stats`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Không thể tải số liệu tổng quan');
        return res.json();
    },
};

export const ticketApi = {
    // Lấy danh sách tất cả phiếu
    getAll: async () => {
        const res = await fetch(`${API_URL}/tickets`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách phiếu');
        return res.json();
    },

    // Tạo phiếu mới (B3, B4)
    create: async (data: { assetId: string; userId: string; type: string; note?: string }) => {
        const res = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Lỗi khi tạo phiếu');
        }
        return res.json();
    },

    // Hủy phiếu
    cancel: async (id: string) => {
        const res = await fetch(`${API_URL}/tickets/${id}/cancel`, {
            method: 'PATCH',
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Lỗi hủy phiếu');
        return res.json();
    },

    // Hoàn thành phiếu - Điều chuyển / Thu hồi (B5)
    complete: async (id: string) => {
        const res = await fetch(`${API_URL}/tickets/${id}/complete`, {
            method: 'PATCH',
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Lỗi hoàn thành phiếu');
        return res.json();
    },

    // Lấy lịch sử tài sản theo ID và tùy chọn thời gian (B6)
    getHistory: async (assetId: string, startDate?: string, endDate?: string) => {
        let url = `${API_URL}/tickets/asset-history?assetId=${assetId}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) throw new Error('Không thể tải lịch sử tài sản');
        return res.json();
    },
};
