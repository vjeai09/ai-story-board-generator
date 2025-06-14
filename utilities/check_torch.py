import torch

def check_torch_setup():
    print("PyTorch version:", torch.__version__)
    
    mps_available = torch.backends.mps.is_available()
    mps_built = torch.backends.mps.is_built()
    print(f"MPS (Apple Silicon GPU) available: {mps_available}")
    print(f"MPS built: {mps_built}")
    
    cuda_available = torch.cuda.is_available()
    print(f"CUDA available: {cuda_available}")
    
    if cuda_available:
        print(f"CUDA device count: {torch.cuda.device_count()}")
        print(f"Current CUDA device index: {torch.cuda.current_device()}")
    else:
        print("No CUDA devices found.")
    
if __name__ == "__main__":
    check_torch_setup()
