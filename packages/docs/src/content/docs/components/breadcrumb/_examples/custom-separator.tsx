import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Breadcrumb separator={<span aria-hidden="true">/</span>}>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>
        <BreadcrumbPage>Getting started</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
