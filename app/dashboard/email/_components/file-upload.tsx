'use client';

import { useState } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle upload with progress
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    // Step 1: Get pre-signed URL from the backend
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    });
    const { signedUrl } = await response.json();

    if (!signedUrl) {
      alert('Failed to get pre-signed URL.');
      return;
    }

    // Step 2: Upload the file using XMLHttpRequest or fetch
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    // Step 3: Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentage = (event.loaded / event.total) * 100;
        setProgress(percentage);
      }
    });

    // Step 4: Handle upload completion
    xhr.onload = () => {
      if (xhr.status === 200) {
        alert('File uploaded successfully!');
      } else {
        alert('Failed to upload file.');
      }
    };

    // Step 5: Send the file
    xhr.send(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload to S3</button>

      <div
        style={{
          marginTop: '20px',
          width: '100%',
          backgroundColor: '#e0e0e0',
          borderRadius: '5px'
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '10px',
            backgroundColor: '#4caf50',
            borderRadius: '5px'
          }}
        ></div>
      </div>
      <div>{Math.round(progress)}%</div>
    </div>
  );
}
