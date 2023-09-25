import React from 'react';

type ThingNameFormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onThingNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ThingNameForm: React.FC<ThingNameFormProps> = ({ onSubmit, onThingNameChange }) => {
  return (
    <form className="form-item-col" onSubmit={onSubmit}>
      <input
        id="thingName"
        type="text"
        name="thingName"
        placeholder=" ☞   thing nameを入力（複数の場合カンマ区切り）"
        autoComplete="off"
        onChange={onThingNameChange}
      />
      <button id="submit" type="submit">
        監視情報を取得する 👀
      </button>
    </form>
  );
};

export default ThingNameForm;
