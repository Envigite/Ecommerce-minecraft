import { Request, Response } from "express";

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history, sessionId, authToken } = req.body;
    const token = authToken || req.cookies?.token
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-API-Key": process.env.FASTAPI_SECRET_KEY ?? "",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fastApiUrl = `${process.env.FASTAPI_URL}/api/v1/chat`; 

    console.log(`📡 Enviando mensaje al backend ${fastApiUrl}...`);

    const fastApiResponse = await fetch(fastApiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        message: message,   
        history: history,
        session_id: sessionId 
      }),
    });

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text();
      throw new Error(`FastAPI Error ${fastApiResponse.status}: ${errorText}`);
    }

    const data = await fastApiResponse.json();
    console.log("🐍 RESPUESTA DE PYTHON:", data);
    res.json(data);

  } catch (error: any) {
    console.error("Error en chatController:", error.message);
    res.status(500).json({ answer: "Lo siento, tuve un problema conectando con el cerebro de la IA." });
  }
};