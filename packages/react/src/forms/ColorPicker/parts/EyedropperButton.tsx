import { Pipette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { IconButton } from '../../IconButton/IconButton.js';

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

interface EyedropperButtonProps {
  onPick: (color: Color) => void;
  disabled?: boolean;
}

/**
 * Calls the browser EyeDropper API and forwards the picked sRGB hex back as a
 * RAC `Color`. Feature-detected — renders nothing in browsers that don't ship
 * the API (Firefox/Safari at time of writing).
 */
export function EyedropperButton({
  onPick,
  disabled,
}: EyedropperButtonProps): React.ReactElement | null {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && typeof window.EyeDropper === 'function');
  }, []);

  if (!supported) return null;

  return (
    <IconButton
      label="Pick a color from the page"
      icon={<Pipette aria-hidden="true" size={14} />}
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={async () => {
        //  biome-ignore lint/style/noNonNullAssertion: We check support above, so this is safe.
        const dropper = new window.EyeDropper!();
        try {
          const { sRGBHex } = await dropper.open();
          onPick(parseColor(sRGBHex));
        } catch {
          // User dismissed — ignore.
        }
      }}
    />
  );
}
