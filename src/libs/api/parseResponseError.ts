import { AxiosError, AxiosResponse } from 'axios';
import { getReasonPhrase, ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ErrType, ResType } from './types';

export function parseResponse<T = any>(response: AxiosResponse<T>): ResType<T> {
  const { data, status } = response;
  return {
    data,
    status,
    statusText: getReasonPhrase(status as StatusCodes) as ReasonPhrases,
  };
}

export function parseError<E = any>(error: AxiosError<E>): ErrType<E> {
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
