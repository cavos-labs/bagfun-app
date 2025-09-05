import { useRouter } from 'next/navigation';
import { ApiToken } from '@/lib/tokenService';
import OptimizedImage from './OptimizedImage';

interface TokenCardProps {
  token: ApiToken;
}

export default function TokenCard({ token }: TokenCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (token.contract_address) {
      router.push(`/token/${token.contract_address}`);
    }
  };
  
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
    
    // Calculate different time units
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} mins ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-[#141414] rounded-xl lg:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-[#1a1a1a] transition-colors duration-200 cursor-pointer"
    >
      {/* Left: Token Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl overflow-hidden bg-white flex-shrink-0">
        {token.image_url ? (
          <OptimizedImage
            src={token.image_url}
            alt={token.name}
            fill
            className="object-cover rounded-xl lg:rounded-2xl"
            priority={false}
            fallbackComponent={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl">
                <span className="text-white font-bold text-lg">
                  {token.ticker.charAt(0)}
                </span>
              </div>
            }
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
              className="hover:text-white transition-colors duration-200 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {token.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {token.contract_address && (
          <div className="text-[#a1a1aa] text-xs truncate">
            <a 
              href={`https://voyager.online/contract/${token.contract_address}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {token.contract_address.slice(0, 6)}...{token.contract_address.slice(-4)}
            </a>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[#a1a1aa] text-xs">
            {formatDate(token.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
