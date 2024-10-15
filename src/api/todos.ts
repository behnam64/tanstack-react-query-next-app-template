import { apiConfig } from '@/config/api';
import apiBuilder from '@libs/api';

export type TodoType = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export type GetTodosResType = TodoType[];
export type GetTodosQueryParamsType = { page: string; limit: string };

export type GetTodosErrType = any;

export const {
  config: getTodosConfig,
  api: getTodosApi,
  options: getTodosQueryOptions,
  useQuery: useGetTodosQuery,
} = apiBuilder<
  undefined,
  GetTodosQueryParamsType,
  GetTodosResType,
  undefined,
  GetTodosErrType
>({
  method: 'get',
  url() {
    return `${apiConfig.baseUrl}/todos`;
  },
  key: 'get-todos',
  queryKey({ queryParams }) {
    return ['get-todos', queryParams?.page];
  },
});
