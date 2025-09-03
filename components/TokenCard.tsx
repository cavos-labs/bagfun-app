import Image from 'next/image';
import { ApiToken } from '@/lib/tokenService';

interface TokenCardProps {
  token: ApiToken;
}

export default function TokenCard({ token }: TokenCardProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-[#141414] rounded-xl lg:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-[#1a1a1a] transition-colors duration-200 cursor-pointer">
      {/* Left: Token Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl overflow-hidden bg-white flex-shrink-0">
        {token.image_url ? (
          <Image
            src={token.image_url}
            alt={token.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-white font-bold text-lg">
              {token.ticker.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Right: Token Info */}
      <div className="flex flex-col justify-center space-y-1 min-w-0 flex-1">
        <div className="text-white font-regular text-base sm:text-lg lg:text-xl">
          ${token.ticker}
        </div>
        <div className="text-[#a1a1aa] text-sm sm:text-base truncate">
          {token.name}
        </div>
        {token.website && (
          <div className="text-[#a1a1aa] text-xs truncate">
            <a 
              href={token.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              🌐 {token.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {token.contract_address && (
          <div className="text-[#a1a1aa] text-xs truncate">
            <a 
              href={`https://voyager.online/contract/${token.contract_address}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              📄 {token.contract_address.slice(0, 6)}...{token.contract_address.slice(-4)}
            </a>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-white font-regular text-sm sm:text-base">
            Supply: {formatAmount(token.amount)}
          </span>
          <span className="text-[#a1a1aa] text-xs">
            {formatDate(token.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
