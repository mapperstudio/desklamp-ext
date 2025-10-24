import { Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-white/30 bg-white/30 backdrop-blur-lg px-4 md:px-10 py-3">
      <div className="flex items-center gap-4 text-gray-900">
        <Zap className="text-gray-900 size-6" />
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em]">
          Calm
        </h1>
      </div>

      <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-linear-to-r from-[#17cfcf] to-[#14b8b8] text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-2xl transition-all duration-300">
          <span className="truncate">Settings</span>
        </button>

        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          data-alt="User profile picture"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0F2xNIndcW67JFzPEbxxNZqkaFWgKoXmXNvZzXUdgdFPxp9FfwdEAfO4kjQ_yEecfZ-kMtopk9MGeA4AfNb2f0voCgFAykpdLEaCpa2Ct287onzbBQ7TNxhwiHpYotRx-kR_b2LPYezBVuQjQbBDviX3axRKW_nNJO-sg6YifISjwx9kioniNtazdLhBZSCb-4KKBxn-TmfVuRVhfD1hD02YtoDF5fp5xf8gC4NoHc6OApRJJlt7F8k_0mX5ulZYUE2vRHVhD9Q")',
          }}
        />
      </div>
    </header>
  );
}
