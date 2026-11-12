# ChatMessage

One message in an assistant chat. The person's messages sit at the end, filled with the accent; the assistant's sit at the start, after an `avatar`. The content is `children`: render markdown into `Prose` yourself (Cynosure has no markdown parser). A caret follows the content while it streams, and `actions` (copy, retry) show under the message on hover or focus, and always on touch screens.

```tsx
import { Avatar, ChatMessage, CopyButton, IconButton, Prose } from "@arshad-shah/cynosure";

<ChatMessage role="user">{question}</ChatMessage>
<ChatMessage
  role="assistant"
  avatar={<Avatar name="Assistant" icon={sparkles} size="sm" decorative />}
  streaming={isStreaming}
  actions={
    <>
      <CopyButton value={answer} size="sm" />
      <IconButton icon={retry} label="Retry" size="sm" variant="ghost" onClick={retryLast} />
    </>
  }
>
  <Prose size="sm">{renderMarkdown(answer)}</Prose>
</ChatMessage>
```

| Prop                  | Default   | Notes                                                                                        |
| --------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `role`                | –         | `user` (end, filled, keeps line breaks) · `assistant` (start, after the avatar)              |
| `avatar`              | –         | Any node, usually a decorative `Avatar`: the message is already named by its author          |
| `tone`                | `neutral` | `danger` for a message that reports a failure                                                |
| `wide`                | `false`   | The bubble takes the whole row (tables, code) instead of hugging its text                    |
| `actions`             | –         | IconButtons in a toolbar under the bubble (one Tab stop, arrows between them)                |
| `streaming`           | `false`   | A blinking caret after the content, and `aria-busy` on the message                           |
| `labels`              | English   | `user` ("You"), `assistant` ("Assistant"): the message's name; `actions` ("Message actions") |
| `className` / `style` | –         | Layout only                                                                                  |
- Each message is an `article` named by its author, so screen readers can move between messages.
- The actions fade in on hover or focus with a mouse; they keep their space, so nothing moves. Keyboard users reach them with Tab whatever the pointer does; on screens without hover they are always shown.
- Reduced motion stops the caret's blink (it stays lit).

## The thread

A thread is a `ScrollArea` with `follow`, so it keeps to the end while replies stream in and lets go when the person scrolls up; `onAtBottomChange` tells you when to offer a way back (`handle.scrollToEnd()`). Do not make the thread a live region: it would read every streamed fragment. Announce each finished assistant reply once through `useAnnounce` (inside an `Announcer`).

```tsx
const announce = useAnnounce();
const [atBottom, setAtBottom] = useState(true);
// When a reply finishes streaming:
announce(replyText);

<ScrollArea
  label="Conversation"
  follow
  onAtBottomChange={setAtBottom}
  handle={scroller}
  overlay={
    !atBottom && (
      <Button size="sm" onClick={() => scroller.current?.scrollToEnd()}>
        Latest
      </Button>
    )
  }
>
  {messages.map((m) => (
    <ChatMessage key={m.id} role={m.role} avatar={m.role === "assistant" ? botAvatar : undefined}>
      …
    </ChatMessage>
  ))}
</ScrollArea>;
```

## Tokens

- `--cy-chat-message-caret`: colour of the streaming caret
- `--cy-chat-message-max-width`: widest a bubble grows before its text wraps (not with wide)
- `--cy-chat-message-user-color`: text colour of the person's bubble
- `--cy-chat-message-user-bg`: background of the person's bubble
- `--cy-chat-message-border`: border colour of the assistant's bubble
- `--cy-chat-message-bg`: background of the assistant's bubble
- `--cy-chat-message-padding`: space inside the bubble
- `--cy-chat-message-radius`: corner radius of the bubble
- `--cy-chat-message-gap`: space between the avatar and the message
