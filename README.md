# Jebshit Admin Portal

A bilingual (Arabic/English) content management system for the Jebshit mobile app. Built with React, TypeScript, and Firebase.

## Features

### 📰 News Management
- Create, edit, and delete news articles
- Upload multiple images (JPG, PNG) via Firebase Storage
- Upload videos to YouTube via Cloud Function (stored as `youtubeIds`)
- Mark articles as urgent
- Draft/Published status workflow

### 🕊️ Martyrs
- Manage martyrs' biographies and profiles
- Upload profile photos
- Record date of martyrdom
- Draft/Published status workflow

### 📖 Sheikh Ragheb Harb Stories
- Publish stories and teachings
- Attach images and YouTube videos
- Draft/Published status workflow

### 🕌 Mosque Activities
- Manage mosque events and activities
- Attach images
- Schedule by date
- Draft/Published status workflow

### 📚 Religious Topics
- Publish religious educational content
- Attach images and YouTube videos
- Draft/Published status workflow

### 💼 Job Opportunities
- Post local employment opportunities
- Specify job type (full-time, part-time, temporary)
- Set location and contact info
- Optional expiry date
- Draft/Published status workflow

### 📷 Village Memories
- Preserve local history and moments
- Attach images and YouTube videos
- Optional memory date
- Draft/Published status workflow

### 🌐 Bilingual Support
- Full Arabic and English interface
- RTL layout support for Arabic
- Language toggle in sidebar

### 🔐 Authentication
- Firebase Authentication (email/password)
- Protected routes for all admin pages
- Role-based access (admin/editor)

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Video Upload:** Firebase Cloud Functions → YouTube API
- **i18n:** i18next (Arabic & English)
- **Routing:** React Router v6

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Firebase and Cloud Function values

# Start development server
npm run dev
```

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layout/       # Dashboard layout
│   └── ui/           # shadcn/ui + custom components
├── contexts/         # Auth context
├── hooks/            # Custom hooks (Firestore, Storage, YouTube)
├── i18n/             # Translations (en.json, ar.json)
├── lib/              # Firebase config, utilities
├── pages/            # Route pages (Dashboard, News, Martyrs, etc.)
└── types/            # TypeScript interfaces
```

## License

Private project.
