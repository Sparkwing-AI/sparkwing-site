import type { Meta, StoryObj } from "@storybook/react";
import { OfferingCard } from "./OfferingCard";
import { withCurrency } from "@/storybook/decorators";

const meta: Meta<typeof OfferingCard> = {
  title: "Components/OfferingCard",
  component: OfferingCard,
  decorators: [withCurrency],
  tags: ["autodocs"],
  render: (args) => (
    <ul className="card-grid card-grid--offerings" style={{ maxWidth: "28rem" }}>
      <OfferingCard {...args} />
    </ul>
  ),
};

export default meta;
type Story = StoryObj<typeof OfferingCard>;

export const SparkCheck: Story = {
  args: {
    title: "Spark Check",
    productKey: "sparkCheck",
    body: "Free readiness check with 10 questions.",
    href: "mailto:info@sparkwing.com.au",
    linkLabel: "Book your Spark Check",
  },
};
