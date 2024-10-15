'use client';

import { apiConfig } from '@/config/api';
import {
  keepPreviousData,
  QueryKey,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, { Method } from 'axios';
import { useEffect } from 'react';
import { useImmer } from 'use-immer';
import { parseError, parseResponse } from './parseResponseError';
import {
  AxiosRequestConfigModified,
  ErrType,
  QueryRequestExtraConfig,
  ResType,
  UndefinedInitialDataOptionsModified,
} from './types';

export function useQueryConstructor<T = any, D = any, E = any>({
  method,
  url,
  queryKey,
  params,
  extraconfig,
  axiosconfig,
  queryoptions,
}: {
  method: Method;
  url: string;
  queryKey: QueryKey;
  params?: any;
  extraconfig?: QueryRequestExtraConfig;
  axiosconfig?: AxiosRequestConfigModified<D>;
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>;
}): UseQueryResult<ResType<T>, ErrType<E>> {
  const { store, paginated } = extraconfig || {};

  const [initialData, setInitialData] = useImmer<ResType<T> | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (store) {
        const text = localStorage.getItem(
          apiConfig.queryStorageName + queryKey.join('-')
        );
        if (text) {
          setInitialData(JSON.parse(text));
          return;
        }
      }
    }
    setInitialData(undefined);
  }, [queryKey, store]); // eslint-disable-line react-hooks/exhaustive-deps

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
          parseResponse<T>(resolve, response);
        })
        .catch((error) => {
          return parseError<E>(reject, error);
        });
    });
  };

  const query = useQuery({
    queryKey,
    queryFn,
    initialData,
    placeholderData: paginated ? keepPreviousData : undefined,
    ...queryoptions,
  });

  if (typeof window !== 'undefined') {
    if (store) {
      if (query.data) {
        localStorage.setItem(
          apiConfig.queryStorageName + queryKey.join('-'),
          JSON.stringify(query.data)
        );
      }
    }
  }

  return query;
}
