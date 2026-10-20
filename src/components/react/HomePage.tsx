import { ContactCTA } from "./ContactCTA";
import { Hero } from "./Hero";
import { OfferingsSection } from "./OfferingsSection";
import { Container } from "./layout";

export function HomePage() {
  return (
    <Container>
      <Hero />
      <OfferingsSection />
      <ContactCTA />
    </Container>
  );
}
