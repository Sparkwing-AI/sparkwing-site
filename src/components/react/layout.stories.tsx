import type { Meta, StoryObj } from "@storybook/react";
import { Container, Grid, Section } from "./layout";
import { Card } from "./Card";

const meta: Meta = {
  title: "Components/Layout",
  tags: ["autodocs"],
};

export default meta;

export const GridOfferings: StoryObj = {
  render: () => (
    <Container>
      <Section>
        <Grid variant="offerings">
          <Card><p className="card__body">Cell one</p></Card>
          <Card><p className="card__body">Cell two</p></Card>
        </Grid>
      </Section>
    </Container>
  ),
};
