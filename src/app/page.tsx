'use server';

import React from 'react';
import Todos from './components/todos';

export default async function Home() {
  return <Todos />;
}
