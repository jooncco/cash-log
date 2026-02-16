# Cash Log Frontend

Personal finance tracking application built with Next.js 14, React 18, and TypeScript.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand 4
- **Forms**: React Hook Form 7
- **Charts**: Chart.js 4 + react-chartjs-2
- **i18n**: next-intl 3
- **Icons**: Lucide React
- **PWA**: next-pwa
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20.x LTS
- npm or yarn

### Installation

```bash
cd apps/frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
npm run test:watch
```

## Project Structure

```
apps/frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── transactions/      # Transactions page
│   ├── budgets/          # Budgets page
│   ├── analytics/        # Analytics page
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Root page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   ├── modals/           # Modal components
│   ├── skeletons/        # Skeleton loaders
│   └── errors/           # Error components
├── lib/                   # Utilities and libraries
│   ├── api/              # API client and endpoints
│   └── stores/           # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── messages/              # i18n translation files
└── public/                # Static assets

## Features

### Implemented

- ✅ Dashboard with summary cards
- ✅ Transaction management (list, add, edit, delete)
- ✅ Dark mode toggle
- ✅ Language selection (Korean/English)
- ✅ Responsive design (desktop-focused)
- ✅ API integration with backend
- ✅ State management with Zustand
- ✅ Loading states and error handling

### To Implement

- Budget management
- Analytics and charts
- Tag management
- Data export (CSV, Excel, PDF)
- Offline support (PWA)
- Comprehensive testing

## Environment Variables

Create `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## API Integration

The frontend connects to the backend API at `http://localhost:8080`.

Ensure the backend is running before starting the frontend.

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals
- ARIA labels on interactive elements

## Performance

- Code splitting (route-level + component-level)
- Lazy loading for heavy components
- Image optimization with Next.js Image
- Bundle size < 500KB gzipped
- < 1s initial load time target

## Browser Support

- Chrome (latest 2 versions)
- Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Contributing

1. Follow the existing code patterns
2. Use TypeScript for type safety
3. Apply Tailwind CSS for styling
4. Add data-testid attributes for testing
5. Include ARIA labels for accessibility
6. Write tests for new features

## License

Private project
