import { apiBuilder } from './api';
import { baseUrl } from './types';

export type TodoType = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export type GetTodosResType = TodoType[];
export type GetTodosRouteParamsType = { page: string };

export type GetTodosErrType = any;

export const {
  config: getTodosConfig,
  api: getTodosApi,
  options: getTodosQueryOptions,
  useQuery: useGetTodosQuery,
} = apiBuilder<
  GetTodosRouteParamsType,
  undefined,
  GetTodosResType,
  undefined,
  GetTodosErrType
>({
  method: 'get',
  url() {
    return `${baseUrl}/todos`;
  },
  key: 'get-todos',
  queryKey(routeParams?: GetTodosRouteParamsType) {
    return ['get-todos', routeParams?.page];
  },
});
