import { HashConnect } from 'hashconnect';

require("dotenv").config();

const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionRecordQuery,
  ContractCallQuery,
  AccountId,
  Hbar,
} = require("@hashgraph/sdk");

const operatorId = AccountId.fromString(process.env.REACT_APP_ACCOUNT_ID);
const operatorKey = PrivateKey.fromStringED25519(process.env.REACT_APP_PRIVATE_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

function numberToUint256(value) {
  const hex = value.toString(16);
  return `0x${"0".repeat(64 - hex.length)}${hex}`;
}

function Uint8ArrToNumber(Uint8Arr) {
  const length = Uint8Arr.length;

  let buffer = Buffer.from(Uint8Arr);
  const result = buffer.readUIntBE(0, length);

  return result;
}

export async function walletConnect() {
  let hashconnect = new HashConnect();

  let saveData = {
    topic: "",
    pairingString: "",
    privateKey: "",
    pairedWalletData: null,
    pairedAccounts: [],
  };

  let appMetadata = {
    name: "NFTBL",
    description: "Your own football team",
    icon: "./img/football.png"
  };

  const initData = await hashconnect.init(appMetadata);
  saveData.privateKey = initData.privKey;

  const state = await hashconnect.connect();
  saveData.topic = state.topic;

  saveData.pairingString = hashconnect.generatePairingString(state, "testnet", false);

  hashconnect.findLocalWallets();
  hashconnect.connectToLocalWallet(saveData.pairingString);

  return [hashconnect, saveData];
}

export async function getMints() {
  const contractId = '0.0.34817440';

  const getMints = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(100000)
    .setFunction("totalSupply");

  const contractUpdateResult = await getMints.execute(client);
  const amount = Uint8ArrToNumber(contractUpdateResult.bytes);
  return amount;
}

export async function getMintAmount(walletData, accountId, amount) {
	const hashconnect = walletData[0];
	const saveData = walletData[1];
	const provider = hashconnect.getProvider("testnet", saveData.topic, accountId);
	const signer = hashconnect.getSigner(provider);

  const contractId = '0.0.34817440';

  const getMintAmount = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction(
          "mint",
          new ContractFunctionParameters()
          .addUint256(amount)
      )
      .setPayableAmount(new Hbar(0.001 * amount))
      .freezeWithSigner(signer);

  const txResponse = await getMintAmount.executeWithSigner(signer);
  return txResponse;
}

export async function stakePlayer(walletData, accountId, playerId) {
	const hashconnect = walletData[0];
	const saveData = walletData[1];
	const provider = hashconnect.getProvider("testnet", saveData.topic, accountId);
	const signer = hashconnect.getSigner(provider);

  const contractId = '0.0.34817836';

  const stakePlayer = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction(
          "stake",
          new ContractFunctionParameters()
          .addUint256Array([numberToUint256(playerId)])
      )
      .freezeWithSigner(signer);

  const txResponse = await stakePlayer.executeWithSigner(signer);
  return txResponse;
}

export async function unstakePlayer(walletData, accountId, playerId) {
	const hashconnect = walletData[0];
	const saveData = walletData[1];
	const provider = hashconnect.getProvider("testnet", saveData.topic, accountId);
	const signer = hashconnect.getSigner(provider);

  const contractId = '0.0.34817836';

  const unstakePlayer = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction(
          "unstake",
          new ContractFunctionParameters()
          .addUint256Array([numberToUint256(playerId)])
      )
      .freezeWithSigner(signer);

  const txResponse = await unstakePlayer.executeWithSigner(signer);
  return txResponse;
}

export async function getClaimableView(walletData, accountId) {
	const hashconnect = walletData[0];
	const saveData = walletData[1];
	const provider = hashconnect.getProvider("testnet", saveData.topic, accountId);
	const signer = hashconnect.getSigner(provider);

  const contractId = '0.0.34817836';

  const getClaimableView = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("myClaimableView")
      .freezeWithSigner(signer);

  const txResponse = await getClaimableView.executeWithSigner(signer);

	const sec = txResponse.transactionId.validStart.seconds.low;
	const nano = txResponse.transactionId.validStart.nanos.low;
	const txId = `${accountId}@${sec}.${nano}`;
  
  const txRecord = await new TransactionRecordQuery()
    .setTransactionId(txId)
    .execute(client);
  
  const amount = Uint8ArrToNumber(txRecord.contractFunctionResult.bytes);
  return amount;
}

export async function claimBalls(walletData, accountId) {
	const hashconnect = walletData[0];
	const saveData = walletData[1];
	const provider = hashconnect.getProvider("testnet", saveData.topic, accountId);
	const signer = hashconnect.getSigner(provider);

  const contractId = '0.0.34817836';

  const claimBalls = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction("claimBalls")
      .freezeWithSigner(signer);

  const txResponse = await claimBalls.executeWithSigner(signer);
  return txResponse;
}

export async function getStakedPlayers() {
  const contractId = '0.0.34817836';

  const contractCallQuery = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(1000000)
    .setFunction("myStakedPlayers")
    .setQueryPayment(new Hbar(0.000001));

  const contractUpdateResult = await contractCallQuery.execute(client);
  const amount = contractUpdateResult.bytes;
  return amount;
}