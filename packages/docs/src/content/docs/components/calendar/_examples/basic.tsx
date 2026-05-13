import { Calendar } from '@arshad-shah/cynosure-react/calendar';
import { parseDate } from '@internationalized/date';

export default function Example() {
  return <Calendar aria-label="Event date" defaultValue={parseDate('2026-04-17')} />;
}
