'use client';

import {
  keepPreviousData,
  QueryKey,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, { AxiosProgressEvent, Canceler, Method } from 'axios';
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
}): UseQueryResult<ResType<T>, ErrType<E>> & {
  progress?: ProgressInterface;
  cancel?: Canceler;
} {
  const { progressData, cancelable, store, paginated } = extraconfig || {};

  const [{ cancel, token }, setCancel] = useImmer(axios.CancelToken.source());

  const [progress, setProgress] = useImmer<ProgressInterface>({
    upload: undefined,
    download: undefined,
  });

  const [initialData, setInitialData] = useImmer<ResType<T> | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (store) {
        const text = localStorage.getItem(StorageConst + queryKey.join('-'));
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
          onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            setProgress((progress) => {
              progress.download = progressEvent;
            });
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            setProgress((progress) => {
              progress.upload = progressEvent;
            });
          },
          cancelToken: cancelable ? token : undefined,
          ...axiosconfig,
        })
        .then((response) => {
          setCancel(axios.CancelToken.source());
          resolve(parseResponse<T>(response));
        })
        .catch((error) => {
          setCancel(axios.CancelToken.source());
          reject(parseError<E>(error));
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
          StorageConst + queryKey.join('-'),
          JSON.stringify(query.data)
        );
      }
    }
  }

  if (progressData && cancelable) {
    return { ...query, progress, cancel };
  } else if (progressData && !cancelable) {
    return { ...query, progress };
  } else if (!progressData && cancelable) {
    return { ...query, cancel };
  } else {
    return query;
  }
}
