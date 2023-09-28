const ErrorMessage: React.FC = () => {
  return (
    <>
      <h2>MQTT通信に失敗しました😞</h2>
      <h3>もう一度、このThingName単体でお試しください。</h3>
      <p>この画面が繰り返し表示される場合は、以下のことを確認してください。</p>
      <ul>
        <li>AWS証明書にアタッチされている権限が適切か</li>
        <li>Thing Nameが正しいか</li>
        <li>Edgeの電源は入っているか</li>
        <li>Edgeのネットワーク接続は正常か</li>
      </ul>
      <p>それでも解決しない場合は、このアプリケーションの異常かもしれません。</p>
      <p>このアプリケーションで確認する代わりに、AWS IoT Coreコンソールで確認してみてください。</p>
    </>
  );
};

export default ErrorMessage;
