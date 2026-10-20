import type { Meta, StoryObj } from "@storybook/react";
import { OFFERINGS } from "@/lib/offerings-content";
import { withCurrency } from "@/storybook/decorators";
import { OfferingTile } from "./OfferingTile";

const meta: Meta<typeof OfferingTile> = {
  title: "Components/OfferingTile",
  component: OfferingTile,
  decorators: [withCurrency],
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof OfferingTile>;

export const StudioHero: Story = {
  args: { ...OFFERINGS[0], revealDelay: 0 },
  render: (args) => (
    <div className="offerings--bento" style={{ padding: "2rem", maxWidth: "56rem" }}>
      <OfferingTile {...args} />
    </div>
  ),
};

export const HivePanel: Story = {
  args: { ...OFFERINGS[1], revealDelay: 0 },
  render: (args) => (
    <div className="offerings--bento" style={{ padding: "2rem", maxWidth: "24rem" }}>
      <OfferingTile {...args} />
    </div>
  ),
};
