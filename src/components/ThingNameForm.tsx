import { listen } from '@tauri-apps/api/event';
import React, { useEffect, useState } from 'react';

type ThingNameFormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onThingNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clicked: boolean;
};

const ThingNameForm: React.FC<ThingNameFormProps> = ({ onSubmit, onThingNameChange, clicked }) => {
  const [thing, setThing] = useState<string>('');

  useEffect(() => {
    const listenBusy = async () => {
      await listen('busy', (e) => {
        if (typeof e.payload !== 'string') return;
        setThing(e.payload);
      });
    };
    listenBusy();
  }, []);

  return (
    <form className="form-item-col" onSubmit={onSubmit}>
      <input
        id="thingName"
        type="text"
        name="thingName"
        placeholder=" ☞   thing nameを入力（複数の場合カンマ区切り）"
        autoCapitalize="off"
        onChange={onThingNameChange}
      />
      <button id="submit" type="submit" disabled={clicked}>
        {clicked ? `${thing}と通信中...💫` : '監視情報を取得する 👀'}
      </button>
    </form>
  );
};

export default ThingNameForm;
