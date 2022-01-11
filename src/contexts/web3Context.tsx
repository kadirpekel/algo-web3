import React, { createContext, useContext } from 'react';
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

export const createGenericContext = <T extends unknown>() => {
  // Create a context with a generic parameter or undefined
  const genericContext = createContext<T | undefined>(undefined);

  // Check if the value provided to the context is defined or throw an error
  const useGenericContext = () => {
    const contextIsDefined = useContext(genericContext);
    if (!contextIsDefined) {
      throw new Error('useGenericContext must be used within a Provider');
    }
    return contextIsDefined;
  };

  return [useGenericContext, genericContext.Provider] as const;
};

export interface IWeb3ContextValue {
  web3: Web3Client;
}

export interface IWeb3ProviderProps {
  children: React.ReactNode;
  networks?: Network[];
}

export const [useWeb3, Web3ContextProvider] =
  createGenericContext<IWeb3ContextValue>();

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
      <Web3ContextProvider value={{ web3: this.web3 }}>
        {this.props.children}
      </Web3ContextProvider>
    );
  }
}
