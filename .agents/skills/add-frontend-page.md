# Skill: Add a New Frontend Page

Use this when adding any new React page or feature to the project.

## File Structure
```
src/features/<feature-name>/
├── api/
│   └── <feature>Api.ts       ← Axios calls
├── types.ts                   ← TypeScript interfaces
├── components/
│   └── <Feature>Card.tsx      ← Reusable sub-components
└── pages/
    └── <Feature>Page.tsx      ← Main page component
```

## Page Template
```tsx
import { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';

const YourPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await yourApi.getAll();
      setData(result);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* content */}
    </div>
  );
};

export default YourPage;
```

## API Client Template
```ts
import axiosClient from '../../../api/axiosClient';
import { YourType } from '../types';

export const yourApi = {
  getAll: async (): Promise<YourType[]> => {
    const res = await axiosClient.get('/your-endpoint');
    return res.data;
  },
  create: async (data: CreateYourType): Promise<YourType> => {
    const res = await axiosClient.post('/your-endpoint', data);
    return res.data;
  },
};
```

## Routing
Add new routes in `src/App.tsx` or wherever the router is configured:
```tsx
<Route path="/your-path" element={
  <ProtectedRoute><YourPage /></ProtectedRoute>
} />
```

## Rules
- Always use `useToast()` for success/error feedback — never `alert()`
- Always show a loading state while fetching
- Always handle errors in catch block with `showToast`
- Use Tailwind utility classes only — no inline styles
- Use `axiosClient` (not raw axios) — it has the JWT interceptor
