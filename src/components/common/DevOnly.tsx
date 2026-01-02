const DevOnly = ({ children }: any) => {
  if (process.env.NODE_ENV === "development") {
    return <>{children}</>;
  }
  return null;
};

export default DevOnly;
