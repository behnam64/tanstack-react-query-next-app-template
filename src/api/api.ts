import { QueryKey, queryOptions } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse, Method } from 'axios';
import { getReasonPhrase, ReasonPhrases, StatusCodes } from 'http-status-codes';
import {
  ApiConfig,
  AxiosRequestConfigModified,
  ErrType,
  QueryRequestExtraConfig,
  ResType,
  UndefinedInitialDataOptionsModified,
} from './types';
import { useQueryConstructor } from './hooks';

export function parseResponse<T = any>(response: AxiosResponse<T>): ResType<T> {
  const { data, status } = response;
  return {
    data,
    status,
    statusText: getReasonPhrase(status as StatusCodes) as ReasonPhrases,
  };
}

export function parseError<E = any>(error: AxiosError<E>): ErrType<E> {
  if (error.response) {
    const { data, status } = error.response;
    return {
      data,
      status,
      statusText: getReasonPhrase(status as StatusCodes) as ReasonPhrases,
    };
  } else {
    return {
      statusText: 'Network error',
    };
  }
}

export function apiConstructor<T = any, D = any, E = any>({
  method,
  url,
  params,
  axiosconfig,
}: {
  method: Method;
  url: string;
  params?: any;
  axiosconfig?: AxiosRequestConfigModified<D>;
}) {
  return new Promise<ResType<T>>((resolve, reject) => {
    axios
      .request({
        method,
        url,
        params,
        ...axiosconfig,
      })
      .then((response) => {
        resolve(parseResponse<T>(response));
      })
      .catch((error) => {
        reject(parseError<E>(error));
      });
  });
}

export function queryOptionsConstructor<T = any, D = any, E = any>({
  method,
  url,
  queryKey,
  params,
  axiosconfig,
  queryoptions,
}: {
  method: Method;
  url: string;
  queryKey: QueryKey;
  params?: any;
  axiosconfig?: AxiosRequestConfigModified<D>;
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>;
}) {
  const queryFn = (): Promise<ResType<T>> => {
    return new Promise<ResType<T>>((resolve, reject) => {
      axios
        .request({
          method,
          url,
          params,
          ...axiosconfig,
        })
        .then((response) => {
          resolve(parseResponse<T>(response));
        })
        .catch((error) => {
          reject(parseError<E>(error));
        });
    });
  };

  const options = queryOptions({
    queryKey,
    queryFn,
    ...queryoptions,
  });

  return options;
}

export function apiBuilder<
  R extends { [key: string]: string } | undefined,
  Q extends { [key: string]: string } | undefined,
  T = any,
  D = any,
  E = any,
>(config: ApiConfig<R, Q>) {
  const { method, url, queryKey } = config;
  function api({
    routeParams,
    queryParams,
    axiosconfig,
  }: {
    routeParams?: R;
    queryParams?: Q;
    axiosconfig?: AxiosRequestConfigModified<D>;
  }) {
    return apiConstructor<T, D, E>({
      method,
      url: url(routeParams, queryParams),
      params: queryParams,
      axiosconfig,
    });
  }
  function options({
    routeParams,
    queryParams,
    axiosconfig,
    queryoptions,
  }: {
    routeParams?: R;
    queryParams?: Q;
    axiosconfig?: AxiosRequestConfigModified<D>;
    queryoptions?: UndefinedInitialDataOptionsModified<T, E>;
  }) {
    return queryOptionsConstructor<T, D, E>({
      method,
      url: url(routeParams, queryParams),
      queryKey: queryKey(routeParams, queryParams),
      params: queryParams,
      axiosconfig,
      queryoptions,
    });
  }
  function useQuery({
    routeParams,
    queryParams,
    extraconfig,
    axiosconfig,
    queryoptions,
  }: {
    routeParams?: R;
    queryParams?: Q;
    extraconfig?: QueryRequestExtraConfig;
    axiosconfig?: AxiosRequestConfigModified<D>;
    queryoptions?: UndefinedInitialDataOptionsModified<T, E>;
  }) {
    return useQueryConstructor<T, D, E>({
      method,
      url: url(routeParams, queryParams),
      queryKey: queryKey(routeParams, queryParams),
      params: queryParams,
      extraconfig,
      axiosconfig,
      queryoptions,
    });
  }
  return { config, api, options, useQuery };
}
