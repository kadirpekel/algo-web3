import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import {
  useWeb3,
  ellipseAddress,
  formatBigNumWithDecimals
} from 'algo-web3';
import algosdk, { TransactionLike, SuggestedParams } from 'algosdk';

const sample_scenario = (
  signer: string,
  suggestedParams: SuggestedParams
): TransactionLike[] => [
  algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: signer,
    to: 'TEO4BJHFB2CA5IPDB6VYQ5Q7PGJCFWYSPQASKFHBVA67CKZGT56CIRJRAQ',
    note: new Uint8Array(Buffer.from('example note 1')),
    amount: 100000,
    suggestedParams,
  }),
  algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: signer,
    to: '7N37TH3QOH3KJRTLL6RHNQD7BZPT56FA6M4SH2GX4AIXDTKWSYM7ASKZWQ',
    note: new Uint8Array(Buffer.from('example note 1')),
    amount: 100000,
    suggestedParams,
  }),
];

const Home: NextPage = () => {
  const [balance, setBalance] = useState(0);
  const { web3 } = useWeb3();

  useEffect(() => {
    if (web3.wallet.isConnected()) {
      web3
        .fetchAccountInformation()
        .then((value: Record<string, any>) => setBalance(value.amount));
    }
  }, [web3]);

  const makePayment = async () => {
    const account = web3.wallet.getAccount();
    if (account != null) {
      const suggestedParams = await web3.getSuggestedParams();
      const res2 = await web3.sendGroupTransations(
        sample_scenario(account, suggestedParams)
      );
      console.log(res2);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          Select Algorand Network:{' '}
          <select
            value={web3.currentNetworkIndex}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              web3.switchNetwork(parseInt(e.target.value))
            }
          >
            {web3.networks.map((network, i) => {
              return (
                <option value={i} key={i}>
                  {network.name}
                </option>
              );
            })}
          </select>
        </div>
        <hr />
        <h1 className={styles.title}>
          Welcome to{' '}
          <a href="https://github.com/kadirpekel/algo-web3">Algo-Web3</a> Demo
        </h1>

        <p className={styles.description}>
          Get started by connecting your wallet:{' '}
          {web3.wallet.isConnected() ? (
            <button onClick={() => web3.wallet.disconnect()}>Disconnect</button>
          ) : (
            <button onClick={() => web3.wallet.connect()}>
              Connect your Algorand Wallet
            </button>
          )}
        </p>
        {web3.wallet.isConnected() && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2>Wallet Address:</h2>
              <p>{ellipseAddress(web3.wallet.getAccount())}</p>
            </div>

            <div className={styles.card}>
              <h2>Balance</h2>
              <p>{formatBigNumWithDecimals(BigInt(balance), 2)} Algos</p>
            </div>
            <div className={styles.card}>
              <h2>Mint</h2>
              <p>
                <button onClick={makePayment}>Perform Txn</button>
              </p>
            </div>
            <div className={styles.card}>
              <h2>Burn</h2>
              <p>
                <button onClick={makePayment}>Perform Txn</button>
              </p>
            </div>
            <div className={styles.card}>
              <h2>Swap Algos</h2>
              <p>
                <button onClick={makePayment}>Perform Txn</button>
              </p>
            </div>
            <div className={styles.card}>
              <h2>Swap Assets</h2>
              <p>
                <button onClick={makePayment}>Perform Txn</button>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
