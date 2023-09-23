import React, { ComponentProps, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { message } from '@tauri-apps/api/dialog';
import './App.css';
import CertLoadButton from './components/CertLoadButton';
import ThingNameForm from './components/ThingNameForm';
import { v4 as uuidv4 } from 'uuid';

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ca || !cert || !key) {
      message('ファイルを選択してください', { title: 'Error', type: 'error' });
      return;
    }
    if (!thingName) {
      message('監視するEdgeの識別番号を入力してください', { title: 'Error', type: 'error' });
      return;
    }
    invokeSubmit(thingName, ca, cert, key);
  }

  async function invokeSubmit(thing: string, ca: string, cert: string, key: string) {
    const uniqueId = uuidv4();
    await invoke('submit', {
      message: { uuid: uniqueId, thing: thing, ca: ca, cert: cert, key: key },
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="container">
      <h1>🌕 Jizai - Monitor 🦉</h1>
      <div className="anchor-container">
        <a href="https://jizaipad.net/" rel="jizaipad viewer" target="_blank">
          Viewerを開く
        </a>
      </div>
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
