import type { Preview } from "@storybook/react";
import "../fonts.css";
import "../tokens.css";
import "../components.css";
import "../styles.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    options: {
      storySort: {
        order: [
          "Foundations",
          ["Colours", "Typography", "Spacing", "Breakpoints", "Iconography", "Motion"],
          "Components",
          "*",
        ],
      },
    },
    docs: {
      toc: true,
    },
  },
  tags: ["autodocs"],
};

export default preview;
