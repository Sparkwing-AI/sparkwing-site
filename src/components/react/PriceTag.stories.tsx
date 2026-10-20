import type { Meta, StoryObj } from "@storybook/react";
import { PriceTag } from "./PriceTag";
import { withCurrency } from "@/storybook/decorators";

const meta: Meta<typeof PriceTag> = {
  title: "Components/PriceTag",
  component: PriceTag,
  decorators: [withCurrency],
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Reads `pricing-config.js` and active currency from CurrencyProvider. Hides when `showPrices` is false.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PriceTag>;

export const Studio: Story = {
  args: { productKey: "studio" },
};

export const FreeCheck: Story = {
  args: { productKey: "sparkCheck" },
};

export const IncludedHive: Story = {
  args: { productKey: "hive" },
};
