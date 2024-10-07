import axios, { Method } from 'axios';
import { parseError, parseResponse } from './parseResponseError';
import { AxiosRequestConfigModified, ResType } from './types';

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
