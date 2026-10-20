import { CurrencyProvider } from "@/lib/currency";
import { HomePage } from "./HomePage";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function AppShell() {
  return (
    <CurrencyProvider>
      <SiteHeader />
      <main id="main">
        <HomePage />
      </main>
      <SiteFooter />
    </CurrencyProvider>
  );
}
