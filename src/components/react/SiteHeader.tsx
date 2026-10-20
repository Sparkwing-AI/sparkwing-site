import { CurrencyToggle } from "./CurrencyToggle";
import { ProductsMenu } from "./ProductsMenu";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="/">Sparkwing</a>
        <nav className="site-nav" aria-label="Site">
          <ProductsMenu />
          <CurrencyToggle />
        </nav>
      </div>
    </header>
  );
}
