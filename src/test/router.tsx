import type { LinkRenderProps } from "../foundations/LinkBase/LinkBase.js";

/**
 * A stand-in for a router's link component, for `renderLink` stories: it renders its own anchor marked
 * `data-router`, prefixes the path with `/app`, calls the component's own click handler, then takes over the
 * navigation and records where it went in `visits`.
 */
export function fakeRouter() {
  const visits: (string | undefined)[] = [];
  const renderLink = ({ href, ref, onClick, ...props }: LinkRenderProps) => (
    <a
      {...props}
      ref={ref}
      href={href === undefined ? undefined : `/app${href}`}
      data-router="yes"
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
        visits.push(href);
      }}
    />
  );
  return { renderLink, visits };
}
