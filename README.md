# Workout Tracker

A modern, full-featured workout tracking application built with Next.js, TypeScript, and MongoDB. Track your workouts, monitor progress with detailed statistics and visualizations, and maintain workout streaks.

## Features

### **Dashboard & Statistics**

- **Quick Stats Overview**: Current workout streak, weekly progress, and monthly comparisons
- **Body Weight Tracking**: Monitor body weight trends over time
- **Session Analytics**: Total sessions, average body weight (30-day), and workout frequency
- **Top Exercises**: View your most used exercises and personal records

### **Workout Logging**

- **Session Management**: Create, view, edit, and delete workout sessions
- **Exercise Tracking**: Log exercises with sets, reps, and weights
- **Workout Types**: Support for Push, Pull, Legs, Full Body, Upper, and Lower body workouts
- **Date Selection**: Calendar picker for workout dates
- **Body Weight Recording**: Track body weight with each session

### **Progress Visualization**

- **Trend Charts**: Visual progress tracking for individual exercises
- **Volume Tracking**: Monitor workout volume over time
- **Interactive Charts**: Built with Recharts for responsive data visualization
- **Exercise Selection**: Choose from your exercise database to view progress

### **Calendar Integration**

- **Workout Calendar**: Visual calendar showing workout days
- **Date Filtering**: Filter sessions by specific dates
- **Session History**: Browse all past workouts with filtering options

### **Technical Features**

- **Real-time Caching**: Smart caching system for optimal performance
- **Responsive Design**: Works seamlessly on desktop and mobile
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Dark/Light Theme**: Theme support with next-themes

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd workout-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/workout-tracker
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workout-tracker
   ```

4. **Start MongoDB**

   Make sure MongoDB is running on your system or update the connection string in `.env.local`.

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## API Endpoints

### Sessions

- `GET /api/sessions` - Retrieve all workout sessions
- `POST /api/sessions` - Create a new workout session
- `GET /api/sessions/[id]` - Get a specific session
- `DELETE /api/sessions/[id]` - Delete a session
- `GET /api/sessions/dates` - Get available workout dates
- `GET /api/sessions/last` - Get the most recent session

### Exercises

- `GET /api/exercises` - Get all exercise names
- `GET /api/exercises/trend` - Get exercise trend data

### Statistics

- `GET /api/stats` - Get comprehensive workout statistics

### Session Data Structure

```typescript
interface Session {
  _id: string;
  date: string; // ISO date string
  workoutType: "Push" | "Pull" | "Legs" | "Full Body" | "Upper" | "Lower";
  bodyWeight?: number;
  workout: Array<{
    name: string;
    sets: Array<{
      weight: number;
      reps: number;
    }>;
  }>;
}
```

## Project Structure

```
workout-tracker/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── sessions/     # Session pages
│   │   ├── page.tsx      # Dashboard
│   │   └── layout.tsx    # App layout
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── WorkoutCalendar.tsx
│   │   ├── WorkoutTabs.tsx
│   │   ├── TrendChart.tsx
│   │   └── QuickStats.tsx
│   └── lib/             # Utilities and configurations
├── public/              # Static assets
└── package.json
```

## Key Components

- **Dashboard (`/`)**: Main overview with stats, calendar, and trend charts
- **Sessions (`/sessions`)**: List and manage all workout sessions
- **Log Session (`/sessions/log`)**: Create new workout sessions
- **Session Details (`/sessions/[id]`)**: View individual session details

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod validation
- **Database**: MongoDB with native driver
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.
