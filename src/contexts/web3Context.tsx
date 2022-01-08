import React, { createContext } from 'react';
import { Network, Web3Client } from '../web3';

export const defaultNetworks: Network[] = [
  {
    name: 'MainNet',
    url: 'https://algoexplorerapi.io',
  },
  {
    name: 'TestNet',
    url: 'https://testnet.algoexplorerapi.io',
  },
];

export interface IWeb3ContextValue {
  web3?: Web3Client;
}

export interface IWeb3ProviderProps {
  children: React.ReactNode;
  networks?: Network[];
}

export const Web3Context = createContext<IWeb3ContextValue>({});

export class Web3Provider extends React.Component<IWeb3ProviderProps> {
  web3: Web3Client;

  constructor(props: IWeb3ProviderProps) {
    super(props);
    const networks = props.networks || defaultNetworks;
    this.web3 = new Web3Client({ networks });
    this.web3.onNetworkUpdate(() => this.forceUpdate());
    this.web3.wallet.onUpdate((eventName, error, payload) => {
      console.log(eventName, error, payload);
      this.forceUpdate();
    });
  }

  render() {
    return (
      <Web3Context.Provider value={{ web3: this.web3 }}>
        {this.props.children}
      </Web3Context.Provider>
    );
  }
}
