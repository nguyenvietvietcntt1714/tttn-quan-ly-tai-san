import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { ticketApi, assetApi, userApi } from '../services/api';

interface TicketItem {
  id: string;
  ticketCode: string;
  assetId: string;
  type: 'HANDOVER' | 'TRANSFER' | 'RECALL' | 'DEACTIVATE';
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  reason: string;
  createdAt: string;
  confirmedAt?: string | null;
  asset?: {
    id: string;
    assetCode: string;
    name: string;
    managementStatus: string;
  } | null;
  toUser?: {
    id: string;
    username: string;
    fullName: string;
  } | null;
  fromUser?: {
    id: string;
    username: string;
    fullName: string;
  } | null;
  creator?: {
    id: string;
    username: string;
    fullName: string;
  } | null;
}

interface SelectableAsset {
  id: string;
  assetCode: string;
  name: string;
  managementStatus: 'AVAILABLE' | 'IN_USE' | 'INACTIVE';
  condition: string;
  area?: { name: string } | null;
  assignedUser?: { id: string; fullName: string; username: string } | null;
}

interface SelectableUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  email?: string;
}

const typeLabel: Record<string, string> = {
  HANDOVER: 'Bàn giao cấp phát',
  TRANSFER: 'Điều chuyển nhân sự',
  RECALL: 'Thu hồi về kho',
  DEACTIVATE: 'Ngừng theo dõi',
};

const typeBadgeStyle: Record<string, string> = {
  HANDOVER: 'bg-sky-50 text-sky-700 border-sky-200',
  TRANSFER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  RECALL: 'bg-amber-50 text-amber-700 border-amber-200',
  DEACTIVATE: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusLabel: Record<string, string> = {
  DRAFT: 'Chờ xác nhận (Draft)',
  CONFIRMED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

const statusBadgeStyle: Record<string, string> = {
  DRAFT: 'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [allAssets, setAllAssets] = useState<SelectableAsset[]>([]);
  const [allUsers, setAllUsers] = useState<SelectableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State cho tạo phiếu mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [type, setType] = useState<'HANDOVER' | 'TRANSFER' | 'RECALL'>('HANDOVER');
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [note, setNote] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Modal State cho Xác nhận hành động (Hủy / Hoàn thành) - có khóa chống bấm trùng
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    ticketId: string;
    ticketCode: string;
    actionType: 'COMPLETE' | 'CANCEL';
    title: string;
    message: string;
  }>({
    isOpen: false,
    ticketId: '',
    ticketCode: '',
    actionType: 'COMPLETE',
    title: '',
    message: '',
  });
  const [confirmProcessing, setConfirmProcessing] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [ticketsRes, assetsRes, usersRes] = await Promise.all([
        ticketApi.getAll(),
        assetApi.getFiltered({ page: 1, limit: 500 }),
        userApi.getAll(),
      ]);
      setTickets(Array.isArray(ticketsRes) ? ticketsRes : []);
      setAllAssets(Array.isArray(assetsRes?.items) ? assetsRes.items : []);
      setAllUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : 'Không thể tải dữ liệu phiếu nghiệp vụ',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Hỗ trợ mở nhanh modal tạo phiếu từ nút trên Dashboard (?create=HANDOVER hoặc ?create=RECALL)
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'HANDOVER' || createParam === 'RECALL' || createParam === 'TRANSFER') {
      setType(createParam);
      setIsCreateModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Tập hợp ID các tài sản đang có phiếu DRAFT để không cho tạo trùng
  const draftAssetIds = new Set(
    tickets.filter((t) => t.status === 'DRAFT').map((t) => t.assetId),
  );

  // Lọc danh sách tài sản hợp lệ theo loại nghiệp vụ đang chọn
  const eligibleAssets = allAssets.filter((a) => {
    if (draftAssetIds.has(a.id)) return false;
    if (type === 'HANDOVER' && a.managementStatus !== 'AVAILABLE') return false;
    if ((type === 'TRANSFER' || type === 'RECALL') && a.managementStatus !== 'IN_USE') {
      return false;
    }
    if (assetSearch.trim()) {
      const q = assetSearch.trim().toLowerCase();
      return (
        a.assetCode.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.assignedUser?.fullName?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const selectedAssetObj = allAssets.find((a) => a.id === selectedAssetId) || null;

  // Lọc danh sách người nhận hợp lệ (nếu điều chuyển thì loại trừ người đang giữ hiện tại)
  const eligibleUsers = allUsers.filter((u) => {
    if (type === 'TRANSFER' && selectedAssetObj?.assignedUser?.id === u.id) {
      return false;
    }
    return true;
  });

  // Tự động chọn tài sản và người nhận đầu tiên hợp lệ khi mở modal hoặc đổi loại phiếu
  useEffect(() => {
    if (!isCreateModalOpen) return;
    if (eligibleAssets.length > 0) {
      const stillValid = eligibleAssets.some((a) => a.id === selectedAssetId);
      if (!stillValid) {
        setSelectedAssetId(eligibleAssets[0].id);
      }
    } else {
      setSelectedAssetId('');
    }
  }, [isCreateModalOpen, type, assetSearch, eligibleAssets.length]);

  useEffect(() => {
    if (!isCreateModalOpen) return;
    if (type === 'RECALL') {
      setSelectedUserId('');
      return;
    }
    if (eligibleUsers.length > 0) {
      const stillValid = eligibleUsers.some((u) => u.id === selectedUserId);
      if (!stillValid) {
        // Ưu tiên chọn nhân sự role USER trước
        const firstNormalUser = eligibleUsers.find((u) => u.role === 'USER') ?? eligibleUsers[0];
        setSelectedUserId(firstNormalUser.id);
      }
    } else {
      setSelectedUserId('');
    }
  }, [isCreateModalOpen, type, selectedAssetId, eligibleUsers.length]);

  const openCreateModal = (initialType: 'HANDOVER' | 'TRANSFER' | 'RECALL' = 'HANDOVER') => {
    setCreateError('');
    setAssetSearch('');
    setNote('');
    setType(initialType);
    setIsCreateModalOpen(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createSubmitting) return;
    setCreateError('');

    if (!selectedAssetId) {
      setCreateError('Vui lòng chọn một tài sản từ danh sách.');
      return;
    }
    if ((type === 'HANDOVER' || type === 'TRANSFER') && !selectedUserId) {
      setCreateError('Vui lòng chọn nhân sự nhận tài sản.');
      return;
    }

    setCreateSubmitting(true);
    try {
      await ticketApi.create({
        assetId: selectedAssetId,
        userId: type === 'RECALL' ? undefined : selectedUserId,
        type,
        note: note.trim() || undefined,
      });
      setIsCreateModalOpen(false);
      setNote('');
      setFeedback({
        type: 'success',
        message: 'Đã tạo phiếu nghiệp vụ mới ở trạng thái Chờ xác nhận (DRAFT).',
      });
      await fetchAllData();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setCreateError(errorObj.message || 'Lỗi khi tạo phiếu');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenCompleteModal = (t: TicketItem) => {
    if (t.status !== 'DRAFT') return;
    setConfirmModal({
      isOpen: true,
      ticketId: t.id,
      ticketCode: t.ticketCode,
      actionType: 'COMPLETE',
      title: 'Xác Nhận Hoàn Thành Phiếu',
      message: `Xác nhận hoàn thành phiếu [${t.ticketCode}] cho tài sản "${t.asset?.assetCode ?? ''} - ${t.asset?.name ?? ''}"? Trạng thái tài sản sẽ được chuyển sang ${
        t.type === 'RECALL' ? 'Sẵn sàng (AVAILABLE)' : 'Đang sử dụng (IN_USE)'
      }.`,
    });
  };

  const handleOpenCancelModal = (t: TicketItem) => {
    if (t.status !== 'DRAFT') return;
    setConfirmModal({
      isOpen: true,
      ticketId: t.id,
      ticketCode: t.ticketCode,
      actionType: 'CANCEL',
      title: 'Xác Nhận Hủy Phiếu',
      message: `Bạn có chắc chắn muốn hủy bỏ phiếu [${t.ticketCode}]? Phiếu đã hủy sẽ bị khóa và không thể xác nhận lại.`,
    });
  };

  const handleExecuteConfirm = async () => {
    if (confirmProcessing || !confirmModal.ticketId) return;
    setConfirmProcessing(true);
    setFeedback(null);
    try {
      if (confirmModal.actionType === 'COMPLETE') {
        await ticketApi.complete(confirmModal.ticketId);
        setFeedback({
          type: 'success',
          message: `Đã xác nhận hoàn thành phiếu ${confirmModal.ticketCode} và cập nhật trạng thái tài sản thành công!`,
        });
      } else {
        await ticketApi.cancel(confirmModal.ticketId);
        setFeedback({
          type: 'success',
          message: `Đã hủy phiếu ${confirmModal.ticketCode}.`,
        });
      }
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      await fetchAllData();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setFeedback({
        type: 'error',
        message: errorObj.message || 'Không thể thực hiện thao tác trên phiếu này.',
      });
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      await fetchAllData();
    } finally {
      setConfirmProcessing(false);
    }
  };

  // Lọc dữ liệu theo từ khóa và trạng thái
  const filteredTickets = tickets.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      t.ticketCode?.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      (t.asset?.assetCode?.toLowerCase().includes(q) ?? false) ||
      (t.asset?.name?.toLowerCase().includes(q) ?? false) ||
      (t.toUser?.fullName?.toLowerCase().includes(q) ?? false) ||
      (t.fromUser?.fullName?.toLowerCase().includes(q) ?? false);
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Tiêu đề & Nút hành động nhanh */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-sky-600" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Quản Lý Phiếu Nghiệp Vụ
            </h1>
            <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full font-semibold">
              Bàn giao • Điều chuyển • Thu hồi
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Lập phiếu bằng danh sách chọn trực quan, kiểm soát chặt chẽ trạng thái tài sản và chống xác nhận trùng lặp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openCreateModal('HANDOVER')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phiếu Bàn Giao</span>
          </button>
          <button
            onClick={() => openCreateModal('RECALL')}
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phiếu Thu Hồi</span>
          </button>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thông báo kết quả thao tác */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      {pageError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {/* 4 Thẻ thống kê mini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tổng Số Phiếu
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1.5">{tickets.length}</p>
        </div>
        <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Đang Chờ Xử Lý (Draft)
          </p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1.5">
            {tickets.filter((t) => t.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Đã Xác Nhận (Confirmed)
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1.5">
            {tickets.filter((t) => t.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Đã Hủy (Cancelled)
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1.5">
            {tickets.filter((t) => t.status === 'CANCELLED').length}
          </p>
        </div>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã phiếu, mã tài sản, tên thiết bị, người nhận..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-sky-600"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">Chờ xác nhận (Draft)</option>
            <option value="CONFIRMED">Đã hoàn thành (Confirmed)</option>
            <option value="CANCELLED">Đã hủy (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách phiếu */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Danh Sách Phiếu Nghiệp Vụ</h3>
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredTickets.length} / {tickets.length} phiếu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Mã Phiếu / Ngày Lập</th>
                <th className="px-6 py-3.5 font-semibold">Tài Sản</th>
                <th className="px-6 py-3.5 font-semibold">Loại Nghiệp Vụ</th>
                <th className="px-6 py-3.5 font-semibold">Nhân Sự Liên Quan</th>
                <th className="px-6 py-3.5 font-semibold">Trạng Thái</th>
                <th className="px-6 py-3.5 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-xs text-sky-700 font-bold">
                      {t.ticketCode || t.id.slice(0, 8)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(t.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {t.asset?.name ?? 'Thiết bị'}
                    </div>
                    <div className="font-mono text-xs text-slate-500 mt-0.5">
                      Mã: <strong className="text-slate-700">{t.asset?.assetCode ?? t.assetId}</strong>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                        typeBadgeStyle[t.type] ?? 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {typeLabel[t.type] ?? t.type}
                    </span>
                    {t.reason && (
                      <p className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={t.reason}>
                        {t.reason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {t.type === 'HANDOVER' && (
                      <div>
                        <span className="text-slate-400">Người nhận: </span>
                        <strong className="text-slate-800">
                          {t.toUser?.fullName ?? '—'}
                        </strong>
                      </div>
                    )}
                    {t.type === 'TRANSFER' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-600">{t.fromUser?.fullName ?? 'Kho'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                        <strong className="text-slate-900">{t.toUser?.fullName ?? '—'}</strong>
                      </div>
                    )}
                    {t.type === 'RECALL' && (
                      <div>
                        <span className="text-slate-400">Thu hồi từ: </span>
                        <strong className="text-slate-800">
                          {t.fromUser?.fullName ?? 'Nhân sự'}
                        </strong>
                      </div>
                    )}
                    {t.type === 'DEACTIVATE' && (
                      <span className="text-slate-500">Ngừng theo dõi tại kho</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        statusBadgeStyle[t.status] ?? ''
                      }`}
                    >
                      {statusLabel[t.status] ?? t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
                    {t.status === 'DRAFT' ? (
                      <>
                        <button
                          onClick={() => handleOpenCompleteModal(t)}
                          disabled={confirmProcessing}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Xác nhận
                        </button>
                        <button
                          onClick={() => handleOpenCancelModal(t)}
                          disabled={confirmProcessing}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Hủy
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400 font-medium italic">Đã khóa</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && !loading && (
          <div className="py-14 text-center space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-800">
              Không có phiếu nghiệp vụ nào khớp bộ lọc
            </p>
            <button
              onClick={() => openCreateModal('HANDOVER')}
              className="mt-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              + Lập Phiếu Mới Ngay
            </button>
          </div>
        )}
      </div>

      {/* Modal Tạo Phiếu Mới — Chọn trực tiếp Tài sản và Người nhận */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Lập Phiếu Nghiệp Vụ Mới</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn loại phiếu, chọn thiết bị và người nhận từ danh sách có sẵn
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-bold"
              >
                &times;
              </button>
            </div>

            {createError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              {/* 1. Chọn loại nghiệp vụ */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  1. Loại Nghiệp Vụ *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        val: 'HANDOVER',
                        title: 'Bàn giao (Cấp phát)',
                        desc: 'Từ kho -> Nhân sự',
                      },
                      {
                        val: 'TRANSFER',
                        title: 'Điều chuyển',
                        desc: 'Nhân sự A -> Nhân sự B',
                      },
                      {
                        val: 'RECALL',
                        title: 'Thu hồi về kho',
                        desc: 'Nhân sự -> Về kho',
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setType(opt.val)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        type === opt.val
                          ? 'bg-sky-50 border-sky-600 text-sky-900 ring-2 ring-sky-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chọn Tài sản từ danh sách (có ô lọc nhanh) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase">
                    2. Chọn Tài Sản ({eligibleAssets.length} tài sản khả dụng) *
                  </label>
                  <span className="text-[11px] text-sky-700 font-medium">
                    {type === 'HANDOVER'
                      ? 'Đang lọc tài sản Sẵn sàng (AVAILABLE)'
                      : 'Đang lọc tài sản Đang sử dụng (IN_USE)'}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Gõ để lọc nhanh theo mã AST-..., tên laptop, màn hình..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-600 outline-none"
                  />
                </div>

                {eligibleAssets.length === 0 ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    Không có tài sản nào phù hợp để lập phiếu {typeLabel[type]} (hoặc tài sản đang có phiếu DRAFT chờ duyệt).
                  </div>
                ) : (
                  <select
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  >
                    {eligibleAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        [{a.assetCode}] {a.name}
                        {a.assignedUser
                          ? ` — Đang giữ: ${a.assignedUser.fullName}`
                          : a.area
                            ? ` — Vị trí: ${a.area.name}`
                            : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 3. Chọn Người nhận (nếu là Bàn giao hoặc Điều chuyển) */}
              {type !== 'RECALL' ? (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1.5">
                    3. Chọn Nhân Sự Nhận Tài Sản *
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  >
                    {eligibleUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} (@{u.username}) — {u.role === 'MANAGER' ? 'Quản lý' : 'Nhân sự'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 space-y-1">
                  <p className="font-bold text-xs">Thông tin thu hồi tài sản:</p>
                  <p className="text-xs text-sky-800">
                    Tài sản{' '}
                    <strong>
                      {selectedAssetObj
                        ? `[${selectedAssetObj.assetCode}] ${selectedAssetObj.name}`
                        : ''}
                    </strong>{' '}
                    sẽ được thu hồi từ{' '}
                    <strong>{selectedAssetObj?.assignedUser?.fullName ?? 'người đang giữ'}</strong>{' '}
                    và chuyển trạng thái về <strong>Sẵn sàng (AVAILABLE)</strong> khi xác nhận phiếu.
                  </p>
                </div>
              )}

              {/* 4. Ghi chú / Lý do */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  4. Lý Do / Ghi Chú Nghiệp Vụ
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Nhập lý do cấp phát, điều chuyển hoặc thu hồi thiết bị..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-600 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting || eligibleAssets.length === 0}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {createSubmitting ? 'Đang tạo phiếu...' : 'Tạo Phiếu Nghiệp Vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hộp Thoại Xác Nhận (Confirm Dialog) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl text-center">
            <div
              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold ${
                confirmModal.actionType === 'COMPLETE'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {confirmModal.actionType === 'COMPLETE' ? '✓' : '⚠️'}
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">{confirmModal.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={confirmProcessing}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={confirmProcessing}
                onClick={handleExecuteConfirm}
                className={`flex-1 py-2.5 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 ${
                  confirmModal.actionType === 'COMPLETE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmProcessing ? 'Đang xử lý...' : 'Xác Nhận Thực Hiện'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
