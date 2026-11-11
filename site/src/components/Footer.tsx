import { Inline, Link } from "@arshad-shah/cynosure";
import { VERSION } from "../site";

const REPO = "https://github.com/arshad-shah/cynosure";

/** The end of every page: version, licence, changelog, and where to edit the page. Static: rendered at build time. */
export default function Footer({ source }: { source: string }) {
  return (
    <footer className="site-footer">
      <Inline gap="5" wrap>
        <span>Cynosure {VERSION}</span>
        <Link href={`${REPO}/blob/main/LICENSE`} size="sm" external>
          MIT licence
        </Link>
        <Link href={`${REPO}/blob/main/CHANGELOG.md`} size="sm" external>
          Changelog
        </Link>
        <Link href={`${REPO}/edit/main/${source}`} size="sm" external>
          Edit this page
        </Link>
      </Inline>
    </footer>
  );
}
