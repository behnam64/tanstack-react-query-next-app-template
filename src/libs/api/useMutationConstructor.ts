'use client';

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosProgressEvent, Canceler, Method } from 'axios';
import { useImmer } from 'use-immer';
import { parseError, parseResponse } from './parseResponseError';
import {
  AxiosRequestConfigModified,
  ErrType,
  MutationRequestExtraConfig,
  ProgressInterface,
  ResType,
  UseMutationOptionsModified,
} from './types';

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
          parseResponse<T>(resolve, response);
        })
        .catch((error) => {
          setCancel(axios.CancelToken.source());
          return parseError<E>(reject, error);
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
