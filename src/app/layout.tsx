import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export const metadata: Metadata = {
  title: 'TorMaster Pro Dashboard',
  description: 'Advanced Tor instance management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-12">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
