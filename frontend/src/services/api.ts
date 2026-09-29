import type { HealthResponse } from '@/types/HealthResponse';
import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export async function healthCheck() {
    const response = await api.get<HealthResponse>('/api/health');
    return response.data;
}