'use client';

import { QueryKey, useQueries, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosProgressEvent, CancelTokenSource, Method } from 'axios';
import { useEffect } from 'react';
import { useImmer } from 'use-immer';
import { parseError, parseResponse } from './parseResponseError';
import {
  AxiosRequestConfigModified,
  ErrType,
  ProgressInterface,
  QueryRequestExtraConfig,
  ResType,
  StorageConst,
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
  const [cancel, setCancel] = useImmer<CancelTokenSource[]>(
    queries.map(() => axios.CancelToken.source())
  );

  const [progress, setProgress] = useImmer<ProgressInterface[]>(
    queries.map(() => ({ upload: undefined, download: undefined }))
  );

  const [initialData, setInitialData] = useImmer<(ResType | undefined)[]>(
    queries.map(() => undefined)
  );

  useEffect(() => {
    setCancel(queries.map(() => axios.CancelToken.source()));
    setProgress(
      queries.map(() => ({ upload: undefined, download: undefined }))
    );
    setInitialData(queries.map(() => undefined));
  }, [queries.length, queries]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window !== 'undefined') {
      queries.map((query, i) => {
        const { queryKey } = query;
        const { store } = query.extraconfig || {};
        if (store) {
          const text = localStorage.getItem(StorageConst + queryKey.join('-'));
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
    return queries.map((query, i) => {
      const { method, url, params, axiosconfig } = query;
      const { cancelable } = query.extraconfig || {};
      return () =>
        new Promise<ResType>((resolve, reject) => {
          axios
            .request({
              method,
              url,
              params,
              onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
                setProgress((progress) => {
                  progress[i].download = progressEvent;
                });
              },
              onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                setProgress((progress) => {
                  progress[i].upload = progressEvent;
                });
              },
              cancelToken: cancelable ? cancel[i].token : undefined,
              ...axiosconfig,
            })
            .then((response) => {
              setCancel((cancel) => {
                cancel[i] = axios.CancelToken.source();
              });
              resolve(parseResponse(response));
            })
            .catch((error) => {
              setCancel((cancel) => {
                cancel[i] = axios.CancelToken.source();
              });
              reject(parseError(error));
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
            StorageConst + queryKey.join('-'),
            JSON.stringify(query[i].data)
          );
        }
      }
    });
  }

  return queries.map((q, i) => {
    const { progressData, cancelable } = q.extraconfig!;
    if (progressData && cancelable) {
      return { ...query[i], progress: progress[i], cancel: cancel[i] };
    } else if (progressData && !cancelable) {
      return { ...query[i], progress: progress[i] };
    } else if (!progressData && cancelable) {
      return { ...query[i], cancel: cancel[i] };
    } else {
      return query[i];
    }
  });
}
