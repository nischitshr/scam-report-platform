export default function LoadingSpinner({ size = 'md', label = 'Loading...' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-[#E03535] border-t-transparent rounded-full animate-spin`} />
      {label && <span className="text-sm text-gray-400">{label}</span>}
    </div>
  );
}
