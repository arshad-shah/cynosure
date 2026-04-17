import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Input } from '../../forms/Input/Input.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from './index.js';

/**
 * `Modal` is a naming alias for `Dialog` — the underlying component is the
 * same. Import the name that fits your product vocabulary.
 */
const meta: Meta<typeof Modal> = {
  title: 'Overlays/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const AliasedToDialog: Story = {
  name: 'Modal === Dialog',
  render: () => {
    function Aliased(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Stack gap="3">
          <Inline gap="3" align="center">
            <Text size="sm" color="fg.muted">
              The <code>Modal*</code> exports re-export the <code>Dialog*</code> components — same
              instance, different name.
            </Text>
          </Inline>
          <Modal open={open} onOpenChange={setOpen}>
            <ModalTrigger asChild>
              <Button>Open modal</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Add a payment method</ModalTitle>
                <ModalDescription>
                  We&rsquo;ll charge your card only once you confirm.
                </ModalDescription>
              </ModalHeader>
              <Stack gap="3" paddingX="5" paddingBottom="3">
                <Input placeholder="Card number" />
                <Inline gap="3">
                  <Input placeholder="MM/YY" />
                  <Input placeholder="CVC" />
                </Inline>
              </Stack>
              <ModalFooter>
                <ModalClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </ModalClose>
                <ModalClose asChild>
                  <Button>Save card</Button>
                </ModalClose>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Stack>
      );
    }
    return <Aliased />;
  },
};
