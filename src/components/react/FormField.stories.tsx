import type { Meta, StoryObj } from "@storybook/react";
import { FormField, TextInput, TextArea } from "./FormField";

const meta: Meta = {
  title: "Components/FormField",
  tags: ["autodocs"],
};

export default meta;

export const Example: StoryObj = {
  render: () => (
    <form className="contact-form" style={{ maxWidth: "24rem" }}>
      <FormField id="sb-name" label="Your name">
        <TextInput id="sb-name" name="name" />
      </FormField>
      <FormField id="sb-email" label="Email" hint="We reply within two business days.">
        <TextInput id="sb-email" name="email" type="email" />
      </FormField>
      <FormField id="sb-msg" label="Message">
        <TextArea id="sb-msg" name="message" rows={3} />
      </FormField>
    </form>
  ),
};
