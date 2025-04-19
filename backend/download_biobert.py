from transformers import AutoTokenizer, AutoModel
import os

def download_biobert():
    # Model storage path
    model_path = "models/biobert"
    
    # Ensure directory exists
    os.makedirs(model_path, exist_ok=True)
    
    print("Downloading BioBERT...")
    
    # Download tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained("dmis-lab/biobert-v1.1")
    model = AutoModel.from_pretrained("dmis-lab/biobert-v1.1")
    
    # Save model and tokenizer
    tokenizer.save_pretrained(model_path)
    model.save_pretrained(model_path)
    
    print("BioBERT download completed successfully!")

if __name__ == "__main__":
    download_biobert() 