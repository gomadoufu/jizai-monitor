import React, { ComponentProps, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { message } from '@tauri-apps/api/dialog';
import './App.css';
import CertLoadButton from './components/CertLoadButton';
import ThingNameForm from './components/ThingNameForm';

type FilePath = string;

function App() {
  const [ca, setCa] = useState<FilePath>('');
  const [cert, setCert] = useState<FilePath>('');
  const [key, setKey] = useState<FilePath>('');
  const [thingName, setThingName] = useState<string>('');

  const certificates: ComponentProps<typeof CertLoadButton>[] = [
    {
      name: 'CA証明書',
      path: ca,
      setPath: setCa,
      extension: 'pem',
    },
    {
      name: 'デバイス証明書',
      path: cert,
      setPath: setCert,
      extension: 'crt',
    },
    {
      name: '秘密鍵',
      path: key,
      setPath: setKey,
      extension: 'key',
    },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ca || !cert || !key) {
      message('ファイルを選択してください', { title: 'Error', type: 'error' });
      return;
    }
    if (!thingName) {
      message('監視するEdgeの識別番号を入力してください', { title: 'Error', type: 'error' });
      return;
    }
    await invoke('submit', { message: { ca: ca, cert: cert, key: key, thing: thingName } }).then(
      (res) => {
        console.log(res);
      }
    );
  }

  return (
    <div className="container">
      <h1>🌕 Jizai - Monitor 🦉</h1>
      <a href="https://jizaipad.net/" rel="jizaipad viewer" target="_blank">
        Viewerを開く
      </a>
      <p>TLS証明書を選択してください。AWS IoT Coreで発行できます。</p>
      <p>また、右クリックからリロードできます。</p>

      <div className="form-container">
        <form className="form-item-col">
          {certificates.map((certificate) => (
            <CertLoadButton key={certificate.name} {...certificate} />
          ))}
        </form>

        <ThingNameForm
          onSubmit={handleSubmit}
          onThingNameChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setThingName(e.target.value)
          }
        />
      </div>
    </div>
  );
}

export default App;
