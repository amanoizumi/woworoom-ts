import axios, { type AxiosResponse } from 'axios';
import { apiPath, myPath, token } from '@/scripts/config';
import type { AdminOrdersResponse } from '@/types/api';

export const getAdminOrdersApi = (): Promise<AxiosResponse<AdminOrdersResponse>> => {
  return axios.get<AdminOrdersResponse>(`${apiPath}/admin/${myPath}/orders`, token);
};

export const deleteAdminOrderApi = (
  id: string
): Promise<AxiosResponse<AdminOrdersResponse>> => {
  return axios.delete<AdminOrdersResponse>(`${apiPath}/admin/${myPath}/orders/${id}`, token);
};

export const deleteAdminAllOrdersApi = (): Promise<AxiosResponse<AdminOrdersResponse>> => {
  return axios.delete<AdminOrdersResponse>(`${apiPath}/admin/${myPath}/orders`, token);
};

export const putAdminOrderApi = (
  obj: any
): Promise<AxiosResponse<AdminOrdersResponse>> => {
  return axios.put<AdminOrdersResponse>(`${apiPath}/admin/${myPath}/orders`, obj, token);
};


