'use client';

import {
  keepPreviousData,
  QueryKey,
  useMutation,
  UseMutationResult,
  useQueries,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, {
  AxiosProgressEvent,
  Canceler,
  CancelTokenSource,
  Method,
} from 'axios';
import { useEffect } from 'react';
import { useImmer } from 'use-immer';
import { parseError, parseResponse } from './api';
import {
  AxiosRequestConfigModified,
  ErrType,
  MutationRequestExtraConfig,
  ProgressInterface,
  QueryRequestExtraConfig,
  ResType,
  StorageConst,
  UndefinedInitialDataOptionsModified,
  UseMutationOptionsModified,
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

export function useMutationConstructor<
  T = any,
  D = any,
  E = any,
  V = void,
  C = unknown,
>(
  method: Method,
  url: string,
  params?: any,
  extraconfig?: MutationRequestExtraConfig,
  axiosconfig?: AxiosRequestConfigModified<D>,
  mutationoptions?: UseMutationOptionsModified<T, E, V, C>
): UseMutationResult<ResType<T>, ErrType<E>, V, C> & {
  progress?: ProgressInterface;
  cancel?: Canceler;
} {
  const { progressData, cancelable } = extraconfig || {};

  const [{ cancel, token }, setCancel] = useImmer(axios.CancelToken.source());

  const [progress, setProgress] = useImmer<ProgressInterface>({
    upload: undefined,
    download: undefined,
  });

  const mutationFn = (): Promise<ResType<T>> => {
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

  const mutation = useMutation({
    mutationFn,
    ...mutationoptions,
  });

  if (progressData && cancelable) {
    return { ...mutation, progress, cancel };
  } else if (progressData && !cancelable) {
    return { ...mutation, progress };
  } else if (!progressData && cancelable) {
    return { ...mutation, cancel };
  } else {
    return mutation;
  }
}
