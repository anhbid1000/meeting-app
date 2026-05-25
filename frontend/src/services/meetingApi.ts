import api from './api';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MeetingItem {
  _id: string;
  title: string;
  workspaceId: { _id: string; name: string } | string;
  channelId: { _id: string; name: string; slug?: string } | string;
  hostId: { _id: string; name: string; avatar?: string } | string;
  status: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  hasAiSummary?: boolean;
}

export interface GetHistoryResponse {
  success: boolean;
  data: {
    items: MeetingItem[];
    pagination: PaginationMeta;
  };
}

const normalizeHistory = (payload: unknown, fallbackPage: number, fallbackLimit: number, query?: string) => {
  // Backend variants observed:
  // 1) { success, data: { items, pagination } }
  // 2) { success, data: { success, data: [], pagination } }
  // 3) { success, data: [] }
  const p = (payload && typeof payload === 'object' ? payload : {}) as {
    items?: MeetingItem[];
    data?: MeetingItem[];
    pagination?: Partial<PaginationMeta>;
  };

  let items: MeetingItem[] = [];
  let pagination: PaginationMeta | undefined;

  if (p?.items && Array.isArray(p.items)) {
    items = p.items;
    pagination = {
      page: p.pagination?.page ?? 1,
      limit: p.pagination?.limit ?? 20,
      total: p.pagination?.total ?? 0,
      totalPages: p.pagination?.totalPages ?? 1,
    };
  } else if (p?.data && Array.isArray(p.data)) {
    items = p.data;
    pagination = {
      page: p.pagination?.page ?? 1,
      limit: p.pagination?.limit ?? 20,
      total: p.pagination?.total ?? 0,
      totalPages: p.pagination?.totalPages ?? 1,
    };
  } else if (Array.isArray(p)) {
    items = p;
  }

  const q = String(query || '').trim().toLowerCase();
  const filtered = q
    ? items.filter((m) => String(m?.title || '').toLowerCase().includes(q))
    : items;

  // Fallback client pagination when backend does not paginate
  const page = Number(pagination?.page || fallbackPage || 1);
  const limit = Number(pagination?.limit || fallbackLimit || 20);
  const total = Number(pagination?.total || filtered.length || 0);
  const totalPages = Number(pagination?.totalPages || Math.max(1, Math.ceil(total / limit)));

  const paginatedItems = pagination
    ? filtered
    : filtered.slice((page - 1) * limit, page * limit);

  return {
    items: paginatedItems,
    pagination: { page, limit, total, totalPages },
  };
};

export const meetingApi = {
  async getMyHistory(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<GetHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.q) searchParams.append('q', params.q);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await api.get(`/meetings/my/history${qs}`);

    const normalized = normalizeHistory(
      res.data?.data,
      params?.page || 1,
      params?.limit || 20,
      params?.q
    );

    return {
      success: Boolean(res.data?.success ?? true),
      data: normalized,
    };
  },
  async getById(meetingId: string): Promise<{ success: boolean; data: MeetingItem }> {
    const res = await api.get(`/meetings/${meetingId}`);
    return res.data;
  },
  async generateSummary(meetingId: string) {
    try {
      const res = await api.post(`/meetings/${meetingId}/summary`, null, {
        timeout: 60000
      });
      return res.data;
    } catch (error) {
      console.error('Generate summary error:', error);
      throw error;
    }
  }
};
