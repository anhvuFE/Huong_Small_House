import apiClient from '../lib/http';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type ConsultationStatus = 'open' | 'closed';

export interface ConsultationMessage {
  sender: 'user' | 'admin';
  content: string;
  createdAt?: string;
}

export interface Consultation {
  id: string;
  name: string;
  email: string;
  topic: string;
  status: ConsultationStatus;
  messages: ConsultationMessage[];
  createdAt?: string;
}

interface BackendConsultation {
  _id?: string;
  name: string;
  email: string;
  topic: string;
  status: ConsultationStatus;
  messages?: ConsultationMessage[];
  createdAt?: string;
}

const toConsultation = (c: BackendConsultation): Consultation => ({
  id: c._id ?? '',
  name: c.name,
  email: c.email,
  topic: c.topic,
  status: c.status,
  messages: c.messages ?? [],
  createdAt: c.createdAt,
});

export const consultationApi = {
  // POST /consultations — optionalAuth: khách mở phiên tư vấn kèm tin nhắn đầu.
  async create(payload: { name: string; email: string; topic: string; message: string }): Promise<Consultation> {
    const res = await apiClient.post<ApiResponse<BackendConsultation>>('/consultations', payload);
    return toConsultation(res.data.data);
  },

  // GET /consultations/:id — xem 1 phiên (khách/poll).
  async get(id: string): Promise<Consultation> {
    const res = await apiClient.get<ApiResponse<BackendConsultation>>(`/consultations/${id}`);
    return toConsultation(res.data.data);
  },

  // POST /:id/messages — khách gửi thêm tin nhắn.
  async sendMessage(id: string, content: string): Promise<Consultation> {
    const res = await apiClient.post<ApiResponse<BackendConsultation>>(`/consultations/${id}/messages`, { content });
    return toConsultation(res.data.data);
  },

  // GET /consultations — admin: danh sách tất cả.
  async list(): Promise<Consultation[]> {
    const res = await apiClient.get<ApiResponse<BackendConsultation[]>>('/consultations');
    return res.data.data.map(toConsultation);
  },

  // POST /:id/admin/messages — admin trả lời.
  async adminReply(id: string, content: string): Promise<Consultation> {
    const res = await apiClient.post<ApiResponse<BackendConsultation>>(`/consultations/${id}/admin/messages`, { content });
    return toConsultation(res.data.data);
  },

  // POST /:id/close — admin đóng phiên.
  async close(id: string): Promise<Consultation> {
    const res = await apiClient.post<ApiResponse<BackendConsultation>>(`/consultations/${id}/close`);
    return toConsultation(res.data.data);
  },
};

export default consultationApi;
