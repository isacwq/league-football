import axios, { AxiosError } from 'axios';

// Interface padrão para erros devolvidos pela API do Estudo de Caso
export interface ApiErrorResponse {
  message: string;
}

// Instância base do Axios configurada com a Base URL (/api/v1)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor global para capturar e padronizar o tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Extrai o campo `message` retornado pela API ou define uma mensagem de erro genérica de rede
    const errorMessage =
      error.response?.data?.message ||
      'Não foi possível se conectar com o servidor. Tente novamente.';

    return Promise.reject(new Error(errorMessage));
  }
);
