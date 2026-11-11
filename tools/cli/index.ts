/** `cy`: Cynosure's repo CLI. Generators and the convention checker, so nobody guesses how things are made. */
import { readFileSync } from "node:fs";
import { createCLI, defineCommand, dim, log, red } from "@arshad-shah/clif";
import { ICON_CATEGORIES, type IconCategory } from "../../src/icons/types";
import { check } from "./lib/check";
import { readProgress } from "./lib/progress";
import { addComponentToken, scaffoldComponent, scaffoldIcon } from "./lib/scaffold";

const root = process.cwd();

const component = defineCommand({
  name: "component",
  description: "Scaffold a component: tsx, css, stories with play tests, README, exports, size budget",
  positionals: [{ name: "name", description: "PascalCase name", required: true }],
  args: {
    kind: {
      type: "string",
      choices: ["foundation", "composite"],
      default: "composite",
      description: "foundation may render native elements",
    },
  },
  handler: ({ args }) => {
    for (const file of scaffoldComponent(
      root,
      String(args.values.name),
      args.flags.kind as "foundation" | "composite",
    ))
      log.success(file.replace(`${root}/`, ""));
    log.info("Replace every TODO(cy), then run pnpm check && pnpm test:stories.");
  },
});

const icon = defineCommand({
  name: "icon",
  description: "Add a Facet icon from an SVG (24 grid, stroke only)",
  positionals: [{ name: "name", description: "kebab-case name", required: true }],
  args: {
    from: { type: "string", required: true, description: "path to the source SVG" },
    category: { type: "string", required: true, choices: ICON_CATEGORIES, description: "gallery category" },
  },
  handler: ({ args }) => {
    log.success(
      scaffoldIcon(
        root,
        String(args.values.name),
        readFileSync(String(args.flags.from), "utf8"),
        args.flags.category as IconCategory,
      ).replace(`${root}/`, ""),
    );
  },
});

const token = defineCommand({
  name: "token",
  description: "Add a typed component token, e.g. button.ringColor",
  positionals: [{ name: "path", description: "component.tokenName", required: true }],
  args: { doc: { type: "string", required: true, description: "what the token controls" } },
  handler: ({ args }) => {
    addComponentToken(root, String(args.values.path), String(args.flags.doc));
    log.success(`added ${args.values.path}`);
  },
});

const checkCmd = defineCommand({
  name: "check",
  description: "Run every Cynosure convention rule",
  args: { json: { type: "boolean", description: "machine-readable output" } },
  handler: ({ args }) => {
    const violations = check(root);
    if (args.flags.json) console.log(JSON.stringify(violations, null, 2));
    else for (const v of violations) console.log(`${v.file}:${v.line} ${red(v.rule)} ${dim(v.message)}`);
    if (violations.length) process.exit(1);
    if (!args.flags.json) log.success("All Cynosure conventions pass.");
  },
});

const progress = defineCommand({
  name: "progress",
  description: "Show the current task and next step from docs/PROGRESS.md",
  handler: () => {
    const { current, next } = readProgress(`${root}/docs/PROGRESS.md`);
    console.log(`Current: ${current}\nNext:    ${next}`);
  },
});

createCLI({
  name: "cy",
  version: "0.1.0",
  description: "Cynosure repo CLI",
  commands: [
    defineCommand({
      name: "new",
      description: "Generate components, icons and tokens",
      commands: [component, icon, token],
    }),
    checkCmd,
    progress,
  ],
}).run();
