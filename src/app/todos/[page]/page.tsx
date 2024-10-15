'use server';
import React from 'react';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getTodosQueryOptions } from '@/api/todos';
import Todos from '@/app/components/todos';

export async function generateStaticParams() {
  return [1, 2, 3].map((page) => ({
    page: page.toString(),
  }));
}

export default async function Page({
  params: { page },
}: {
  params: { page: string };
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    getTodosQueryOptions({ queryParams: { page, limit: '20' } })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Todos />
    </HydrationBoundary>
  );
}
