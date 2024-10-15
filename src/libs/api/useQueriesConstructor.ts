'use client';

import { apiConfig } from '@/config/api';
import { QueryKey, useQueries, UseQueryResult } from '@tanstack/react-query';
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

export function useQueriesConstructor(
  queries: {
    method: Method;
    url: string;
    queryKey: QueryKey;
    params?: any;
    extraconfig?: QueryRequestExtraConfig;
    axiosconfig?: AxiosRequestConfigModified;
    queryoptions?: UndefinedInitialDataOptionsModified;
  }[]
): UseQueryResult<ResType, ErrType>[] {
  const [initialData, setInitialData] = useImmer<(ResType | undefined)[]>(
    queries.map(() => undefined)
  );

  useEffect(() => {
    setInitialData(queries.map(() => undefined));
  }, [queries.length, queries]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window !== 'undefined') {
      queries.map((query, i) => {
        const { queryKey } = query;
        const { store } = query.extraconfig || {};
        if (store) {
          const text = localStorage.getItem(
            apiConfig.queryStorageName + queryKey.join('-')
          );
          if (text) {
            setInitialData((initialData) => {
              initialData[i] = JSON.parse(text);
            });
            return;
          }
        }
      });
    }
  }, [queries]); // eslint-disable-line react-hooks/exhaustive-deps

  const queryFn = () => {
    return queries.map((query) => {
      const { method, url, params, axiosconfig } = query;
      return () =>
        new Promise<ResType>((resolve, reject) => {
          axios
            .request({
              method,
              url,
              params,
              ...axiosconfig,
            })
            .then((response) => {
              parseResponse(resolve, response);
            })
            .catch((error) => {
              return parseError(reject, error);
            });
        });
    });
  };

  const query = useQueries({
    queries: queries.map((query, i) => {
      const { queryKey, queryoptions } = query;
      return {
        queryKey,
        queryFn: queryFn()[i],
        initialData: initialData[i],
        ...queryoptions,
      };
    }),
  });

  if (typeof window !== 'undefined') {
    queries.map((q, i) => {
      const { queryKey } = q;
      const { store } = q.extraconfig || {};
      if (store) {
        if (query[i].data) {
          localStorage.setItem(
            apiConfig.queryStorageName + queryKey.join('-'),
            JSON.stringify(query[i].data)
          );
        }
      }
    });
  }

  return query;
}
