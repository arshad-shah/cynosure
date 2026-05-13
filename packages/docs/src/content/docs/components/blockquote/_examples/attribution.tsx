import { Blockquote, Link } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Blockquote
      attribution={
        <>
          Tim Berners-Lee,{' '}
          <Link href="https://www.w3.org/History/1989/proposal.html" external>
            Information Management: A Proposal
          </Link>
        </>
      }
    >
      The Web does not just connect machines, it connects people.
    </Blockquote>
  );
}
