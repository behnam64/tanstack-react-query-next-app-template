'use client';
import { useGetTodosQuery } from '@/api/todos';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from './loading';
import React from 'react';

export default function Todos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const arr = [];
  const page = (searchParams.get('page') as string) || '1';
  if (page === '1') {
    arr.push(0, 1, 2, 3, 4);
  } else if (page === '2') {
    arr.push(5, 6, 7, 8, 9);
  } else {
    arr.push(10, 11, 12, 13, 14);
  }

  const todos = useGetTodosQuery({
    routeParams: { page },
    extraconfig: { progressData: true },
  });

  if (todos.isPending) {
    return <Loading />;
  } else {
    return (
      <>
        {todos.isFetching && (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'black',
              opacity: '0.4',
            }}
          />
        )}
        {arr.map((i) => (
          <div
            key={todos.data?.data[i].id}
            style={{
              marginBottom: '1rem',
              border: '1px solid grey',
              borderRadius: '1rem',
              padding: '1rem',
            }}
          >
            <p style={{ marginBottom: '0.5rem', marginTop: '0' }}>
              id: {todos.data?.data[i].id} - userId:{' '}
              {todos.data?.data[i].userId}
            </p>
            <p style={{ marginBottom: '0.5rem', marginTop: '0' }}>
              {todos.data?.data[i].title}
            </p>
            <p style={{ marginBottom: '0', marginTop: '0' }}>
              {todos.data?.data[i].completed ? 'completed' : ''}
            </p>
          </div>
        ))}
        <button onClick={() => router.push('/?page=1')}>1</button>
        <button onClick={() => router.push('/?page=2')}>2</button>
        <button onClick={() => router.push('/?page=3')}>3</button>
      </>
    );
  }
}
