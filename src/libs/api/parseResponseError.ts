import axios, { AxiosError, AxiosResponse } from 'axios';
import { getReasonPhrase, ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ResType } from './types';
import Cookies from 'js-cookie';
import { apiConfig } from '@/config/api';

export function parseResponse<T = any>(
  resolve: (value: ResType<T> | PromiseLike<ResType<T>>) => void,
  response: AxiosResponse<T>
) {
  const { data, status } = response;
  resolve({
    data,
    status,
    statusText: getReasonPhrase(status as StatusCodes) as ReasonPhrases,
  });
}

export async function parseError<E = any>(
  reject: (reason?: any) => void,
  error: AxiosError<E>
) {
  if (error.response) {
    if (apiConfig.token && error.response.status === 401) {
      const originalRequest = error.config!;
      const refreshToken = Cookies.get(apiConfig.token.refreshCookieName);
      if (refreshToken) {
        try {
          const response = await axios.post(apiConfig.token.refreshUrl, {
            refresh: refreshToken,
          });
          const newToken = response.data[apiConfig.token.refreshResponse];
          Cookies.set(apiConfig.token.tokenCookieName, newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (error: any) {
          const { data, status } = error.response;
          reject({
            data,
            status,
            statusText: getReasonPhrase(status as StatusCodes) as ReasonPhrases,
          });
        }
      }
    } else {
      const { data, status } = error.response;
      reject({
        data,
        status,
        statusText: getReasonPhrase(status as StatusCodes) as ReasonPhrases,
      });
    }
  } else {
    reject({
      statusText: 'Network error',
    });
  }
}
