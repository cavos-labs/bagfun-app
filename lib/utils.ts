import { ERC20_ABI } from "@/app/abis/ERC20";
import { Percent } from "@uniswap/sdk-core";
import { Contract, provider, RpcProvider } from "starknet";

const nodeUrl = "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/dql5pMT88iueZWl7L0yzT56uVk0EBU4L";
const utilProvider = new RpcProvider({ nodeUrl });

export async function getERC20Balance(walletAddress: string, contractAddress: string, decimals: number) {
    try {
        const contract = new Contract(ERC20_ABI, contractAddress, utilProvider);
        const balanceResult = await contract.balance_of(walletAddress);

        // Handle u256 properly - convert to BigInt first, then to number
        let balanceInUnits: number;
        if (typeof balanceResult === 'object' && balanceResult !== null) {
            // Handle u256 struct with low and high parts
            const balanceBigInt = BigInt(balanceResult.low || balanceResult[0] || 0) + 
                                 (BigInt(balanceResult.high || balanceResult[1] || 0) << 128n);
            balanceInUnits = Number(balanceBigInt) / (10 ** decimals);
        } else {
            // Handle simple bigint or number
            const balanceBigInt = BigInt(balanceResult);
            balanceInUnits = Number(balanceBigInt) / (10 ** decimals);
        }
        
        return balanceInUnits;
    } catch (error) {
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