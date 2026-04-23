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
        <AccordionTrigger>What is Cynosure?</AccordionTrigger>
        <AccordionContent>
          Cynosure is a React component library built with accessibility and design consistency in
          mind. It provides a set of composable, themeable components.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I install it?</AccordionTrigger>
        <AccordionContent>
          Install via npm: <code>npm install @arshad-shah/cynosure-react</code>. Then import
          components from the package and wrap your app with the theme provider.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. All interactive components follow WAI-ARIA patterns and are keyboard navigable with
          proper focus management.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
