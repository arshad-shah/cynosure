import { createTheme, themeProperties } from "../tokens";

/** Renders every default token with a swatch for colours. Docs-only helper. */
export function TokenTable() {
  const rows = Object.entries(themeProperties(createTheme()));
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          <th style={{ textAlign: "start" }}>Token</th>
          <th style={{ textAlign: "start" }}>Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, value]) => (
          <tr key={name} style={{ borderTop: "1px solid var(--cy-color-line)" }}>
            <td style={{ padding: "6px 0", fontFamily: "var(--cy-font-mono)" }}>{name}</td>
            <td style={{ padding: "6px 0", display: "flex", gap: 8, alignItems: "center" }}>
              {name.startsWith("--cy-color") && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: `var(${name})`,
                    border: "1px solid var(--cy-color-line)",
                  }}
                />
              )}
              <code>{value}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
