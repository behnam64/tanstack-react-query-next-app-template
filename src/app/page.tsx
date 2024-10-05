'use server';

import { getDataOptions } from '@/api/data';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getDataOptions());

  return <HydrationBoundary state={dehydrate(queryClient)}></HydrationBoundary>;
}
