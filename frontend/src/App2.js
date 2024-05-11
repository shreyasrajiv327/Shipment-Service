import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "/Users/shreyasr/Documents/Blockchain/Projects/Shipment-Service/frontend/src/utils/ShipmentService.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0xaa6F3fD88322B6AFAAe0f7B70c21670d3c71438A";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Once wallet is set, get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const initUser = () => {
    // Check if user has MetaMask
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    // Check if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your MetaMask wallet
        </button>
      );
    }

    // If balance is undefined, get the balance
    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>Enter N</p>
        <br></br>
        <br></br>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, [getWallet]); // Add getWallet to the dependency array

  return (
    <main className="container">
      <header>
        <h1>Shreyas R's Project</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: rgb(57, 44, 3);
          color: rgb(231, 186, 65);
        }
      `}</style>
    </main>
  );
}
