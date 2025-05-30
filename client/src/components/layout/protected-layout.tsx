import { Navbar } from "@/components/navbar";
import SettingsPage from "@/pages/settings-page";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
        <SettingsPage />
      </main>
    </div>
  );
} 