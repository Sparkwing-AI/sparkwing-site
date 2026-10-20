import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  render: (args) => (
    <ul className="card-grid" style={{ maxWidth: "24rem" }}>
      <Card {...args}>
        <h3 className="card__title">Card title</h3>
        <p className="card__body">Card body copy.</p>
      </Card>
    </ul>
  ),
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const Featured: Story = { args: { featured: true } };
