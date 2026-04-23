import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Accordion type="multiple">
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping information</AccordionTrigger>
        <AccordionContent>
          We ship worldwide. Standard delivery takes 3–5 business days. Express shipping is
          available at checkout.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns & exchanges</AccordionTrigger>
        <AccordionContent>
          Items can be returned within 30 days of delivery for a full refund. Exchanges are
          processed within 5 business days.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="payment">
        <AccordionTrigger>Payment methods</AccordionTrigger>
        <AccordionContent>
          We accept all major credit cards, PayPal, and bank transfer. All transactions are secured
          with 256-bit encryption.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
