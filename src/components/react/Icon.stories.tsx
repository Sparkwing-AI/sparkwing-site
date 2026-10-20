import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Mail: Story = { args: { name: "mail" } };
export const Phone: Story = { args: { name: "phone" } };
export const Globe: Story = { args: { name: "globe" } };
export const MutedSmall: Story = { args: { name: "mail", size: "sm", muted: true } };
