import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { expect, fn } from "storybook/test";
import { Button } from "../../components/Button/Button.js";
import { FileInputBase, setInputFiles } from "./FileInputBase.js";

const meta = {
  title: "Foundations/FileInputBase",
  component: FileInputBase,
  args: { "aria-label": "Attachment", name: "attachment", onFiles: fn() },
  render: (args) => (
    <form data-testid="form">
      <FileInputBase {...args} />
    </form>
  ),
} satisfies Meta<typeof FileInputBase>;
export default meta;
type Story = StoryObj<typeof meta>;

const file = (name: string, type = "text/plain") => new File(["hello"], name, { type });

export const PickingCallsOnFiles: Story = {
  args: { multiple: true, accept: ".txt,image/*" },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByLabelText("Attachment") as HTMLInputElement;
    await expect(input).toHaveAttribute("type", "file");
    await expect(input).toHaveAttribute("accept", ".txt,image/*");
    const picked = [file("a.txt"), file("b.png", "image/png")];
    await userEvent.upload(input, picked);
    await expect(args.onFiles).toHaveBeenLastCalledWith(picked);
    // Form submission of real file lists is covered by DroppedFilesReachTheForm: the test library's upload only fakes
    // the input's files property, which FormData does not read.
  },
};

export const DroppedFilesReachTheForm: Story = {
  render: (args) => {
    function Dropper() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <form data-testid="form">
          <FileInputBase {...args} ref={ref} multiple />
          <Button onClick={() => ref.current && setInputFiles(ref.current, [file("dropped.txt")])}>
            Drop one
          </Button>
        </form>
      );
    }
    return <Dropper />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Drop one" }));
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(new FormData(form).getAll("attachment").map((f) => (f as File).name)).toEqual([
      "dropped.txt",
    ]);
  },
};

export const WorksWithoutOnFiles: Story = {
  render: ({ onFiles: _onFiles, ...args }) => <FileInputBase {...args} />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText("Attachment") as HTMLInputElement;
    // Picking with no listener is fine; the input still holds the file.
    await userEvent.upload(input, file("a.txt"));
    await expect(input.files?.[0]?.name).toBe("a.txt");
  },
};

export const DisabledPicksNothing: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByLabelText("Attachment");
    await expect(input).toBeDisabled();
    await userEvent.upload(input, file("a.txt"));
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};
