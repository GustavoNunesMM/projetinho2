import Header from "@/components/layout/Header";
import { TabProvider } from "@/contexts/TabContext";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabProvider>
      <div className="relative flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        <main className="flex-1 container mx-auto max-w-7xl px-6 pt-4 pb-6">
          {children}
        </main>
      </div>
    </TabProvider>
  );
}
