import React, { useEffect, useState } from 'react';

import { useWeb3, ellipseAddress } from 'algo-web3';

const AccountLogin = () => {
  const [address, setAddress] = useState<string>('Loading');
  const { web3 } = useWeb3();

  useEffect(() => {
    if (web3.wallet.isConnected()) {
      web3
        .fetchAccountInformation()
        .then((value: Record<string, any>) => setAddress(value.address));
    }
  }, [web3.wallet.isConnected()]);

  return (
    <p>
      {web3.wallet.isConnected() ? (
        <button onClick={() => web3.wallet.disconnect()}>
          Disconnect ({ellipseAddress(address)})
        </button>
      ) : (
        <button onClick={() => web3.wallet.connect()}>
          Connect your Algorand Wallet
        </button>
      )}
    </p>
  );
}

export default  AccountLogin;