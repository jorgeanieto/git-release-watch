import { ReleasesDashboard } from "@/components/ReleasesDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <ErrorBoundary>
      <ReleasesDashboard />
    </ErrorBoundary>
  );
};

export default Index;
