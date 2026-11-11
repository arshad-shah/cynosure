import { Table } from "@arshad-shah/cynosure";
import type { ReactNode } from "react";
import type { PropRow } from "../props";

/** Doc comments use Markdown's `code` spans; show them as code. */
const withCode = (text: string): ReactNode[] =>
  text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={part + i}>{part}</code> : part));

/** A component's props, generated from its published types. Rendered at build time; no sorting, no script. */
export default function PropsTable({ name, rows }: { name: string; rows: PropRow[] }) {
  return (
    <Table
      caption={`${name} props`}
      captionHidden
      rows={rows}
      getRowId={(row) => row.name}
      columns={[
        {
          key: "name",
          header: "Prop",
          cell: (row) => (
            <>
              <code>{row.name}</code>
              {row.required && <span className="site-required"> required</span>}
            </>
          ),
        },
        { key: "type", header: "Type", cell: (row) => <code className="site-type">{row.type}</code> },
        {
          key: "default",
          header: "Default",
          cell: (row) => (row.default ? <code>{row.default}</code> : "–"),
        },
        { key: "description", header: "Description", cell: (row) => withCode(row.description) },
      ]}
    />
  );
}
