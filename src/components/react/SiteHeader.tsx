import { CurrencyToggle } from "./CurrencyToggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <p className="site-header__brand">Sparkwing</p>
        <nav className="site-nav" aria-label="Site">
          <CurrencyToggle />
        </nav>
      </div>
    </header>
  );
}
