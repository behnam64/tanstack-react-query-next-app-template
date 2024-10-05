'use server';

import { getDataOptions } from '@/api/data';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import Data from './data';

export async function generateStaticParams() {
  const queryClient = new QueryClient();

  const data = await queryClient.fetchQuery(getDataOptions());
  console.log(data);

  return ['1', '2'].map((id) => ({
    id,
  }));
}

export default async function List({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getDataOptions({ id: params.id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Data />
    </HydrationBoundary>
  );
}
