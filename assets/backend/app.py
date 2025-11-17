from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from deepface import DeepFace
import json
import os
import uuid
from datetime import datetime
import numpy as np
import logging

# Configurar logging para vermos o que acontece
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Reconhecimento Facial REAL")

# CORS - Permite frontend no Live Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database em memória - AGORA SALVA OS EMBEDDINGS!
facial_database = {}

@app.get("/")
async def root():
    return {
        "message": "✅ API de Reconhecimento Facial REAL funcionando!",
        "status": "online",
        "total_usuarios": len(facial_database)
    }

@app.post("/cadastrar")
async def cadastrar_rosto(
    nome: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        logger.info(f"📸 Tentando cadastrar: {nome}")
        
        # Validar que é imagem
        if not file.content_type.startswith('image/'):
            return {"success": False, "error": "Arquivo deve ser uma imagem"}
        
        # Salvar imagem temporariamente
        temp_path = f"temp_{uuid.uuid4()}.jpg"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info("🔄 Processando com DeepFace...")
        
        try:
            #  EXTRAIR EMBEDDING REAL
            embedding_objs = DeepFace.represent(
                img_path=temp_path,
                model_name="VGG-Face",
                detector_backend="opencv",
                enforce_detection=True
            )
            
            logger.info(f" DeepFace encontrou {len(embedding_objs)} rosto(s)")
            
        except Exception as e:
            logger.error(f" DeepFace erro: {str(e)}")
            os.remove(temp_path)
            return {
                "success": False, 
                "error": f"Nenhum rosto detectado: {str(e)}",
                "dica": "Verifique: iluminação, rosto visível, sem óculos escuros"
            }
        
        if embedding_objs:
            # 🔥 AGORA SALVAMOS O EMBEDDING REAL!
            embedding = embedding_objs[0]['embedding']
            
            # Criar ID único
            user_id = str(uuid.uuid4())
            
            #  SALVAR NO DATABASE COM EMBEDDING COMPLETO
            facial_database[user_id] = {
                "id": user_id,
                "nome": nome,
                "embedding": embedding,  #  AGORA SALVAMOS O EMBEDDING!
                "embedding_size": len(embedding),
                "data_cadastro": datetime.now().isoformat()
            }
            
            logger.info(f" {nome} cadastrado com sucesso! Embedding: {len(embedding)} dimensões SALVAS!")
            
            # Limpar arquivo temporário
            os.remove(temp_path)
            
            return {
                "success": True,
                "message": f" {nome} cadastrado com sucesso!",
                "user_id": user_id,
                "embedding_size": len(embedding),
                "total_cadastrados": len(facial_database)
            }
        else:
            os.remove(temp_path)
            return {"success": False, "error": "Nenhum rosto detectado na imagem"}
            
    except Exception as e:
        logger.error(f"💥 Erro geral: {str(e)}")
        return {"success": False, "error": f"Erro interno: {str(e)}"}

@app.post("/reconhecer")
async def reconhecer_rosto(file: UploadFile = File(...)):
    try:
        logger.info("🔍 Iniciando reconhecimento REAL...")
        
        if not facial_database:
            return {
                "success": False, 
                "message": "❌ Nenhum usuário cadastrado. Cadastre alguém primeiro!",
                "dica": "Use a rota /cadastrar primeiro"
            }
        
        temp_path = f"temp_{uuid.uuid4()}.jpg"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"📊 Comparando com {len(facial_database)} usuários cadastrados...")
        
        melhor_match = None
        menor_distancia = float('inf')
        usuario_reconhecido = None
        
        try:
            embedding_atual_objs = DeepFace.represent(
                img_path=temp_path,
                model_name="VGG-Face",
                detector_backend="opencv",
                enforce_detection=True
            )
            
            if not embedding_atual_objs:
                os.remove(temp_path)
                return {"success": False, "error": "Nenhum rosto detectado na imagem para reconhecimento"}
            
            embedding_atual = np.array(embedding_atual_objs[0]['embedding'])
            logger.info(f" Embedding atual extraído: {len(embedding_atual)} dimensões")
            
        except Exception as e:
            logger.error(f" Erro ao extrair embedding: {str(e)}")
            os.remove(temp_path)
            return {"success": False, "error": f"Erro ao processar imagem: {str(e)}"}
        
        # 🔥 COMPARAR COM CADA USUÁRIO CADASTRADO
        for user_id, user_data in facial_database.items():
            try:
                logger.info(f"🔎 Comparando com {user_data['nome']}...")
                
                # ✅ AGORA TEMOS OS EMBEDDINGS SALVOS - COMPARAR DIRETAMENTE!
                embedding_salvo = np.array(user_data['embedding'])
                
                # 🔥 CALCULAR DISTÂNCIA COSSENO (mais eficiente para reconhecimento facial)
                dot_product = np.dot(embedding_atual, embedding_salvo)
                norm_a = np.linalg.norm(embedding_atual)
                norm_b = np.linalg.norm(embedding_salvo)
                distancia = 1 - (dot_product / (norm_a * norm_b))
                
                logger.info(f"📏 Distância para {user_data['nome']}: {distancia:.4f}")
                
                if distancia < menor_distancia:
                    menor_distancia = distancia
                    usuario_reconhecido = user_data
                    
            except Exception as e:
                logger.warning(f"⚠️ Erro ao comparar com {user_data['nome']}: {str(e)}")
                continue
        
        os.remove(temp_path)
        
        logger.info(f"🎯 Melhor match: {usuario_reconhecido['nome'] if usuario_reconhecido else 'Nenhum'} com distância {menor_distancia:.4f}")
        
        
        threshold = 0.5  
        
        if usuario_reconhecido and menor_distancia < threshold:
            confianca = (1 - menor_distancia) * 100
            
            logger.info(f" RECONHECIDO: {usuario_reconhecido['nome']} com {confianca:.1f}% de confiança")
            
            return {
                "success": True,
                "message": f" RECONHECIDO: {usuario_reconhecido['nome']}",
                "usuario": usuario_reconhecido,
                "confianca": round(confianca, 1),
                "distancia": round(menor_distancia, 4),
                "threshold": threshold,
                "status": "reconhecido"
            }
        else:
            logger.info(" NÃO RECONHECIDO - Distância muito grande")
            return {
                "success": False,
                "message": " Pessoa não reconhecida",
                "usuario": None,
                "distancia": round(menor_distancia, 4) if usuario_reconhecido else None,
                "threshold": threshold,
                "status": "nao_reconhecido",
                "dica": f"Distância {menor_distancia:.4f} > threshold {threshold}"
            }
            
    except Exception as e:
        logger.error(f" Erro no reconhecimento: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {"success": False, "error": f"Erro no reconhecimento: {str(e)}"}

@app.get("/usuarios")
async def listar_usuarios():
    """Lista todos os usuários cadastrados - para debug"""
    usuarios_simplificados = []
    for user_id, user_data in facial_database.items():
        usuarios_simplificados.append({
            "id": user_data["id"],
            "nome": user_data["nome"],
            "embedding_size": user_data["embedding_size"],
            "data_cadastro": user_data["data_cadastro"]
        })
    
    return {
        "success": True,
        "total_usuarios": len(facial_database),
        "usuarios": usuarios_simplificados
    }

@app.get("/debug")
async def debug_info():
    """Informações de debug para entendermos o que está acontecendo"""
    return {
        "database_size": len(facial_database),
        "usuarios": list(facial_database.keys()),
        "timestamp": datetime.now().isoformat(),
        "primeiro_usuario": list(facial_database.values())[0]["nome"] if facial_database else "Nenhum"
    }

@app.delete("/limpar")
async def limpar_database():
    """Limpa todos os usuários - útil para testes"""
    facial_database.clear()
    return {"success": True, "message": " Database limpo!"}

if __name__ == "__main__":
    import uvicorn
    print(" Iniciando servidor de reconhecimento facial REAL...")
    print(" API disponível em: http://localhost:8000")
    print(" Endpoints:")
    print("   GET  /              - Status da API")
    print("   POST /cadastrar     - Cadastrar rosto")
    print("   POST /reconhecer    - Reconhecer rosto") 
    print("   GET  /usuarios      - Listar usuários")
    print("   GET  /debug         - Informações de debug")
    print("   DELETE /limpar      - Limpar database")
    print("")
    print(" AGORA COM EMBEDDINGS REAIS SALVOS!")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)