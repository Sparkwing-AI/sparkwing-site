# Storybook starter

Tested together: astro 7.4.5, storybook 10.6.5, @storybook/builder-vite 10, @storybook-astro/framework 1.15.0.

    npm i -D storybook@10 @storybook/builder-vite@10 @storybook-astro/framework@1.15.0
    npx storybook dev -p 6006
    npx storybook build

`.storybook/preview.js` imports `src/styles/tokens.css` and `src/styles/components.css`. `example-components.css` is the sample used in the test, so replace it with the real component styles.
