import {
  useQuery,
  DefinedInitialDataOptions,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryResult,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueries,
  queryOptions,
  keepPreviousData,
} from '@tanstack/react-query';
import axios, {
  AxiosRequestConfig,
  Method,
  AxiosProgressEvent,
  AxiosResponse,
  AxiosError,
  Canceler,
  CancelTokenSource,
} from 'axios';
import { StatusCodes, ReasonPhrases, getReasonPhrase } from 'http-status-codes';
import { useEffect } from 'react';
import { useImmer } from 'use-immer';

const StorageConst = 'query-storage-';

export const baseUrl = '';

export interface ApiConfig {
  method: Method;
  url: string;
  key: string;
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
  'method' | 'url' | 'params' | 'onDownloadProgress' | 'onUploadProgress' | 'cancelToken'
>;

export type UndefinedInitialDataOptionsModified<T = any, E = any> = Omit<
  UndefinedInitialDataOptions<ResType<T>, ErrType<E>, ResType<T>, QueryKey>,
  'queryKey' | 'queryFn'
>;

export type UseMutationOptionsModified<T = any, E = any, V = void, C = unknown> = Omit<
  UseMutationOptions<ResType<T>, ErrType<E>, V, C>,
  'queryKey' | 'queryFn'
>;

export type DefinedInitialDataOptionsModified<T = any, D = any, E = any> = DefinedInitialDataOptions<
  ResType<T>,
  ErrType<E>,
  D,
  QueryKey
>;

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

function parseResponse<T = any>(response: AxiosResponse<T>): ResType<T> {
  const { data, status } = response;
  return {
    data,
    status,
    statusText: getReasonPhrase(status as StatusCodes) as ReasonPhrases,
  };
}

function parseError<E = any>(error: AxiosError<E>): ErrType<E> {
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

export function apiConstructor<T = any, D = any, E = any>(
  method: Method,
  url: string,
  params?: any,
  axiosconfig?: AxiosRequestConfigModified<D>
) {
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

export function queryOptionsConstructor<T = any, D = any, E = any>(
  method: Method,
  url: string,
  queryKey: QueryKey,
  params?: any,
  axiosconfig?: AxiosRequestConfigModified<D>,
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>
) {
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
  const [cancel, setCancel] = useImmer<CancelTokenSource[]>(queries.map(() => axios.CancelToken.source()));

  const [progress, setProgress] = useImmer<ProgressInterface[]>(
    queries.map(() => ({ upload: undefined, download: undefined }))
  );

  const [initialData, setInitialData] = useImmer<(ResType | undefined)[]>(queries.map(() => undefined));

  useEffect(() => {
    setCancel(queries.map(() => axios.CancelToken.source()));
    setProgress(queries.map(() => ({ upload: undefined, download: undefined })));
    setInitialData(queries.map(() => undefined));
  }, [queries.length, queries]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window !== 'undefined') {
      queries.map((query, i) => {
        const { queryKey } = query;
        const { store } = query.extraconfig!;
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
      const { cancelable } = query.extraconfig!;
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
      const { store } = q.extraconfig!;
      if (store) {
        if (query[i].data) {
          localStorage.setItem(StorageConst + queryKey.join('-'), JSON.stringify(query[i].data));
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

export function useQueryConstructor<T = any, D = any, E = any>(
  method: Method,
  url: string,
  queryKey: QueryKey,
  params?: any,
  extraconfig?: { progressData: true; cancelable: true; store?: boolean; paginated?: boolean },
  axiosconfig?: AxiosRequestConfigModified<D>,
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>
): UseQueryResult<ResType<T>, ErrType<E>> & { progress: ProgressInterface; cancel: Canceler };
export function useQueryConstructor<T = any, D = any, E = any>(
  method: Method,
  url: string,
  queryKey: QueryKey,
  params?: any,
  extraconfig?: { progressData: true; cancelable?: false; store?: boolean; paginated?: boolean },
  axiosconfig?: AxiosRequestConfigModified<D>,
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>
): UseQueryResult<ResType<T>, ErrType<E>> & { progress: ProgressInterface };
export function useQueryConstructor<T = any, D = any, E = any>(
  method: Method,
  url: string,
  queryKey: QueryKey,
  params?: any,
  extraconfig?: { progressData?: false; cancelable: true; store?: boolean; paginated?: boolean },
  axiosconfig?: AxiosRequestConfigModified<D>,
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>
): UseQueryResult<ResType<T>, ErrType<E>> & { cancel: Canceler };
export function useQueryConstructor<T = any, D = any, E = any>(
  method: Method,
  url: string,
  queryKey: QueryKey,
  params?: any,
  extraconfig?: { progressData: false; cancelable: false; store?: boolean; paginated?: boolean },
  axiosconfig?: AxiosRequestConfigModified<D>,
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>
): UseQueryResult<ResType<T>, ErrType<E>>;
export function useQueryConstructor<T = any, D = any, E = any>(
  method: Method,
  url: string,
  queryKey: QueryKey,
  params?: any,
  extraconfig?: QueryRequestExtraConfig,
  axiosconfig?: AxiosRequestConfigModified<D>,
  queryoptions?: UndefinedInitialDataOptionsModified<T, E>
) {
  const { progressData, cancelable, store, paginated } = extraconfig!;

  const [{ cancel, token }, setCancel] = useImmer(axios.CancelToken.source());

  const [progress, setProgress] = useImmer<ProgressInterface>({ upload: undefined, download: undefined });

  const [initialData, setInitialData] = useImmer<ResType<T> | undefined>(undefined);

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
        localStorage.setItem(StorageConst + queryKey.join('-'), JSON.stringify(query.data));
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

export function useMutationConstructor<T = any, D = any, E = any, V = void, C = unknown>(
  method: Method,
  url: string,
  params?: any,
  extraconfig?: { progressData: true; cancelable: true },
  axiosconfig?: AxiosRequestConfigModified<D>,
  mutationoptions?: UseMutationOptionsModified<T, E, V, C>
): UseMutationResult<ResType<T>, ErrType<E>, V, C> & { progress: ProgressInterface; cancel: Canceler };
export function useMutationConstructor<T = any, D = any, E = any, V = void, C = unknown>(
  method: Method,
  url: string,
  params?: any,
  extraconfig?: { progressData: true; cancelable?: false },
  axiosconfig?: AxiosRequestConfigModified<D>,
  mutationoptions?: UseMutationOptionsModified<T, E, V, C>
): UseMutationResult<ResType<T>, ErrType<E>, V, C> & { progress: ProgressInterface };
export function useMutationConstructor<T = any, D = any, E = any, V = void, C = unknown>(
  method: Method,
  url: string,
  params?: any,
  extraconfig?: { progressData?: false; cancelable: true },
  axiosconfig?: AxiosRequestConfigModified<D>,
  mutationoptions?: UseMutationOptionsModified<T, E, V, C>
): UseMutationResult<ResType<T>, ErrType<E>, V, C> & { cancel: Canceler };
export function useMutationConstructor<T = any, D = any, E = any, V = void, C = unknown>(
  method: Method,
  url: string,
  params?: any,
  extraconfig?: { progressData: false; cancelable: false },
  axiosconfig?: AxiosRequestConfigModified<D>,
  mutationoptions?: UseMutationOptionsModified<T, E, V, C>
): UseMutationResult<ResType<T>, ErrType<E>, V, C>;
export function useMutationConstructor<T = any, D = any, E = any, V = void, C = unknown>(
  method: Method,
  url: string,
  params?: any,
  extraconfig?: MutationRequestExtraConfig,
  axiosconfig?: AxiosRequestConfigModified<D>,
  mutationoptions?: UseMutationOptionsModified<T, E, V, C>
) {
  const { progressData, cancelable } = extraconfig!;

  const [{ cancel, token }, setCancel] = useImmer(axios.CancelToken.source());

  const [progress, setProgress] = useImmer<ProgressInterface>({ upload: undefined, download: undefined });

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
