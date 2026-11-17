import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { NumberField } from "../NumberField/NumberField.js";
import { TagInput } from "../TagInput/TagInput.js";
import { TextArea } from "../TextArea/TextArea.js";
import { TextField } from "../TextField/TextField.js";
import { Form } from "./Form.js";

const meta = {
  title: "Components/Structure/Form",
  component: Form,
  args: { label: "Unlock the document", onSubmit: fn(), gap: "4" },
  argTypes: {
    gap: { control: "select", options: ["0", "1", "2", "3", "4", "5", "6", "7", "8"] },
    label: { control: "text" },
    noValidate: { control: "boolean" },
  },
  render: (args) => (
    <Form {...args}>
      <TextField label="Password" name="password" type="password" required />
      <Button type="submit">Unlock</Button>
    </Form>
  ),
} satisfies Meta<typeof Form>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The values a submit reported, as a plain object. */
const sent = (spy: unknown) => {
  const calls = (spy as ReturnType<typeof fn>).mock.calls;
  const values = (calls.at(-1) as [FormData])[0];
  return Object.fromEntries(values.entries());
};

export const EnterSubmitsTheValues: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("form", { name: "Unlock the document" })).toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText("Password"), "hunter2{Enter}");
    // Once, with the form's values, and the page stays where it is.
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(sent(args.onSubmit)).toEqual({ password: "hunter2" });
    await expect(window.location.href).not.toContain("password=");
  },
};

export const TheSubmitButtonSubmitsToo: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Password"), "x");
    await userEvent.click(canvas.getByRole("button", { name: "Unlock" }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(sent(args.onSubmit)).toEqual({ password: "x" });
  },
};

export const InvalidFieldsBlockTheSubmit: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByLabelText("Password");
    await userEvent.type(field, "{Enter}");
    // A required field left empty: the browser's validation stops it, and focus stays on the field.
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(field).toHaveFocus();
    await expect((field as HTMLInputElement).validity.valueMissing).toBe(true);
  },
};

export const NoValidateSubmitsAnyway: Story = {
  args: { noValidate: true },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Password"), "{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

/** Two fields and no submit button: a browser would not submit on Enter; Form does. */
export const EnterSubmitsAGroupWithoutAButton: Story = {
  args: { label: "Verify the signature" },
  render: (args) => (
    <Form {...args}>
      <TextField label="Key id" name="kid" />
      <TextField label="Public key" name="key" />
      <TextArea label="Notes" name="notes" />
    </Form>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Key id"), "k1");
    await userEvent.type(canvas.getByLabelText("Public key"), "abc{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(sent(args.onSubmit)).toEqual({ kid: "k1", key: "abc", notes: "" });
    // Enter in a text area is a new line, not a submit.
    await userEvent.type(canvas.getByLabelText("Notes"), "one{Enter}two");
    await expect(canvas.getByLabelText("Notes")).toHaveValue("one\ntwo");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const FieldsThatUseEnterKeepIt: Story = {
  args: { label: "Tags" },
  render: (args) => (
    <Form {...args}>
      <TagInput label="Labels" name="labels" />
      <TextField label="Title" name="title" />
    </Form>
  ),
  play: async ({ args, canvas, userEvent }) => {
    // TagInput takes Enter to add a tag: the form does not submit.
    await userEvent.type(canvas.getByLabelText("Labels"), "urgent{Enter}");
    await expect(canvas.getByText("urgent")).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.type(canvas.getByLabelText("Title"), "Fix{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const EnterWhileComposingDoesNotSubmit: Story = {
  args: { label: "Search" },
  render: (args) => (
    <Form {...args}>
      <TextField label="Word" name="word" />
      <TextField label="Other" name="other" />
    </Form>
  ),
  play: async ({ args, canvas }) => {
    const field = canvas.getByLabelText("Word");
    field.focus();
    // An IME's Enter confirms the composition, never the form.
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** A field that commits its text on Enter (NumberField) submits the committed value, not the one before it. */
export const EnterSubmitsTheValueAFieldJustCommitted: Story = {
  args: { label: "Copies" },
  render: (args) => (
    <Form {...args}>
      <NumberField label="Count" name="count" defaultValue={1} />
      <TextField label="Note" name="note" />
    </Form>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("spinbutton", { name: "Count" });
    await userEvent.clear(field);
    await userEvent.type(field, "42{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(sent(args.onSubmit)).toEqual({ count: "42", note: "" });
  },
};

export const WithoutOnSubmitItIsAPlainForm: Story = {
  render: () => (
    <Form data-testid="form">
      <TextField label="Name" name="name" defaultValue="Ada" />
      <Button type="reset">Reset</Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    // No name: no form landmark. Reset still restores the fields.
    await expect(canvas.queryByRole("form")).toBeNull();
    const field = canvas.getByLabelText("Name");
    await userEvent.clear(field);
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(field).toHaveValue("Ada"));
  },
};

export const GapBetweenFields: Story = {
  args: { gap: "6" },
  play: async ({ canvas }) => {
    const field = canvas.getByLabelText("Password").closest(".cy-field") as HTMLElement;
    const button = canvas.getByRole("button", { name: "Unlock" });
    const between = button.getBoundingClientRect().top - field.getBoundingClientRect().bottom;
    const six = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--cy-space-6"),
    );
    await expect(Math.round(between)).toBe(Math.round(six));
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-form", [
      "display",
      "row-gap",
      "margin-top",
      "padding-top",
      "box-sizing",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
