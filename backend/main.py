import os
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import GPT2Tokenizer, GPT2LMHeadModel

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",  # React dev server origin
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] to allow all (not recommended for prod)
    allow_credentials=True,
    allow_methods=["*"],    # Allow all HTTP methods (GET, POST, OPTIONS, etc)
    allow_headers=["*"],    # Allow all headers
)

# Set device to MPS if available, otherwise CPU
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

# Load tokenizer and model on startup
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2").to(device)
model.eval()  # set model to eval mode

class GenerationRequest(BaseModel):
    prompt: str
    max_length: int = 50

prompt_template = {
    "role": "You are a creative sci-fi storyteller.",
    "task": "Write a short comic scene based on the conflict described.",
    "setting": "The hero is standing alone in outer space.",
    "goal": "Describe what happens next."
}

@app.post("/generate")
async def generate_text(req: GenerationRequest):
    try:
        inputs = tokenizer(req.prompt, return_tensors="pt").to(device)
        output = model.generate(
            **inputs,
            max_length=req.max_length,
            do_sample=True,
            top_p=0.9,
            top_k=50,
            pad_token_id=tokenizer.eos_token_id,
        )
        generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
        return {"generated_text": generated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "API is running on device: " + str(device)}
