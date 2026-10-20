import type { Meta, StoryObj } from "@storybook/react";
import { ProductEmblem } from "./ProductEmblem";

const meta: Meta<typeof ProductEmblem> = {
  title: "Components/ProductEmblem",
  component: ProductEmblem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductEmblem>;

export const Placeholder: Story = {};
