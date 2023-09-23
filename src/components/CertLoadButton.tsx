import React from 'react';
import { open, message } from '@tauri-apps/api/dialog';

type FilePath = string;

type CertificateProps = {
  name: string;
  path: FilePath;
  setPath: React.Dispatch<React.SetStateAction<FilePath>>;
  extension: string;
};

const CertLoadButton: React.FC<CertificateProps> = ({ name, path, setPath, extension }) => {
  async function handleClick() {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'TLS certificates', extensions: [extension] }],
    });
    if (selected === null) {
      await message('ファイルを選択してください', { title: 'Error', type: 'error' });
    }
    if (typeof selected === 'string') {
      console.log(`Selected file path: ${selected}`);
      setPath(selected);
    }
  }

  return (
    <button type="button" onClick={handleClick}>
      <div className="over-text">{path ? path : `${name}ファイルを選択`}</div>
    </button>
  );
};

export default CertLoadButton;
