import type { Decorator } from "@storybook/react";
import { CurrencyProvider } from "@/lib/currency";

export const withCurrency: Decorator = (Story) => (
  <CurrencyProvider>
    <Story />
  </CurrencyProvider>
);
