import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Text: Story = {
  args: { children: "Text link", href: "#", variant: "text" },
};

export const Card: Story = {
  args: { children: "Card action", href: "#", variant: "card" },
};
