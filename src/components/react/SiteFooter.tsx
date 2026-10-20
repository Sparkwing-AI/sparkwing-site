import { shouldShowTaxNote } from "@/lib/pricing";
import { Icon } from "./Icon";
import { Link } from "./Link";

export function SiteFooter() {
  const showTax = shouldShowTaxNote();

  return (
    <footer className="site-footer">
      <p className="site-footer__regions">Australia · Philippines</p>
      {showTax ? (
        <p className="site-footer__tax" id="price-tax-note">
          Prices exclude applicable taxes.
        </p>
      ) : null}
      <div className="site-footer__contact-row">
        <span className="site-footer__contact-item">
          <Icon name="mail" size="sm" muted />
          <Link variant="text" href="mailto:info@sparkwing.com.au">
            info@sparkwing.com.au
          </Link>
        </span>
        <span className="site-footer__contact-item">
          <Icon name="globe" size="sm" muted />
          <span>sparkwing.com.au</span>
        </span>
      </div>
    </footer>
  );
}
