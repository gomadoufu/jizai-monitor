import { emit } from '@tauri-apps/api/event';

const CloseTheOthers: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  async function closeTheOthers() {
    await emit('quit', null);
  }
  return (
    <div>
      <button type="button" onClick={closeTheOthers} disabled={disabled}>
        他の全てのモニターを閉じる
      </button>
    </div>
  );
};
export default CloseTheOthers;
