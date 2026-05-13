import { Avatar, AvatarGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <AvatarGroup
      max={2}
      renderOverflow={(count) => (
        <button
          type="button"
          aria-label={`Show ${count} more collaborators`}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '9999px',
            background: 'var(--cy-color-neutral-3, #eef0f4)',
            color: 'var(--cy-color-neutral-12, #1a1f2c)',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          +{count}
        </button>
      )}
    >
      <Avatar name="Jane Doe" />
      <Avatar name="John Smith" />
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Linus Torvalds" />
    </AvatarGroup>
  );
}
