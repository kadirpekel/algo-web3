# Algorand Web3 Library

The `algo-web3` package allows you to interact with an Algorand blockchain and smart contracts through wallets. Package also comes with convenient `React` hooks to provide seamless integration required for the most web3 applications.

## Install
Use `mpm` or `yarn` packae manager to install `algo-web3` package with its dependencies.

Using yarn
```bash
$ yarn add algo-web3
```

Npm
```bash
$ npm install algo-web3
```

## Usage
Once installed, you may now start using the packgae by importing it as shown below

```typescript
import Web3Client from 'algo-web3'
const web3 = Web3Client([{ url: 'https://testnet.algoexplorerapi.io' }]);
const accountInfo = await web.fetchAccountInfo('GMOP2WF7UNQX7BV4ZAL...')
```

## React Usage

Package comes with a conventient `React` hook which gives you to ability to manage your web3 application state. Let's take a look at the example below. Please note the use of integrated wallet connectivity which provides a seamless integrity.

```tsx
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
```

## Contribute

Any contributions are always very welcome, just before sending any pull requests, please make sure:

 * You have setup your development environment correctly
 * You have added/modifed the corresponding unit tests regarding your contribution
 * You have checked your code agains `eslint` style rules

Please don't hesitate to contirubute, all sort of contributions considered valuable.

## Disclaimer

This project is in very early stages so please use it at your own risk.

## License

Copyright (c) 2021 Kadir Pekel.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.