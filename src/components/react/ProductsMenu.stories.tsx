import type { Meta, StoryObj } from "@storybook/react";
import { ProductsMenu } from "./ProductsMenu";

const meta: Meta<typeof ProductsMenu> = {
  title: "Components/ProductsMenu",
  component: ProductsMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductsMenu>;

export const Default: Story = {
  render: () => (
    <div className="site-header" style={{ padding: "1rem 2rem" }}>
      <ProductsMenu />
    </div>
  ),
};
