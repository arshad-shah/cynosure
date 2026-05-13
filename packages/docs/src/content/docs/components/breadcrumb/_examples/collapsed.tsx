import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Breadcrumb maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/library">Library</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/library/foundations">Foundations</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/library/foundations/colors">Colors</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/library/foundations/colors/tokens">Tokens</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>
        <BreadcrumbPage>Accent scale</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
