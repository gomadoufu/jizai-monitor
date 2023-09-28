import React, { ComponentProps, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { message } from '@tauri-apps/api/dialog';
import CertLoadButton from '../components/CertLoadButton';
import ThingNameForm from '../components/ThingNameForm';
import { v4 as uuidv4 } from 'uuid';
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';
import { emit } from '@tauri-apps/api/event';

type FilePath = string;

function App() {
  const [ca, setCa] = useState<FilePath>('');
  const [cert, setCert] = useState<FilePath>('');
  const [key, setKey] = useState<FilePath>('');
  const [things, setThings] = useState<string>('');

  const [clicked, setClicked] = useState(false);

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
      name: 'プライベートキー',
      path: key,
      setPath: setKey,
      extension: 'key',
    },
  ];

  useEffect(() => {
    const listenClose = async () => {
      await appWindow.onCloseRequested(async (event) => {
        event.preventDefault();
        await emit('quit', null);
        appWindow.close();
      });
    };

    return () => {
      listenClose();
    };
  }, []);

  function createMonitor(uniqueId: string) {
    const webview = new WebviewWindow(uniqueId, { url: '/monitor.html' });
    webview.once('tauri://error', () => {
      message('エラーが発生しました。\n ウィンドウの作成に失敗しました', {
        title: 'Error',
        type: 'error',
      });
      return;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ca || !cert || !key) {
      message('ファイルを選択してください', { title: 'Error', type: 'error' });
      return;
    }
    if (!things) {
      message('監視するEdgeの識別番号を入力してください', { title: 'Error', type: 'error' });
      return;
    }
    setClicked(true);
    const extractValues = (str: string): string[] => {
      // 余分な空白やカンマを取り除きます。
      let cleaned = str.replace(/\s+/g, '').replace(/,+/g, ',');

      // カンマで区切られた文字列を配列に変換します。
      return cleaned.split(',').filter(Boolean);
    };

    const thingsArray = Array.from(new Set(extractValues(things)));
    const uniqueIdArray = thingsArray.map((_) => uuidv4());

    await invoke('mqtt_call', {
      message: { uuid: uniqueIdArray, things: thingsArray, ca: ca, cert: cert, key: key },
    });

    for (let i = 0; i < uniqueIdArray.length; i++) {
      createMonitor(uniqueIdArray[i]);
    }
    setClicked(false);
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
        {clicked ? null : (
          <form className="form-item-col">
            {certificates.map((certificate) => (
              <CertLoadButton key={certificate.name} {...certificate} />
            ))}
          </form>
        )}

        <ThingNameForm
          onSubmit={handleSubmit}
          onThingNameChange={(e: React.ChangeEvent<HTMLInputElement>) => setThings(e.target.value)}
          clicked={clicked}
        />
      </div>
    </div>
  );
}

export default App;
