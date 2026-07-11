# Complete Setup Guide

## Step-by-Step Setup Instructions

### 1. Supabase Setup

#### Create Account and Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `amoljadhav-website`
   - Database password: (save this)
   - Region: Choose closest to you
5. Wait for project to finish setting up (~2 minutes)

#### Run Database Setup
1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy entire contents of `supabase-setup.sql`
4. Paste into editor
5. Click "Run"
6. Verify tables created: Go to "Table Editor" and see 4 tables

#### Get API Keys
1. Go to Settings > API
2. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Resend Setup (Email)

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email
4. Go to "API Keys"
5. Click "Create API Key"
6. Copy key → `RESEND_API_KEY`
7. Add your email → `CONTACT_EMAIL`

### 3. AI Setup (Choose One)

#### Option A: OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Go to "API Keys"
4. Create new key
5. Copy → `OPENAI_API_KEY`

#### Option B: Anthropic Claude
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account
3. Add credits
4. Go to "API Keys"
5. Create key
6. Copy → `ANTHROPIC_API_KEY`

### 4. Local Development Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your keys
nano .env.local  # or use your preferred editor

# Add profile image
# Place your image at: public/profile.jpg

# Start development server
npm run dev
```

### 5. Test Locally

1. Open http://localhost:3000
2. Check matrix background loads
3. Test chatbot (bottom right)
4. Go to /contact and submit test message
5. Go to /blog (should show empty state)
6. Go to /admin (password: admin123)

### 6. Deploy to Vercel

#### Connect Repository
1. Push code to GitHub:
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

#### Add Environment Variables
1. In project settings, go to "Environment Variables"
2. Add each variable from `.env.local`:
   - Click "Add New"
   - Enter key name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter value
   - Select "Production", "Preview", "Development"
   - Click "Save"
3. Repeat for all variables

#### Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Visit your live site!

### 7. Update Site URL

After deployment:
1. Copy your Vercel URL (e.g., `amoljadhav.vercel.app`)
2. Update in Vercel environment variables:
   - `NEXT_PUBLIC_SITE_URL` → your Vercel URL
3. Redeploy

### 8. Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add `amoljadhav.ninja`
3. Follow DNS setup instructions
4. Wait for verification (~5 minutes)
5. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

## Common Issues

### Issue: Matrix background not showing
- Check browser console for errors
- Ensure JavaScript is enabled
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Chatbot not responding
- Check API key is set correctly
- Verify API has credits/quota
- Check browser network tab for errors

### Issue: Blog posts not loading
- Verify Supabase connection
- Check database tables exist
- Verify RLS policies are set

### Issue: Contact form not working
- Check Supabase table exists
- Verify Resend API key
- Check email domain is verified in Resend

## Security Checklist

Before going live:
- [ ] Change admin password from default
- [ ] Add proper password hashing (bcrypt)
- [ ] Set up rate limiting on API routes
- [ ] Review Supabase RLS policies
- [ ] Enable CORS restrictions
- [ ] Add environment variable validation
- [ ] Set up error monitoring (Sentry)
- [ ] Review and rotate API keys

## Performance Optimization

- Enable Vercel Analytics in project settings
- Add image optimization for blog covers
- Implement caching strategies
- Consider using CDN for static assets
- Enable compression

## Next Steps

1. Write your first blog post
2. Customize the About section
3. Add your Medium RSS feed integration
4. Set up email notifications
5. Implement advanced analytics
6. Add social media meta tags
7. Create sitemap for SEO
8. Add Google Analytics

## Support

For issues or questions:
- Check Next.js docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
- Create GitHub issue in your repo
