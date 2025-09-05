import { ERC20_ABI } from "@/app/abis/ERC20";
import { Percent } from "@uniswap/sdk-core";
import { Contract, provider, RpcProvider } from "starknet";

const nodeUrl = "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/dql5pMT88iueZWl7L0yzT56uVk0EBU4L";
const utilProvider = new RpcProvider({ nodeUrl });

export async function getERC20Balance(walletAddress: string, contractAddress: string, decimals: number) {
    try {
        console.log('Fetching balance for:', walletAddress, 'from contract:', contractAddress);
        const contract = new Contract(ERC20_ABI, contractAddress, utilProvider);
        const balanceResult = await contract.balance_of(walletAddress);
        console.log('Raw balance result:', balanceResult);

        const balanceInUnits = Number(balanceResult) / (10 ** decimals);
        console.log('Processed balance:', balanceInUnits);
        return balanceInUnits;
    } catch (error) {
        console.error('Error in getERC20Balance:', error);
        return 0;
    }
}

export const formatPercentage = (percentage: Percent) => {
    const formatedPercentage = +percentage.toFixed(2)
    const exact = percentage.equalTo(new Percent(Math.round(formatedPercentage * 100), 10000))

    return `${exact ? '' : '~'}${formatedPercentage}%`
}

export const toBeHex = (value: bigint) => {
    return `0x${value.toString(16)}`;
}

export function formatAddress(input: string): string {
    // Ensure it starts with 0x
    let hex = input.startsWith("0x") ? input.slice(2) : input;
  
    // Pad with leading zeros until length = 64
    hex = hex.padStart(64, "0");
  
    return "0x" + hex;
  }