import { useSignMessage } from 'wagmi';

export function useWalletSign() {
    const { signMessageAsync } = useSignMessage();

    const signAction = async (action: string, resourceId: string) => {
        const timestamp = Date.now();
        const message = `x402-bazaar:${action}:${resourceId}:${timestamp}`;
        const signature = await signMessageAsync({ message });
        return { message, signature };
    };

    return { signAction };
}
