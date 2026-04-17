import {
  AspectRatio,
  Box,
  Center,
  Container,
  Divider,
  Flex,
  Grid,
  Inline,
  Portal,
  Section,
  Slot,
  Spacer,
  Stack,
  VisuallyHidden,
} from '@lumen/react';
import { Demo, SectionHeader } from './common';

const swatchStyle = (bg = 'var(--lumen-color-accent-soft)'): React.CSSProperties => ({
  background: bg,
  borderRadius: 'var(--lumen-radius-component-sm)',
  height: '1.5rem',
  width: '1.5rem',
});

export function PrimitivesSection() {
  return (
    <>
      <SectionHeader
        title="Primitives"
        description="Layout, structural, and accessibility primitives."
      />
      <div className="showcase-grid">
        <Demo title="Box">
          <Box
            padding="4"
            background="bg.raised"
            borderRadius="md"
            borderWidth="1"
            borderStyle="solid"
            borderColor="border.default"
          >
            Box with padding, bg, border
          </Box>
        </Demo>

        <Demo title="Flex">
          <Flex gap="2" align="center">
            <span style={swatchStyle()} />
            <span style={swatchStyle('var(--lumen-color-feedback-success-soft)')} />
            <span style={swatchStyle('var(--lumen-color-feedback-info-soft)')} />
          </Flex>
        </Demo>

        <Demo title="Grid">
          <Grid columns={3} gap="2" width="full">
            <span style={swatchStyle()} />
            <span style={swatchStyle('var(--lumen-color-feedback-warning-soft)')} />
            <span style={swatchStyle('var(--lumen-color-feedback-info-soft)')} />
            <span style={swatchStyle('var(--lumen-color-feedback-success-soft)')} />
            <span style={swatchStyle('var(--lumen-color-feedback-danger-soft)')} />
            <span style={swatchStyle()} />
          </Grid>
        </Demo>

        <Demo title="Stack">
          <Stack gap="2" width="full">
            <Box padding="2" background="bg.raised" borderRadius="sm">
              One
            </Box>
            <Box padding="2" background="bg.raised" borderRadius="sm">
              Two
            </Box>
            <Box padding="2" background="bg.raised" borderRadius="sm">
              Three
            </Box>
          </Stack>
        </Demo>

        <Demo title="Inline">
          <Inline gap="1">
            {Array.from({ length: 8 }, (_, i) => `swatch-${i}`).map((id) => (
              <span key={id} style={swatchStyle()} />
            ))}
          </Inline>
        </Demo>

        <Demo title="Container">
          <Container size="sm" width="full">
            <Box padding="3" background="bg.raised" borderRadius="md">
              Size-constrained container
            </Box>
          </Container>
        </Demo>

        <Demo title="Center">
          <Center height="4rem" width="full">
            <strong>Centered</strong>
          </Center>
        </Demo>

        <Demo title="Divider">
          <Stack gap="2" width="full">
            <span>Above</span>
            <Divider />
            <span>Below</span>
          </Stack>
        </Demo>

        <Demo title="Spacer">
          <Flex width="full">
            <span>Left</span>
            <Spacer />
            <span>Right</span>
          </Flex>
        </Demo>

        <Demo title="AspectRatio">
          <AspectRatio ratio={16 / 9} width="full">
            <div
              style={{
                height: '100%',
                width: '100%',
                background: 'var(--lumen-color-accent-soft)',
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--lumen-radius-component-md)',
              }}
            >
              16:9
            </div>
          </AspectRatio>
        </Demo>

        <Demo title="Section">
          <Section padding="4" background="bg.raised" borderRadius="md" width="full">
            Semantic landmark
          </Section>
        </Demo>

        <Demo title="Portal">
          <span>Rendered into document.body (see bottom banner)</span>
          <Portal>
            <div
              style={{
                position: 'fixed',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--lumen-color-background-raised)',
                border: '1px solid var(--lumen-color-border-default)',
                borderRadius: 'var(--lumen-radius-component-md)',
                padding: '0.4rem 0.9rem',
                boxShadow: 'var(--lumen-shadow-sm)',
                zIndex: 5,
                fontSize: '0.8rem',
              }}
            >
              Portaled element
            </div>
          </Portal>
        </Demo>

        <Demo title="Slot">
          <Slot>
            <button
              type="button"
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--lumen-radius-component-md)',
                border: '1px solid var(--lumen-color-border-default)',
                background: 'var(--lumen-color-background-surface)',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              Slotted button
            </button>
          </Slot>
        </Demo>

        <Demo title="VisuallyHidden">
          <button
            type="button"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--lumen-radius-component-md)',
              border: '1px solid var(--lumen-color-border-default)',
              background: 'var(--lumen-color-background-surface)',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <span aria-hidden>★</span>
            <VisuallyHidden>Star this item</VisuallyHidden>
          </button>
        </Demo>
      </div>
    </>
  );
}
