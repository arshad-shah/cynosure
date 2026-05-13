import { Notification } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [unread, setUnread] = useState(true);

  return (
    <Notification
      unread={unread}
      onRead={() => setUnread(false)}
      title="Build finished"
      description="Your deployment to staging is ready to review."
      timestamp="just now"
    />
  );
}
