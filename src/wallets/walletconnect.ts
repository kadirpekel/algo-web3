import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import { IWallet, IWalletUpdateCallback } from '../web3';

export class WalletConnectClient implements IWallet {
  connector: WalletConnect;
  callbacks: IWalletUpdateCallback[];

  constructor() {
    this.connector = this.createConnector();
    this.callbacks = new Array<IWalletUpdateCallback>();
  }

  isConnected(): boolean {
    return this.connector.connected;
  }

  onUpdate(callback: IWalletUpdateCallback): void {
    this.callbacks.push(callback);
  }

  // Move this functionallity to a abstract class for wallets
  emitUpdate(
    eventName: string,
    error: Error | null,
    payload: Record<string, any>
  ) {
    this.callbacks.forEach((callback) => callback(eventName, error, payload));
  }

  createConnector(): WalletConnect {
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
    });
    connector.on('connect', (error, payload) => {
      this.emitUpdate('connect', error, payload);
    });
    connector.on('disconnect', (error, payload) => {
      this.emitUpdate('disconnect', error, payload);
    });
    connector.on('session_update', (error, payload) => {
      this.emitUpdate('session_update', error, payload);
    });
    return connector;
  }

  getAccount(): string | null {
    if (this.isConnected()) {
      return this.connector.accounts[0];
    }
    return null;
  }

  connect(): void {
    if (!this.isConnected()) {
      this.connector = this.createConnector();
      this.connector.createSession();
    }
  }

  disconnect(): void {
    if (this.isConnected()) {
      this.connector.killSession();
    }
  }
}
