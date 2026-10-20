import type { Meta, StoryObj } from "@storybook/react";
import { ContactCTA } from "./ContactCTA";

const meta: Meta<typeof ContactCTA> = {
  title: "Components/ContactCTA",
  component: ContactCTA,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ContactCTA>;

export const Buttons: Story = { args: { showForm: false } };
export const WithForm: Story = { args: { showForm: true } };
