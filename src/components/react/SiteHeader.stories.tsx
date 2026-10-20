import type { Meta, StoryObj } from "@storybook/react";
import { SiteHeader } from "./SiteHeader";
import { withCurrency } from "@/storybook/decorators";

const meta: Meta<typeof SiteHeader> = {
  title: "Components/SiteHeader",
  component: SiteHeader,
  decorators: [withCurrency],
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof SiteHeader>;

export const Default: Story = {};
