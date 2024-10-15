import { RefreshDataInterface } from '@/libs/api/types';

export interface ApiConfigInterface {
  queryStorageName: string;
  baseUrl: string | string[];
  token?: {
    tokenCookieName: string;
    refreshCookieName: string;
    get refreshUrl(): string;
    refreshData: RefreshDataInterface;
    refreshResponse: string;
  };
}

export const apiConfig: ApiConfigInterface = {
  queryStorageName: 'query-storage-',

  // baseurl for api requests
  baseUrl: 'https://jsonplaceholder.typicode.com',

  token: {
    // this is the tokenCookie name if this isn't empty axios will sent the cookie as authorization header
    tokenCookieName: 'token',

    // this is the refreshCookie name if this isn't empty axios will sent the cookie as authorization header
    refreshCookieName: 'refresh',

    // this is the url for sending the refresh token to the api
    get refreshUrl() {
      return `${apiConfig.baseUrl}/api/users/token/refresh/`;
    },

    // this is the schema for how to send the refresh token to the api
    refreshData: {
      type: 'data',
      field: 'refresh',
    },

    // this is the schema for how to send the refresh token to the api
    refreshResponse: 'refresh',
  },
};
