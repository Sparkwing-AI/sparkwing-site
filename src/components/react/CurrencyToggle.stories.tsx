import type { Meta, StoryObj } from "@storybook/react";
import { CurrencyToggle } from "./CurrencyToggle";
import { withCurrency } from "@/storybook/decorators";

const meta: Meta<typeof CurrencyToggle> = {
  title: "Components/CurrencyToggle",
  component: CurrencyToggle,
  decorators: [withCurrency],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CurrencyToggle>;

export const Default: Story = {};
