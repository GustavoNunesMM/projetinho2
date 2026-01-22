import Header from "@/components/layout/Header";
import { TabProvider } from "@/contexts/TabContext";
import { useUpdater } from "@/hooks/useUpdater";
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { updateInfo } = useUpdater();
  console.log(useUpdater());
  const version = `${updateInfo ? updateInfo.version : "v-0.0.0"}`;
  return (
    <TabProvider>
      <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-x-hidden">
        <Header />
        <main className="flex-1 container mx-auto max-w-7xl px-6 pt-4 pb-6 overflow-visible">
          {children}
        </main>
        <p className="text-[10px] text-gray-500 font-medium ml-4">{version}</p>
      </div>
    </TabProvider>
  );
}
