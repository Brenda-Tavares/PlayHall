# PlayHall - Deploy Steps

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `playhall`
3. Create repository (don't add any files)

## Step 2: Push Local Files to GitHub

Run these commands in your terminal:

```bash
cd C:\projetos\PlayHall

git init
git add .
git commit -m "Initial PlayHall commit"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/playhall.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Connect Vercel (Frontend)

1. Go to: https://vercel.com
2. Import from GitHub
3. Select "playhall" repository
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = (deixe em branco por agora)
   - `NEXT_PUBLIC_WS_URL` = (deixe em branco por agora)
5. Deploy!

## Step 4: Connect Railway (Backend)

1. Go to: https://railway.app
2. New Project > From GitHub
3. Select "playhall" repository
4. Add environment variables:
   - `MONGODB_URI` = `mongodb+srv://Alabaster:N1c0R0b1n@cluster0.ib5izfa.mongodb.net/?appName=Cluster0`
   - `JWT_SECRET` = `playhall-secret-2024`
   - `FRONTEND_URL` = (URL do Vercel depois do deploy)
   - `PORT` = `4000`

## Step 5: Connect It All Together

1. After Vercel deploys, copy the URL
2. Add that URL to Railway's FRONTEND_URL
3. Add the Railway URL to Vercel's API variables

---

**Ready!**