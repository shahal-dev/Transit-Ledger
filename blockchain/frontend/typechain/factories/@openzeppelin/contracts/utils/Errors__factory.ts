/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  Errors,
  ErrorsInterface,
} from "../../../../@openzeppelin/contracts/utils/Errors";

const _abi = [
  {
    inputs: [],
    name: "FailedCall",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedDeployment",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "MissingPrecompile",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212201b283e935c822c7731e35bbfd9d8aff275ff943e0d060069d9a4c8a183fb146164736f6c63430008140033";

type ErrorsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ErrorsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Errors__factory extends ContractFactory {
  constructor(...args: ErrorsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: string }): Promise<Errors> {
    return super.deploy(overrides || {}) as Promise<Errors>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Errors {
    return super.attach(address) as Errors;
  }
  override connect(signer: Signer): Errors__factory {
    return super.connect(signer) as Errors__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ErrorsInterface {
    return new utils.Interface(_abi) as ErrorsInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Errors {
    return new Contract(address, _abi, signerOrProvider) as Errors;
  }
}
