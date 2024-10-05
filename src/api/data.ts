import { QueryKey } from '@tanstack/react-query';
import {
  ApiConfig,
  apiConstructor,
  AxiosRequestConfigModified,
  baseUrl,
  queryOptionsConstructor,
  QueryRequestExtraConfig,
  UndefinedInitialDataOptionsModified,
  useMutationConstructor,
  useQueryConstructor,
} from './api';

export type GetDataResType = any;
export type GetDataErrType = any;

export const getDataConfig: ApiConfig = {
  method: 'post',
  url: baseUrl,
  key: 'get-data',
};

export function getDataApi(id: string) {
  return apiConstructor(getDataConfig.method, getDataConfig.url, { id });
}

export function getDataQueryKey(id?: string): QueryKey {
  return [getDataConfig.key, id];
}

export function getDataOptions(
  params?: { id?: string },
  axiosconfig?: AxiosRequestConfigModified<undefined>,
  queryoptions?: UndefinedInitialDataOptionsModified<
    GetDataResType,
    GetDataErrType
  >
) {
  return queryOptionsConstructor(
    getDataConfig.method,
    getDataConfig.url,
    getDataQueryKey(params?.id),
    params,
    axiosconfig,
    queryoptions
  );
}

export function useGetDataQuery(
  params?: { id?: string },
  extraconfig?: QueryRequestExtraConfig,
  axiosconfig?: AxiosRequestConfigModified<undefined>,
  queryoptions?: UndefinedInitialDataOptionsModified<
    GetDataResType,
    GetDataErrType
  >
) {
  return useQueryConstructor(
    getDataConfig.method,
    getDataConfig.url,
    getDataQueryKey(params?.id),
    params,
    extraconfig as any,
    axiosconfig,
    queryoptions
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
