import Header from "@/components/layout/Header";
import { TabProvider } from "@/contexts/TabContext";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabProvider>
      <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-x-hidden">
        <Header />
        <main className="flex-1 container mx-auto max-w-7xl px-6 pt-4 pb-6 overflow-visible">
          {children}
        </main>
        <p className="text-[10px] text-gray-500 font-medium">Amanda se me largar eu vou começar a cobrar 500 Reais por acesso s2 com retroativo</p>
      </div>
    </TabProvider>
  );
}
