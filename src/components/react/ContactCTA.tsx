import { Button } from "./Button";
import { FormField, TextArea, TextInput } from "./FormField";
import { Heading } from "./Typography";
import { Text } from "./Typography";

export type ContactCTAProps = {
  heading?: string;
  intro?: string;
  showForm?: boolean;
};

export function ContactCTA({
  heading = "Ready when you are",
  intro = "Start with a free Spark Check, or email us with questions. We work with clients in Australia and the Philippines.",
  showForm = false,
}: ContactCTAProps) {
  return (
    <section className="closing-cta" aria-labelledby="closing-heading">
      <Heading as="h2" variant="h2" id="closing-heading" className="section-heading">
        {heading}
      </Heading>
      <Text variant="body-lg" className="section-intro">{intro}</Text>
      {showForm ? (
        <form
          className="contact-form"
          action="mailto:info@sparkwing.com.au"
          method="post"
          encType="text/plain"
        >
          <FormField id="contact-name" label="Your name">
            <TextInput id="contact-name" name="name" type="text" autoComplete="name" required />
          </FormField>
          <FormField id="contact-email" label="Email" hint="We reply within two business days.">
            <TextInput
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </FormField>
          <FormField id="contact-message" label="How can we help?">
            <TextArea id="contact-message" name="body" rows={4} required />
          </FormField>
          <Button type="submit" variant="primary">Send message</Button>
        </form>
      ) : (
        <div className="hero-cta">
          <Button
            variant="primary"
            href="mailto:info@sparkwing.com.au?subject=Book%20a%20Spark%20Check"
          >
            Book a Spark Check
          </Button>
          <Button
            variant="secondary"
            href="mailto:info@sparkwing.com.au?subject=Sparkwing%20enquiry%20via%20website"
          >
            info@sparkwing.com.au
          </Button>
        </div>
      )}
    </section>
  );
}
