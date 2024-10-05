import { QueryKey } from '@tanstack/react-query';
import {
  ApiConfig,
  apiConstructor,
  baseUrl,
  queryOptionsConstructor,
  useMutationConstructor,
  useQueryConstructor,
} from './api';

export const getDataConfig: ApiConfig = {
  method: 'post',
  url: baseUrl,
};

export function getDataApi(id: string) {
  return apiConstructor(getDataConfig.method, getDataConfig.url, { id });
}

export function getDataQueryKey(id: string): QueryKey {
  return ['get-data', id];
}

export function getDataOptions(id: string) {
  return queryOptionsConstructor(getDataConfig.method, getDataConfig.url, getDataQueryKey(id), { id });
}

export function useGetDataQuery(id: string) {
  return useQueryConstructor(
    getDataConfig.method,
    getDataConfig.url,
    getDataQueryKey(id),
    { id },
    { cancelable: true, progressData: true, store: true }
  );
}

export function useGetDataMutation(id: string) {
  return useMutationConstructor(
    getDataConfig.method,
    getDataConfig.url,
    { id },
    { cancelable: true, progressData: true }
  );
}
