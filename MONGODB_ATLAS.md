# PlayHall - MongoDB Atlas Setup (Gratuito)

## Passo 1: Criar Conta MongoDB Atlas

1. Abra: https://www.mongodb.com/cloud/atlas
2. Clique em **"Try Free"** ou **"Start Free"**
3. Crie uma conta (pode usar Google account)

## Passo 2: Criar Cluster

1. apos login, clique em **"Build a Cluster"**
2. Escolha **"Free"** (M0)
3. Escolha provider (AWS, Google, Azure)
4. Escolha regiao mais proxima (idealmente Sao Paulo ou us-east-1)
5. Clique **"Create Cluster"**
6. Aguarde 1-2 minutos para criar

## Passo 3: Configurar Acesso

1. No menu esquerda: **Database Access**
2. Clique **"Add New Database User"**
3. Username: `playhall`
4. Password: `playhall123` (ou outra senha)
5. Role: **"Read and Write to any database"**
6. Clique **"Add User"**

## Passo 4: Rede (Network Access)

1. No menu: **Network Access**
2. Clique **"Add IP Address"**
3. Clique **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Clique **"Confirm"**

## Passo 5: Pegar Connection String

1. Menu: **Database**
2. Clique **"Connect"** no cluster
3. Escolha **"Drivers"**
4. Copie a string (algo como):
```
mongodb+srv://playhall:playhall123@clusterxxxxx.xxxxx.mongodb.net/playhall
```

## Passo 6: Configurar no Projeto

1. Edite o arquivo `backend/.env`
2. Substitua a linha MONGODB_URI pela sua string

Exemplo:
```
MONGODB_URI=mongodb+srv://playhall:playhall123@cluster0.xxxxx.mongodb.net/playhall
```

---

## Quick Setup (se ja tem conta)

1. Faça login em https://www.mongodb.com/cloud/atlas
2. Cluster > Connect > Drivers
3. Copie a string
4. Edite `backend/.env`
5. Substitua `MONGODB_URI=SUA_STRING_AQUI`