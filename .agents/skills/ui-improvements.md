# Skill: UI Improvement Patterns

Use this when improving existing pages to look more production-ready.

## Loading Skeleton (instead of plain "Loading...")
```tsx
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);
```

## Empty State
```tsx
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586..." />
    </svg>
    <p className="text-lg font-medium">{message}</p>
  </div>
);
```

## Status Badge
```tsx
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    BORROWED:  'bg-yellow-100 text-yellow-700',
    RETURNED:  'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};
```

## Stat Card (Dashboard)
```tsx
const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);
```

## Table with Hover
```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
      <th className="px-4 py-3 text-left">Column</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-100">
    {items.map(item => (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">{item.value}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Page Header Pattern
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
    <p className="text-gray-500 mt-1">Subtitle description</p>
  </div>
  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
    + Add New
  </button>
</div>
```

## Priority Order for Visual Impact
1. Loading skeletons (replace plain "Loading..." text)
2. Empty states (replace blank screens)
3. Status badges (color-coded)
4. Table row hover effects
5. Stat cards with icons and colors
6. Page headers with subtitles
7. Smooth transitions on buttons/cards
