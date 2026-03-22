@echo off
echo ============================================
echo    PlayHall - Deploy Guide
echo ============================================
echo.
echo Precisamos de 4 contas gratuitas:
echo.
echo 1. GitHub      - https://github.com
echo 2. MongoDB Atlas - https://mongodb.com/cloud/atlas (ja tem!)
echo 3. Vercel      - https://vercel.com (frontend)
echo 4. Railway    - https://railway.app (backend)
echo.
echo ============================================
echo PASSOS PARA DEPLOY:
echo ============================================
echo.
echo [1] Va em: https://github.com/new
echo     - Create a new repository 
echo     - Nome: playhall
echo.
echo [2] Depois va no Railway:
echo     - https://railway.app
echo     - New Project -^> From GitHub
echo     - Selecione o repo "playhall"
echo     - Adicione as variaveis:
echo       * MONGODB_URI: mongodb+srv://Alabaster:N1c0R0b1n@cluster0.ib5izfa.mongodb.net/?appName=Cluster0
echo       * JWT_SECRET: qualquer-senha-secreta
echo       * FRONTEND_URL: (deixe em branco por enquanto)
echo.
echo [3] Va no Vercel:
echo     - https://vercel.com
echo     - Import Project -^> GitHub
echo     - Selecione "playhall"
echo     - Environment Variables:
echo       * NEXT_PUBLIC_API_URL: URL do seu app no Railway
echo       * NEXT_PUBLIC_WS_URL: URL do app (WebSocket)
echo.
echo [4] Copie a URL do Vercol e coloque no FRONTEND_URL do Railway
echo.
echo ============================================
echo O projeto ja esta pronto para deploy!
echo ============================================
echo.
pause