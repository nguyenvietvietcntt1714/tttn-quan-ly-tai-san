const API_URL = 'http://localhost:3000';

// Gắn token JWT đã lưu sau đăng nhập vào mọi request
const authHeaders = (): Record<string, string> => {
    const result: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (saved) {
        try {
            const token = JSON.parse(saved)?.token;
            if (token) result.Authorization = `Bearer ${token}`;
        } catch (parseError) {
            console.error('Không đọc được user đã lưu', parseError);
        }
    }
    return result;
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
            throw new Error(err.message || 'Sai tài khoản hoặc mật khẩu');
        }
        return res.json();
    },
};

export const userApi = {
    // Lấy danh sách người dùng trong hệ thống
    getAll: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: authHeaders() });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Không thể tải danh sách người dùng');
        }
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
            const err = await res.json().catch(() => ({}));
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
        const queryStr = assetApi.buildQuery(params);
        const url = queryStr ? `${API_URL}/assets?${queryStr}` : `${API_URL}/assets`;
        const res = await fetch(url, {
            headers: authHeaders(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Không thể tải danh sách tài sản');
        }
        return res.json();
    },

    // Lấy danh sách tài sản của chính người dùng đang đăng nhập - GET /assets/my
    getMyAssets: async () => {
        const res = await fetch(`${API_URL}/assets/my`, {
            headers: authHeaders(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Không thể tải danh sách tài sản của bạn');
        }
        return res.json();
    },

    // Lấy danh mục (nhóm, loại, cơ sở, khu vực, phòng ban) - GET /assets/catalogs
    getCatalogs: async () => {
        const res = await fetch(`${API_URL}/assets/catalogs`, {
            headers: authHeaders(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Không thể tải danh mục hệ thống');
        }
        return res.json();
    },

    // Tạo tài sản mới - POST /assets
    create: async (data: {
        assetCode: string;
        name: string;
        groupId: string;
        categoryId: number;
        facilityId: string;
        areaId: string;
        brand?: string;
        model?: string;
        serial?: string;
        purchaseValue?: number;
        notes?: string;
    }) => {
        const res = await fetch(`${API_URL}/assets`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
            throw new Error(msg || 'Không thể tạo tài sản mới');
        }
        return res.json();
    },

    // Đổi tình trạng tài sản - PATCH /assets/:id/condition
    changeCondition: async (
        id: string,
        data: { condition: 'GOOD' | 'NEEDS_INSPECTION' | 'BROKEN'; reason: string; actorId: string },
    ) => {
        const res = await fetch(`${API_URL}/assets/${id}/condition`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
            throw new Error(msg || 'Không thể cập nhật tình trạng tài sản');
        }
        return res.json();
    },

    // Ngừng theo dõi tài sản - PATCH /assets/:id/deactivate
    deactivate: async (id: string, data: { reason: string; actorId: string }) => {
        const res = await fetch(`${API_URL}/assets/${id}/deactivate`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
            throw new Error(msg || 'Không thể ngừng theo dõi tài sản');
        }
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
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Không thể tải danh sách phiếu');
        }
        return res.json();
    },

    // Tạo phiếu mới (B3, B4)
    create: async (data: {
        assetId: string;
        userId?: string;
        toAreaId?: string;
        type: string;
        note?: string;
    }) => {
        const res = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
            throw new Error(msg || 'Lỗi khi tạo phiếu');
        }
        return res.json();
    },

    // Hủy phiếu
    cancel: async (id: string) => {
        const res = await fetch(`${API_URL}/tickets/${id}/cancel`, {
            method: 'PATCH',
            headers: authHeaders(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Lỗi khi hủy phiếu');
        }
        return res.json();
    },

    // Hoàn thành phiếu - Bàn giao / Điều chuyển / Thu hồi (B5)
    complete: async (id: string) => {
        const res = await fetch(`${API_URL}/tickets/${id}/complete`, {
            method: 'PATCH',
            headers: authHeaders(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Lỗi khi xác nhận hoàn thành phiếu');
        }
        return res.json();
    },

    // Lấy lịch sử tài sản theo ID/mã và tùy chọn thời gian (B6)
    getHistory: async (assetId?: string, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (assetId && assetId.trim()) params.set('assetId', assetId.trim());
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const query = params.toString();
        const url = query
            ? `${API_URL}/tickets/asset-history?${query}`
            : `${API_URL}/tickets/asset-history`;
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Không thể tải lịch sử tài sản');
        }
        return res.json();
    },
};
