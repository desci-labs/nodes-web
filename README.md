# Quickstart
First, make sure you have set up the [nodes](https://github.com/desci-labs/nodes) repository and that its `./dockerDev.sh` script is running.

Then, run `yarn start` in this repository and visit http://localhost:3000.

_Note:_ `nodes-web` by default assumes `nodes` is in a sibling directory. See details on this in the [Building](#building) section

_Note:_ If running for the first time, you may have to wait until the `dockerDev.sh` script shows `desci_nodes_backend | Server running on port 5420`.

<br>

Login with your email (or `noreply@desci.com`) and input the verification code logged in the `dockerDev.sh` output:

```
Simulating email to noreply@desci.com token: 123456
```

# Building
Run `yarn build` to build the project or `yarn start` to run the devserver.

The dependency on [`nodes`](https://github.com/desci-labs/nodes) (`desci-models` and `desci-contracts`) is managed by the [`Makefile`](./Makefile). Building this project will make sure the `nodes` repo is built as well, which may take a while the first time. The `@desci-labs/desci-models` package is linked to `node_modules` as part of the build process. This alone is not enough to actually _run_ the backend cluster; see the [nodes README.me](https://github.com/desci-labs/nodes/blob/develop/README.md) for details on doing that.

To reset the repository state, i.e. wiping dependencies, artifacts, and unlinking local packages:
```bash
make clean
```

## Configure `nodes` location
If building against a `nodes` repo that is not in a sibling directory, set the `NODES_DIR` environment variable. This can be done inline:
```bash
NODES_DIR=path/to/nodes yarn start
NODES_DIR=path/to/nodes make
```

...or by exporting the variable:
```bash
export NODES_DIR=path/to/nodes
yarn start
```

## Standalone build
To work on the frontend standalone, without depending on any local dependencies, you can use these commands:
```bash
yarn start:standalone
yarn build:standalone
```

# Bundling
This project uses create-react-app and is not ejected. Webpack config is handled by [CRACO](https://github.com/gsoft-inc/craco).

This project uses [Webpack v5](https://webpack.js.org/migrate/5/) under the hood

# UX Targets

- Every interaction should result in immediate visual feedback
- Visually communicate to user when waiting for backend call, or if an error occurred
- We want to have a real-time collaborative interface (multiplayer support) for Editor. Keep this in mind when designing state.
- We do not want to be jarring to user by moving layout unnecessarily during load and during user actions
  - _Example:_ If an image needs to load in order to make the layout correct, then the layout is not correct. There should be a container to hold the space for the image while load is occurring to prevent re-layouts
  - _Example:_ If anything "automatically" re-layouts the page, consider if you can make the layout change not happen. For example, if a header bar disappears and reappears, perhaps make it a fixed or absolute positioned element, so it doesn't re-layout the rest of the screen.
- We want every part of the application to feel familiar to the user. This is why we mimicked the Google Chrome PDF native viewer. We want the user to feel at home. We want the user to discover new features organically.
- **Limit Fine Motor Control interactions.** We do not want users to be having to pick a small hitbox. Ideally they can be sloppily interacting with the screen, fat fingering, and everything works. _For example,_ if you have a tiny icon to click, add invisible padding around it to increase the hitbox area, especially on mobile.

# React Component Structure

We Use Atomic Design

[Atomic Design Primer](https://bradfrost.com/blog/post/atomic-web-design/)

The attempt here is to avoid hard to navigate component hierarchies. When we group components by Feature, it tends to result in lots of cross-Feature references, removing the benefit of grouping by Feature.

When we group by complexity, it allows us to mentally map where a component may be based on its size. As a project grows it's harder to remember what Feature a reusable component belongs to, but it's easier to remember how complex the component is.

_Briefly:_ Keep all components flat as possible in hierarchy. Do not nest components. If a component is 1-time use, just leave it in the same file as the consuming component. If it becomes reusable later, we will move it out into its own file.

_Group by complexity into:_ atoms, molecules, organisms, screens

<br>

# Stack: React + Typescript + TailwindCSS

## [Tailwind CSS Intro](https://tailwindcss.com/docs/utility-first)

```jsx
// Turn this
const Styled = styled(div)`
cursor: pointer;
margin-right: 5px;
border-bottom: 1px solid #000;`;
<Styled />

// into this
<div className="cursor-pointer mr-5 border-black border-b" />

// plus, there's lots of premade components: https://tailwindui.com/
```

VS Code Users: [Install Tailwind Intellisense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

[Change the VSCode settings to support Tailwind Styled Components](https://www.npmjs.com/package/tailwind-styled-components) -- [How to change VSCode settings?](https://code.visualstudio.com/docs/getstarted/settings)

```
"tailwindCSS.includeLanguages": {
    "typescript": "javascript", // if you are using typescript
    "typescriptreact": "javascript"  // if you are using typescript with react
},
"editor.quickSuggestions": {
    "strings": true // forces VS Code to trigger completions when editing "string" content
},
"tailwindCSS.experimental.classRegex": [
    "tw`([^`]*)", // tw`...`
    "tw\\.[^`]+`([^`]*)`", // tw.xxx<xxx>`...`
    "tw\\(.*?\\).*?`([^`]*)" // tw(Component)<xxx>`...`
]
```

<br>

# SVG Support

Look at icons.ts to see how we import customizable SVGs (supporting stroke, fill etc)

```jsx
// usage
import { IconResearchObject } from "icons";
// ...
return <IconResearchObject fill="red" />;
```

_Note:_ If fill / stroke are not working, double check the asset is imported as SVG and that the SVG doesn't override fill / stroke inside its markup. If so, remove fill/stroke overrides inside the paths.

_Note:_ Many icons are from Nucleo icon pack, but some are custom. We attempt to standardize in `@images/icons` folder

# Aliases

We define shortcuts for importing in `tsconfig.extend.json`

This lets you do stuff like

```jsx
import MyComponent from "@components/atoms/Button";
```

instead of

```jsx
import MyComponent from "../../../components/atoms/Button";
```

_Note:_ I sometimes get a VS Code / typescript error when importing certain aliases, still investigating

# Performance

[Guide: Know how to use React memo to prevent unnecessary re-renders](https://dmitripavlutin.com/use-react-memo-wisely/)

# Bundle Analyzer

Debug if bundle is big or first loads are slow

```
yarn build
yarn analyze
```

# Deploying / Contributing

- All pushes to `develop` are pushed to [Staging Server](https://nodes-dev.desci.com/)
- Issues in staging?
  - Make sure `yarn build ; serve -s build` works locally

# react-pdf + webpack v5 trouble

record keeping in case webpack issues arise such as "require not defined" or "process not defined" in the browser console
Notes:

- https://dev.to/przpiw/react-pdf-rendering-4g7b
- https://stackoverflow.com/questions/70729090/i-cant-modify-webpack-config-in-create-react-app-to-install-react-pdf
- https://github.com/facebook/create-react-app/issues/11756#issuecomment-1014293412

# Contributing

- Make a PR or issue, or hit us up on [Discord](https://discord.gg/A5P9fgB5Cf)
- We would like to open up our task management software, let us know if interested in early access
- We will share roadmap and 2023 development targets soon
