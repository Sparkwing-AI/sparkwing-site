import { Card } from "./Card";
import { ContactCTA } from "./ContactCTA";
import { Hero } from "./Hero";
import { Link } from "./Link";
import { OfferingCard } from "./OfferingCard";
import { PriceTag } from "./PriceTag";
import { Container, Grid, Section } from "./layout";
import { Heading, Text } from "./Typography";

export function HomePage() {
  return (
    <Container>
      <Hero />

      <Section className="offerings" aria-labelledby="offerings-heading">
        <Heading as="h2" variant="h2" id="offerings-heading" className="section-heading">
          What we offer
        </Heading>
        <Text variant="body-lg" className="section-intro">
          Practical AI for growing teams. Every build runs on Hive so answers stay grounded in your
          own sources.
        </Text>

        <Grid variant="offerings">
          <OfferingCard
            id="spark-check"
            title="Spark Check"
            productKey="sparkCheck"
            body="A free AI readiness check with 10 plain-language questions. You get a short summary of where you are today and sensible next steps, with no sales pressure."
            href="mailto:info@sparkwing.com.au?subject=Book%20a%20Spark%20Check"
            linkLabel="Book your Spark Check"
          />

          <Card id="studio" featured>
            <div className="card__header">
              <div
                className="offering-card__emblem offering-card__emblem--placeholder"
                aria-hidden="true"
                title="Product emblem coming soon"
              />
              <h3 className="card__title">Sparkwing Studio</h3>
            </div>
            <PriceTag productKey="studio" />
            <p className="card__body">
              Custom AI workflows built on Hive for your team. We discover what matters, design the
              flow, build it with Receipts and Guardrails, then help you evolve it as you learn.
            </p>
            <div className="tier-block">
              <h4 className="tier-block__heading">Build tiers</h4>
              <ul className="tier-list">
                <li className="tier-list__item">
                  <strong className="tier-list__name">Starter</strong>
                  <span className="tier-list__detail">
                    One focused workflow from a proven Hive template, fixed scope, about two weeks.
                    Ideal when you want to try AI on a single repeatable task. Includes a Spark Check
                    review, handover session, and 14 days of fixes after go-live.
                  </span>
                </li>
                <li className="tier-list__item">
                  <strong className="tier-list__name">Standard</strong>
                  <span className="tier-list__detail">
                    Two or three connected workflows plus your own knowledge library on Hive. Spark
                    Check and a workflow workshop, team training, and 30 days of fixes. Delivery is
                    typically four to six weeks.
                  </span>
                </li>
                <li className="tier-list__item">
                  <strong className="tier-list__name">Custom</strong>
                  <span className="tier-list__detail">
                    Larger builds scoped after a Spark Check and discovery workshop. More users,
                    deeper integrations, and approval flows suited to a regulated enterprise.
                    Milestones and timelines agreed with you.
                  </span>
                </li>
              </ul>
            </div>
            <div className="tier-block tier-block--care">
              <h4 className="tier-block__heading">Care plans</h4>
              <p className="tier-block__intro">
                Optional monthly care after go-live: health checks, small prompt and template tweaks,
                and a plain-language monthly report. Levels match your build size.
              </p>
              <PriceTag productKey="carePlans" inline />
            </div>
            <Link variant="card" href="mailto:info@sparkwing.com.au?subject=Sparkwing%20Studio%20enquiry">
              Talk about a Studio build
            </Link>
          </Card>

          <OfferingCard
            id="hive"
            title="Sparkwing Hive"
            productKey="hive"
            body="The base platform behind every Studio build. Hive is your context library of sparks: curated knowledge your AI can draw on. Receipts show sources on every answer, and Guardrails keep usage aligned with your policies."
          />

          <OfferingCard
            id="sparkkeeping"
            title="Sparkkeeping by Sparkwing"
            productKey="sparkkeeping"
            body="Accounting software that gets the books off paper. Capture receipts and invoices, organise records, and spend less time on manual data entry."
            href="mailto:info@sparkwing.com.au?subject=Sparkkeeping%20enquiry"
            linkLabel="Ask about Sparkkeeping"
          />

          <OfferingCard
            id="academy"
            title="Sparkwing Academy"
            productKey="academy"
            body="In-house AI learning courses and workshops for your team. Practical sessions on using AI safely and well, tailored to how you already work."
            href="mailto:info@sparkwing.com.au?subject=Sparkwing%20Academy%20enquiry"
            linkLabel="Plan a workshop"
          />
        </Grid>
      </Section>

      <ContactCTA />
    </Container>
  );
}
