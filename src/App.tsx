import { useState } from 'react';
import { open, message } from '@tauri-apps/api/dialog';
import './App.css';

function App() {
  const [ca, setCa] = useState<FilePath>('');
  const [cert, setCert] = useState<FilePath>('');
  const [key, setKey] = useState<FilePath>('');
  const [thingName, setThingName] = useState<string>('');

  type FilePath = string;

  type Certificate = {
    name: string;
    path: FilePath;
    setPath: React.Dispatch<React.SetStateAction<FilePath>>;
    extension: string;
  };

  const certificates: Certificate[] = [
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
    console.log(`submit ${ca}, ${cert}, ${key}, ${thingName}`);
  }

  async function openDialog(ext: string, setPath: React.Dispatch<React.SetStateAction<string>>) {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'TLS certificates', extensions: [ext] }],
    });
    if (selected === null) {
      await message('ファイルを選択してください', { title: 'Error', type: 'error' });
    }
    if (typeof selected === 'string') {
      console.log(`Selected file path: ${selected}`);
      setPath(selected);
    }
  }

  // REFACTOR: コンポーネントに分割する
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
          {/* 証明書の選択 */}
          {certificates.map((certificate) => (
            <button
              key={certificate.name}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openDialog(certificate.extension, certificate.setPath).catch((error) => {
                  console.error("Couldn't open dialog", error);
                  //TODO: Rustにエラーを渡す
                });
              }}
            >
              <div className="over-text">
                {certificate.path ? certificate.path : `${certificate.name}ファイルを選択`}
              </div>
            </button>
          ))}
        </form>
        <form className="form-item-col" onSubmit={handleSubmit}>
          {/* miniPCの番号入力と送信 */}
          <input
            id="thingName"
            type="text"
            name="thingName"
            placeholder="thing name"
            autoComplete="off"
            onChange={(e) => setThingName(e.target.value)}
          />
          <button id="submit" type="submit">
            監視する
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
