import type { Meta, StoryObj } from "@storybook/react";
import { Heading, Text } from "./Typography";

const meta: Meta = {
  title: "Components/Typography",
  tags: ["autodocs"],
};

export default meta;

export const Headings: StoryObj = {
  render: () => (
    <div>
      <Heading variant="display">Display</Heading>
      <Heading variant="h1">Heading 1</Heading>
      <Heading variant="h2">Heading 2</Heading>
      <Heading variant="h3">Heading 3</Heading>
      <Heading variant="h4">Heading 4</Heading>
    </div>
  ),
};

export const Body: StoryObj = {
  render: () => (
    <div>
      <Text variant="body-lg">Body large</Text>
      <Text variant="body">Body</Text>
      <Text variant="small">Small</Text>
      <Text variant="caption">Caption</Text>
    </div>
  ),
};
