import {
  DefinedInitialDataOptions,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { AxiosProgressEvent, AxiosRequestConfig, Method } from 'axios';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const StorageConst = 'query-storage-';

export const baseUrl = 'https://jsonplaceholder.typicode.com';

export interface ApiConfig<
  R extends { [key: string]: string } | undefined,
  Q extends { [key: string]: string } | undefined,
> {
  method: Method;
  url: (routeParams?: R, queryParams?: Q) => string;
  key: string;
  queryKey: (routeParams?: R, queryParams?: Q) => QueryKey;
}

export interface ProgressInterface {
  upload?: AxiosProgressEvent;
  download?: AxiosProgressEvent;
}

export interface QueryRequestExtraConfig {
  progressData?: boolean;
  cancelable?: boolean;
  store?: boolean;
  paginated?: boolean;
}
export interface MutationRequestExtraConfig {
  progressData?: boolean;
  cancelable?: boolean;
}

export type AxiosRequestConfigModified<D = unknown> = Omit<
  AxiosRequestConfig<D>,
  | 'method'
  | 'url'
  | 'params'
  | 'onDownloadProgress'
  | 'onUploadProgress'
  | 'cancelToken'
>;

export type UndefinedInitialDataOptionsModified<T = any, E = any> = Omit<
  UndefinedInitialDataOptions<ResType<T>, ErrType<E>, ResType<T>, QueryKey>,
  'queryKey' | 'queryFn'
>;

export type UseMutationOptionsModified<
  T = any,
  E = any,
  V = void,
  C = unknown,
> = Omit<
  UseMutationOptions<ResType<T>, ErrType<E>, V, C>,
  'queryKey' | 'queryFn'
>;

export type DefinedInitialDataOptionsModified<
  T = any,
  D = any,
  E = any,
> = DefinedInitialDataOptions<ResType<T>, ErrType<E>, D, QueryKey>;

export interface ResType<T = any> {
  data: T;
  status: StatusCodes;
  statusText: ReasonPhrases;
}

export interface ErrType<E = any> {
  data?: E;
  status?: StatusCodes;
  statusText: ReasonPhrases | 'Network error';
}
