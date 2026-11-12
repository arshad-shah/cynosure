import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { useColorMode } from "../../theme/use-color-mode.js";
import { ThemeToggle } from "./ThemeToggle.js";

const memory = () => {
  const data = new Map<string, string>();
  return {
    data,
    storage: { get: (k: string) => data.get(k) ?? null, set: (k: string, v: string) => void data.set(k, v) },
  };
};

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  args: { onChange: fn(), size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof ThemeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

const shared = memory();

export const SelectsAndPersists: Story = {
  tags: ["visual"],
  args: { storage: shared.storage },
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("radiogroup", { name: "Colour mode" })).toBeInTheDocument();
    await expect(canvas.getByRole("radio", { name: "System" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Dark" }));
    await expect(args.onChange).toHaveBeenCalledWith("dark");
    await expect(shared.data.get("cy-color-mode")).toBe("dark");
  },
};

export const KeyboardAndLabels: Story = {
  args: { value: "light", labels: { label: "Thème", light: "Clair", dark: "Sombre", system: "Système" } },
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("radiogroup", { name: "Thème" })).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onChange).toHaveBeenCalledWith("dark");
    await expect(canvas.getByRole("radio", { name: "Sombre" })).toBeInTheDocument();
  },
};

const pageStore = memory();

function Page() {
  const { mode } = useColorMode({ storage: pageStore.storage });
  return (
    <CynosureTheme mode={mode}>
      <span data-testid="page" data-mode={mode}>
        page
      </span>
      <ThemeToggle storage={pageStore.storage} />
    </CynosureTheme>
  );
}

export const CycleLabels: Story = {
  args: {
    variant: "cycle",
    value: "dark",
    labels: {
      light: "Hell",
      dark: "Dunkel",
      system: "System",
      cycle: (c, n) => `Modus ${c}, weiter zu ${n}`,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Modus Dunkel, weiter zu System" })).toBeVisible();
  },
};

export const OneButtonCycle: Story = {
  args: { variant: "cycle" },
  render: (args) => {
    function Cycle() {
      const [mode, setMode] = useState<"light" | "dark" | "system">("light");
      return (
        <ThemeToggle
          variant="cycle"
          value={mode}
          onChange={setMode}
          {...(args.size ? { size: args.size } : {})}
        />
      );
    }
    return <Cycle />;
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Colour mode: Light. Switch to Dark" });
    await userEvent.click(button);
    await expect(canvas.getByRole("button", { name: "Colour mode: Dark. Switch to System" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByRole("button", { name: "Colour mode: Light. Switch to Dark" })).toBeVisible();
  },
};

export const UncontrolledToggleDrivesThePage: Story = {
  render: () => <Page />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Dark" }));
    await waitFor(() => expect(canvas.getByTestId("page")).toHaveAttribute("data-mode", "dark"));
    await userEvent.click(canvas.getByRole("radio", { name: "Light" }));
    await waitFor(() => expect(canvas.getByTestId("page")).toHaveAttribute("data-mode", "light"));
  },
};

const keyed = memory();

export const OwnStorageKey: Story = {
  args: { storage: keyed.storage, storageKey: "nimaz-mode" },
  play: async ({ canvas, userEvent }) => {
    // Two products on one origin keep their own choice: the mode is saved under the key given.
    keyed.data.set("cy-color-mode", "light");
    await userEvent.click(canvas.getByRole("radio", { name: "Dark" }));
    await expect(keyed.data.get("nimaz-mode")).toBe("dark");
    await expect(keyed.data.get("cy-color-mode")).toBe("light");
  },
};

const saved = memory();
saved.data.set("site-mode", "dark");

export const ReadsItsOwnKey: Story = {
  args: { storage: saved.storage, storageKey: "site-mode" },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Dark" })).toBeChecked());
  },
};
