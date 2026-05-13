import { FileUpload, FileUploadList, FileUploadTrigger } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: 420 }}>
      <FileUpload multiple variant="card">
        <FileUploadTrigger />
        <FileUploadList />
      </FileUpload>
    </div>
  );
}
