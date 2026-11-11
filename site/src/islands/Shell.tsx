import { AppShell, CynosureTheme, Link, SideNav, ThemeToggle, useColorMode } from "@arshad-shah/cynosure";
import type { ReactNode } from "react";
import { NAV, TABS } from "../site";

/**
 * The frame of every page: Cynosure's AppShell with the site map in a SideNav (a bottom tab bar on phones), and a
 * ThemeToggle that follows and saves the visitor's colour mode. It is the site's one large island; the page content
 * arrives as static HTML through `children`.
 */
export default function Shell({ current, children }: { current: string; children?: ReactNode }) {
  const { mode, setMode } = useColorMode();
  return (
    <CynosureTheme target="document" mode={mode}>
      <AppShell
        header={
          <div className="site-bar">
            <Link href="/" tone="neutral" className="site-brand">
              Cynosure
            </Link>
            <ThemeToggle variant="cycle" value={mode} onChange={setMode} />
          </div>
        }
        nav={<SideNav label="Site" items={NAV} current={current} />}
        tabs={<SideNav label="Sections" layout="bar" items={TABS} current={current} />}
      >
        <div className="site-page">{children}</div>
      </AppShell>
    </CynosureTheme>
  );
}
