const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[1400px] mx-auto px-6 py-8 min-h-[calc(100vh-8rem)]">
    {children}
  </div>
);
export default Container;
