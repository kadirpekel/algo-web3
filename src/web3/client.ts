import algosdk, {
  Algodv2,
  SuggestedParams,
  TransactionLike,
  instantiateTxnIfNeeded,
  waitForConfirmation
} from 'algosdk';
import {
  WalletConnectClient,
  SignTxnParams,
  IWalletTransaction,
} from '../wallets';

export type Network = {
  name?: string;
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
  getAccount: () => string;
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
    return this.algod
      .accountInformation(fallbackAccount)
      .setIntDecoding(algosdk.IntDecoding.BIGINT)
      .do();
  }

  groupTransactions(txns: TransactionLike[]) {
    algosdk.assignGroupID(txns);
  }

  prepareTransactionsToSign(txns: TransactionLike[]): IWalletTransaction[] {
    return txns.map((txnLike) => {
      const txn = instantiateTxnIfNeeded(txnLike);
      return {
        txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString(
          'base64'
        ),
        // Override this method to implement below for more
        message: undefined,
        signers: undefined,
        authAddr: undefined,
      };
    });
  }

  async signTransactions(txns: IWalletTransaction[]): Promise<Uint8Array[]> {
    const signedTxns = await this.wallet.signTxns([txns]);
    return signedTxns.map((r) => {
      if (r == null) {
        throw Error('Signature can not be null');
      }
      return new Uint8Array(Buffer.from(r, 'base64'));
    });
  }

  async submitTransactions(
    signedTxns: Uint8Array[]
  ): Promise<Record<string, any>> {
    return await this.algod.sendRawTransaction(signedTxns).do();
  }

  async sendGroupTransations(txns: TransactionLike[]) {
    this.groupTransactions(txns);
    const txnsToSign = this.prepareTransactionsToSign(txns);
    const txnsToSubmit: Uint8Array[] = await this.signTransactions(txnsToSign);
    const { txId } = await this.submitTransactions(txnsToSubmit);
    this.waitForConfirmation(txId);
  }

  async getSuggestedParams(): Promise<SuggestedParams> {
    return this.algod.getTransactionParams().do();
  }

  async waitForConfirmation(txId: string) {
    return await waitForConfirmation(this.algod, txId, 3);
  }
}

export { Web3Client };
