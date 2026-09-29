import type { HealthResponse } from '@/types/HealthResponse';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;



export async function healthCheck() {
    const response = await axios.get<HealthResponse>(`${API_URL}/api/health`);
    return response.data;
}