# Amol Jadhav Personal Website

A modern, full-stack personal website built with Next.js 14+, featuring a matrix-themed design, blog CMS, AI chatbot, contact form, analytics dashboard, and a terminal runner game.

## Features

- **Matrix-Style Design**: Animated background with neon green accents
- **Blog CMS**: Write and manage blog posts with markdown support
- **AI Chatbot**: Interactive "Ask Amol AI" assistant
- **Contact Form**: Email notifications for new messages
- **Analytics Dashboard**: Track page views and visitor statistics
- **Terminal Runner Game**: Interactive browser game
- **Admin Panel**: Manage content, view messages, and analytics
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Simple password-based (upgradeable to NextAuth.js)
- **Email**: Resend API
- **AI**: OpenAI or Anthropic Claude API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Resend account (for email)
- OpenAI or Anthropic API key (for chatbot)

### 1. Clone and Install

```bash
cd amoljadhav.ninja
npm install
```

### 2. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the SQL script from `supabase-setup.sql`
4. Get your project URL and API keys from Settings > API

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend - get from resend.com)
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your@email.com

# AI Chatbot (choose one)
OPENAI_API_KEY=your_openai_api_key
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key

# Admin
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Add Your Profile Image

Place your profile image at `public/profile.jpg`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your website.

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── blog/          # Blog pages
│   ├── contact/       # Contact page
│   ├── admin/         # Admin dashboard
│   └── page.tsx       # Homepage
├── components/
│   ├── layout/        # Layout components
│   ├── game/          # Game components
│   └── ChatBot.tsx    # AI chatbot
├── lib/
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Utility functions
└── types/
    └── database.ts    # TypeScript types
```

## Admin Access

Default admin credentials (change in production):
- Password: `admin123`

Access the admin panel at `/admin`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables in Vercel

Add all variables from `.env.local` to your Vercel project:
- Project Settings > Environment Variables
- Add each variable separately

## Customization

### Update Profile Information

Edit `app/page.tsx`:
- Name, title, and bio
- Social media links

### Customize Theme Colors

Edit `app/globals.css`:
- Change `--matrix-green: #0aee3c` to your preferred color

### Add Blog Posts

1. Log in to admin panel at `/admin`
2. Click "Create New Blog Post"
3. Write content in markdown
4. Publish

## Features to Implement

- [ ] Rich text editor for blog posts
- [ ] Image upload for blog covers
- [ ] Email notifications via Resend
- [ ] Full AI chatbot integration
- [ ] Advanced analytics
- [ ] RSS feed
- [ ] SEO optimization
- [ ] Social media sharing

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

## License

MIT License - feel free to use for your own projects!
