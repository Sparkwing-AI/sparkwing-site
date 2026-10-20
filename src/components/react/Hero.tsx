import { Button } from "./Button";
import { Heading } from "./Typography";
import { Text } from "./Typography";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="brand-heading">
      <div className="hero-logo-stage">
        <div className="hero-sparks" aria-hidden="true">
          <svg className="spark spark--star spark--1" viewBox="0 0 32 32" focusable="false">
            <path d="M16 1.5 18.8 12.2 29.5 16 18.8 19.8 16 30.5 13.2 19.8 2.5 16 13.2 12.2Z" />
          </svg>
          <span className="spark spark--dot spark--2" />
          <svg className="spark spark--star spark--3" viewBox="0 0 32 32" focusable="false">
            <path d="M16 1.5 18.8 12.2 29.5 16 18.8 19.8 16 30.5 13.2 19.8 2.5 16 13.2 12.2Z" />
          </svg>
          <span className="spark spark--dot spark--4" />
        </div>
        <img
          className="hero-logo"
          src="/assets/sparkwing-logo-mark-transparent.png"
          width={720}
          height={720}
          alt=""
          decoding="async"
        />
      </div>
      <Heading as="h1" variant="h1" id="brand-heading" className="brand">
        Sparkwing
      </Heading>
      <p className="tagline">Take flight with AI you can trust.</p>
      <Text variant="body-lg" className="offer">
        Custom AI and in-house AI learning courses that give your team hours back, and accounting
        software that gets the books off paper.
      </Text>
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
          Email us
        </Button>
      </div>
    </section>
  );
}
