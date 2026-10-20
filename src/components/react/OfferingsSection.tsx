import { OFFERINGS } from "@/lib/offerings-content";
import { BentoGrid } from "./BentoGrid";
import { Heading, Text } from "./Typography";

export function OfferingsSection() {
  return (
    <section className="offerings offerings--bento" aria-labelledby="offerings-heading">
      <div className="offerings__intro">
        <Heading as="h2" variant="h2" id="offerings-heading" className="section-heading">
          What we offer
        </Heading>
        <Text variant="body-lg" className="section-intro">
          Practical AI for growing teams. Every build runs on Hive so answers stay grounded in your
          own sources.
        </Text>
      </div>
      <BentoGrid items={OFFERINGS} labelledBy="offerings-heading" />
    </section>
  );
}
