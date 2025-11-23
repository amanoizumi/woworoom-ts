import axios, { type AxiosResponse } from 'axios';
import { apiPath, myPath } from '@/scripts/config';
import type { ProductsResponse } from '@/types/api';

export const getFrontProductsApi = (): Promise<AxiosResponse<ProductsResponse>> => {
  return axios.get<ProductsResponse>(`${apiPath}/customer/${myPath}/products`);
};


