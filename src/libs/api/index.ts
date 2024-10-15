import { apiConstructor } from './apiConstructor';
import { queryOptionsConstructor } from './queryOptionsConstructor';
import {
  ApiConfig,
  AxiosRequestConfigModified,
  QueryRequestExtraConfig,
  UndefinedInitialDataOptionsModified,
} from './types';
import { useQueryConstructor } from './useQueryConstructor';

export default function apiBuilder<
  R extends { [key: string]: string } | undefined,
  Q extends { [key: string]: string } | undefined,
  T = any,
  D = any,
  E = any,
>(config?: ApiConfig<R, Q>) {
  const { method, url, queryKey } = config! || {};
  function api(config?: {
    routeParams?: R;
    queryParams?: Q;
    axiosconfig?: AxiosRequestConfigModified<D>;
  }) {
    const { routeParams, queryParams, axiosconfig } = config!;
    return apiConstructor<T, D, E>({
      method,
      url: url({ routeParams, queryParams }),
      params: queryParams,
      axiosconfig,
    });
  }
  function options(config?: {
    routeParams?: R;
    queryParams?: Q;
    axiosconfig?: AxiosRequestConfigModified<D>;
    queryoptions?: UndefinedInitialDataOptionsModified<T, E>;
  }) {
    const { routeParams, queryParams, axiosconfig, queryoptions } =
      config! || {};
    return queryOptionsConstructor<T, D, E>({
      method,
      url: url({ routeParams, queryParams }),
      queryKey: queryKey({ routeParams, queryParams }),
      params: queryParams,
      axiosconfig,
      queryoptions,
    });
  }
  function useQuery(config?: {
    routeParams?: R;
    queryParams?: Q;
    extraconfig?: QueryRequestExtraConfig;
    axiosconfig?: AxiosRequestConfigModified<D>;
    queryoptions?: UndefinedInitialDataOptionsModified<T, E>;
  }) {
    const { routeParams, queryParams, extraconfig, axiosconfig, queryoptions } =
      config! || {};
    return useQueryConstructor<T, D, E>({
      method,
      url: url({ routeParams, queryParams }),
      queryKey: queryKey({ routeParams, queryParams }),
      params: queryParams,
      extraconfig,
      axiosconfig,
      queryoptions,
    });
  }
  return { config, api, options, useQuery };
}
