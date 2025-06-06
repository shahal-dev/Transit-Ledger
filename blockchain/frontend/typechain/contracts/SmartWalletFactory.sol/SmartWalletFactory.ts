/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../common";

export interface SmartWalletFactoryInterface extends utils.Interface {
  functions: {
    "createWallet(bytes32,address,bytes32)": FunctionFragment;
    "deployWalletImplementation()": FunctionFragment;
    "getWalletAddress(bytes32)": FunctionFragment;
    "getWalletOwner(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "predictWalletAddress(bytes32,bytes32)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "walletExists(bytes32)": FunctionFragment;
    "walletImplementation()": FunctionFragment;
    "walletOwners(address)": FunctionFragment;
    "wallets(bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "createWallet"
      | "deployWalletImplementation"
      | "getWalletAddress"
      | "getWalletOwner"
      | "owner"
      | "predictWalletAddress"
      | "renounceOwnership"
      | "transferOwnership"
      | "walletExists"
      | "walletImplementation"
      | "walletOwners"
      | "wallets"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "createWallet",
    values: [BytesLike, string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "deployWalletImplementation",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getWalletAddress",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getWalletOwner",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "predictWalletAddress",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "walletExists",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "walletImplementation",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "walletOwners",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "wallets", values: [BytesLike]): string;

  decodeFunctionResult(
    functionFragment: "createWallet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "deployWalletImplementation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWalletAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWalletOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "predictWalletAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "walletExists",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "walletImplementation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "walletOwners",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "wallets", data: BytesLike): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
    "WalletCreated(bytes32,address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WalletCreated"): EventFragment;
}

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface WalletCreatedEventObject {
  userIdHash: string;
  walletAddress: string;
  owner: string;
}
export type WalletCreatedEvent = TypedEvent<
  [string, string, string],
  WalletCreatedEventObject
>;

export type WalletCreatedEventFilter = TypedEventFilter<WalletCreatedEvent>;

export interface SmartWalletFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SmartWalletFactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    createWallet(
      userIdHash: BytesLike,
      owner: string,
      salt: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    deployWalletImplementation(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    getWalletAddress(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getWalletOwner(
      walletAddress: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    predictWalletAddress(
      userIdHash: BytesLike,
      salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    walletExists(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    walletImplementation(overrides?: CallOverrides): Promise<[string]>;

    walletOwners(arg0: string, overrides?: CallOverrides): Promise<[string]>;

    wallets(arg0: BytesLike, overrides?: CallOverrides): Promise<[string]>;
  };

  createWallet(
    userIdHash: BytesLike,
    owner: string,
    salt: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  deployWalletImplementation(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  getWalletAddress(
    userIdHash: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  getWalletOwner(
    walletAddress: string,
    overrides?: CallOverrides
  ): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  predictWalletAddress(
    userIdHash: BytesLike,
    salt: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  walletExists(
    userIdHash: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  walletImplementation(overrides?: CallOverrides): Promise<string>;

  walletOwners(arg0: string, overrides?: CallOverrides): Promise<string>;

  wallets(arg0: BytesLike, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    createWallet(
      userIdHash: BytesLike,
      owner: string,
      salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    deployWalletImplementation(overrides?: CallOverrides): Promise<string>;

    getWalletAddress(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    getWalletOwner(
      walletAddress: string,
      overrides?: CallOverrides
    ): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    predictWalletAddress(
      userIdHash: BytesLike,
      salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    walletExists(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    walletImplementation(overrides?: CallOverrides): Promise<string>;

    walletOwners(arg0: string, overrides?: CallOverrides): Promise<string>;

    wallets(arg0: BytesLike, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "WalletCreated(bytes32,address,address)"(
      userIdHash?: BytesLike | null,
      walletAddress?: string | null,
      owner?: string | null
    ): WalletCreatedEventFilter;
    WalletCreated(
      userIdHash?: BytesLike | null,
      walletAddress?: string | null,
      owner?: string | null
    ): WalletCreatedEventFilter;
  };

  estimateGas: {
    createWallet(
      userIdHash: BytesLike,
      owner: string,
      salt: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    deployWalletImplementation(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    getWalletAddress(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getWalletOwner(
      walletAddress: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    predictWalletAddress(
      userIdHash: BytesLike,
      salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    walletExists(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    walletImplementation(overrides?: CallOverrides): Promise<BigNumber>;

    walletOwners(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    wallets(arg0: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    createWallet(
      userIdHash: BytesLike,
      owner: string,
      salt: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    deployWalletImplementation(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getWalletAddress(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getWalletOwner(
      walletAddress: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    predictWalletAddress(
      userIdHash: BytesLike,
      salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    walletExists(
      userIdHash: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    walletImplementation(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    walletOwners(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    wallets(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
