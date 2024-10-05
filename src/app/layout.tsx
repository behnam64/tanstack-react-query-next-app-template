import type { Metadata } from 'next';
import ReactQueryProvider from './reqctQueryProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <ReactQueryProvider>
          {children}
          <ReactQueryDevtools
            initialIsOpen={false}
            position='left'
            buttonPosition='bottom-left'
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
