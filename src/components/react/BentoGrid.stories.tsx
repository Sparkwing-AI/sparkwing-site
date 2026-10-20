import type { Meta, StoryObj } from "@storybook/react";
import { OFFERINGS } from "@/lib/offerings-content";
import { withCurrency } from "@/storybook/decorators";
import { BentoGrid } from "./BentoGrid";

const meta: Meta<typeof BentoGrid> = {
  title: "Components/BentoGrid",
  component: BentoGrid,
  decorators: [withCurrency],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BentoGrid>;

export const ProductLineup: Story = {
  args: { items: OFFERINGS, labelledBy: "offerings-heading" },
  render: (args) => (
    <section className="offerings offerings--bento">
      <BentoGrid {...args} />
    </section>
  ),
};
