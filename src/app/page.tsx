'use server';
import Link from 'next/link';
import React from 'react';

export default async function Page() {
  return <Link href={'/todos/1'}>Todos Page</Link>;
}
