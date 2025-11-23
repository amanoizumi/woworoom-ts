import axios, { type AxiosResponse } from 'axios';
import { apiPath, myPath } from '@/scripts/config';
import type {
  CartsResponse,
  PostCartRequest,
  PatchCartQuantityRequest,
} from '@/types/api';

export const getFrontCartsApi = (): Promise<AxiosResponse<CartsResponse>> => {
  return axios.get<CartsResponse>(`${apiPath}/customer/${myPath}/carts`);
};

export const postFrontCartsApi = (
  obj: PostCartRequest
): Promise<AxiosResponse<CartsResponse>> => {
  return axios.post<CartsResponse>(`${apiPath}/customer/${myPath}/carts`, obj);
};

export const deleteFrontCartsApi = (id: string): Promise<AxiosResponse<CartsResponse>> => {
  return axios.delete<CartsResponse>(`${apiPath}/customer/${myPath}/carts/${id}`);
};

export const deleteFrontAllCartsApi = (): Promise<AxiosResponse<CartsResponse>> => {
  return axios.delete<CartsResponse>(`${apiPath}/customer/${myPath}/carts`);
};

export const patchFrontCartsProductNumApi = (
  obj: PatchCartQuantityRequest
): Promise<AxiosResponse<CartsResponse>> => {
  return axios.patch<CartsResponse>(`${apiPath}/customer/${myPath}/carts`, obj);
};


