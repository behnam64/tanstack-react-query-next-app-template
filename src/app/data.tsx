'use client';

import { useGetDataQuery } from '@/api/data';

export default function Data() {
  const data = useGetDataQuery();
  console.log(data.data);

  return <></>;
}
