import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Available section</AccordionTrigger>
        <AccordionContent>
          This section is fully interactive and can be expanded or collapsed.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Restricted section</AccordionTrigger>
        <AccordionContent>
          This content is not accessible because the item is disabled.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Another available section</AccordionTrigger>
        <AccordionContent>
          This section is also interactive. Disabled items retain their visual presence but cannot
          be activated.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
