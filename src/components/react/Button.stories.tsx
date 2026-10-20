import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost"] },
    size: { control: "select", options: ["default", "compact"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Pill buttons using Lagoon Teal primary and token focus ring.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Book a Spark Check", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Email us", variant: "secondary" },
};

export const Ghost: Story = {
  args: { children: "Learn more", variant: "ghost" },
};

export const Compact: Story = {
  args: { children: "Compact", variant: "primary", size: "compact" },
};

export const Disabled: Story = {
  args: { children: "Disabled", variant: "primary", disabled: true },
};
