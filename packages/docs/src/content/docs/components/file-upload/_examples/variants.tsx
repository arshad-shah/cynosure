import { FileUpload, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="4" style={{ width: 420 }}>
      <FileUpload variant="default" />
      <FileUpload variant="card" />
      <FileUpload variant="compact" />
      <FileUpload variant="minimal" />
    </Stack>
  );
}
