# ============================================
# PLAYHALL - DEPLOY GUIDE
# ============================================

## PRE-REQUISITOS
1. Conta no GitHub
2. Conta no Vercel (frontend)
3. Conta no Railway ou Render (backend)
4. Conta no MongoDB Atlas (banco de dados)

## PASSO 1: MongoDB Atlas
- Ja temos o banco criado: cluster0.ib5izfa.mongodb.net
- Anote a string de conexao completa

## PASSO 2: Deploy BACKEND (Railway)
1. Va em https://railway.app
2. Login com GitHub
3. New Project > From GitHub repo
4. Selecione o repositorio PlayHall
5. Em Variables, adicione:
   - MONGODB_URI = sua string do MongoDB
   - JWT_SECRET = qualquer string segredo
   - FRONTEND_URL = URL do Vercel
   - PORT = 4000
6. Deploy automatico!

## PASSO 3: Deploy FRONTEND (Vercel)
1. Va em https://vercel.com
2. Import GitHub repo
3. Em Environment Variables adicione:
   - NEXT_PUBLIC_API_URL = URL do backend no Railway
   - NEXT_PUBLIC_WS_URL = URL do backend (webSocket)
4. Deploy!

## PASSO 4: CONECTAR
- Copie a URL do Verco e coloque no FRONTEND_URL do backend
- Copie a URL do Railway e coloque no NEXT_PUBLIC do frontend

---

## TESTE FINAL
Abra a URL do Vercel e jogue!