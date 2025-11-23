import axios, { type AxiosResponse } from 'axios';
import { apiPath, myPath } from '@/scripts/config';
import type { PostOrderRequest } from '@/types/api';

export const postFrontOrderApi = (obj: PostOrderRequest): Promise<AxiosResponse<any>> => {
  return axios.post<any>(`${apiPath}/customer/${myPath}/orders`, obj);
};


