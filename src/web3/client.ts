import algosdk, {
  Algodv2,
  SuggestedParams,
  TransactionLike,
  instantiateTxnIfNeeded,
} from 'algosdk';
import {
  WalletConnectClient,
  SignTxnParams,
  IWalletTransaction,
} from '../wallets';

export type Network = {
  name: string;
  url: string;
  port?: string;
  token?: string;
};

export interface IWalletUpdateCallback {
  (eventName: string, error: Error | null, payload: Record<string, any>): void;
}

export interface IWallet {
  connect: () => void;
  disconnect: () => void;
  getAccount: () => string | null;
  isConnected: () => boolean;
  onUpdate: (callback: IWalletUpdateCallback) => void;
  signTxns: (signTxnParams: SignTxnParams) => Promise<Array<string | null>>;
}

export interface IWeb3ClientNetworkCallback {
  (): void;
}

export interface IWeb3ClientProps {
  networks: Network[];
  wallet?: IWallet;
}

class Web3Client {
  algod: Algodv2;
  networks: Network[];
  wallet: IWallet;
  callbacks: IWeb3ClientNetworkCallback[];
  currentNetworkIndex: number;

  constructor({ networks, wallet }: IWeb3ClientProps) {
    console.assert(networks.length > 0);
    this.wallet = wallet || new WalletConnectClient();
    this.networks = networks;
    this.callbacks = new Array<IWeb3ClientNetworkCallback>();
    this.switchNetwork(0);
  }

  onNetworkUpdate(callback: IWeb3ClientNetworkCallback) {
    this.callbacks.push(callback);
  }

  emitNetworkUpdate() {
    this.callbacks.forEach((cb) => cb());
  }

  getCurrentNetwork() {
    return this.networks[this.currentNetworkIndex];
  }

  switchNetwork(networkIndex: number) {
    this.currentNetworkIndex = networkIndex;
    const network = this.getCurrentNetwork();
    // TODO: should we memoize algod?
    this.algod = new Algodv2(
      network.token || '',
      network.url,
      network.port || ''
    );
    this.emitNetworkUpdate();
  }

  async fetchAccountInformation(
    account?: string
  ): Promise<Record<string, any>> {
    const fallbackAccount = account || this.wallet.getAccount();
    if (!fallbackAccount) {
      throw new Error('No wallet connected');
    }
    return this.algod
      .accountInformation(fallbackAccount)
      .setIntDecoding(algosdk.IntDecoding.BIGINT)
      .do();
  }

  async submitTransactions(
    txns: TransactionLike[]
  ): Promise<Record<string, any>> {
    // TODO: Sign transactions by using the wallet
    algosdk.assignGroupID(txns);
    const txnsToSign: IWalletTransaction[] = txns.map((txn) => {
      return {
        txn: Buffer.from(
          algosdk.encodeUnsignedTransaction(instantiateTxnIfNeeded(txn))
        ).toString('base64'),
      };
    });
    const signedTxns = await this.wallet.signTxns([txnsToSign]);
    const signedTxnsToSubmit = signedTxns.map((r) => {
      if (r == null) {
        throw Error('signature can not be null');
      }
      return new Uint8Array(Buffer.from(r, 'base64'));
    });

    const { txId } = await this.algod
      .sendRawTransaction(signedTxnsToSubmit)
      .do();
    return this.waitForConfirmation(txId);
  }

  async getSuggestedParams(): Promise<SuggestedParams> {
    return this.algod.getTransactionParams().do();
  }

  async waitForConfirmation(txId: string): Promise<Record<string, any>> {
    const timeout = 10;
    const status = await this.algod.status().do();
    if (status === undefined) {
      throw new Error('Unable to get node status');
    }

    const startround = status['last-round'] + 1;
    let currentround = startround;

    while (currentround < startround + timeout) {
      const pendingInfo = await this.algod
        .pendingTransactionInformation(txId)
        .do();
      if (pendingInfo !== undefined) {
        if (
          pendingInfo['confirmed-round'] !== null &&
          pendingInfo['confirmed-round'] > 0
        ) {
          return pendingInfo;
        }
        if (
          pendingInfo['pool-error'] != null &&
          pendingInfo['pool-error'].length > 0
        ) {
          throw new Error(
            `Transaction ${txId} rejected: ${pendingInfo['pool-error']}`
          );
        }
      }
      await this.algod.statusAfterBlock(currentround).do();
      currentround += 1;
    }
    throw new Error(
      `Transaction ${txId} not confirmed after ${timeout} rounds!`
    );
  }
}

export { Web3Client };
