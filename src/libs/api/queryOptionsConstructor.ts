import { QueryKey, queryOptions } from '@tanstack/react-query';
import axios, { Method } from 'axios';
import { parseError, parseResponse } from './parseResponseError';
import {
  AxiosRequestConfigModified,
  ResType,
  UndefinedInitialDataOptionsModified,
} from './types';

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
          parseResponse<T>(resolve, response);
        })
        .catch((error) => {
          return parseError<E>(reject, error);
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
