from transformers import pipeline

generator = pipeline('text-generation', model='gpt2', device=0)  # device=0 uses mps

prompt = "Hello world"
results = generator(
    prompt,
    max_new_tokens=50,  # preferred over max_length for generation
    truncation=True,
    pad_token_id=50256,  # set explicitly to avoid warning
    num_return_sequences=1
)

for i, result in enumerate(results):
    print(f"Generated text {i+1}:")
    print(result['generated_text'])
