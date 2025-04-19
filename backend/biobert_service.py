from transformers import AutoTokenizer, AutoModelForQuestionAnswering
import torch
import os

class BioBERTService:
    def __init__(self):
        print("Initializing BioBERT...")
        model_path = os.path.join("models", "biobert")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForQuestionAnswering.from_pretrained(model_path)
        print("BioBERT initialized successfully!")
        
    def explain_component(self, component_name, context, question=None):
        # If no specific question is provided, use the default one
        if question is None:
            question = f"What is {component_name} and how does it work in biological data analysis?"
        
        # Tokenize inputs
        inputs = self.tokenizer(question, context, return_tensors="pt", truncation=True, max_length=512)
        
        # Get model output
        with torch.no_grad():
            outputs = self.model(**inputs)
            
        # Get the answer
        answer_start = torch.argmax(outputs.start_logits)
        answer_end = torch.argmax(outputs.end_logits) + 1
        answer_tokens = inputs["input_ids"][0][answer_start:answer_end]

        # Handle cases where the model returns an empty or non-sensical span
        if answer_start >= answer_end or len(answer_tokens) == 0:
            return "[BioBERT QA could not find an answer in the provided context]"

        answer = self.tokenizer.convert_tokens_to_string(
            self.tokenizer.convert_ids_to_tokens(answer_tokens)
        )

        # Further check if the answer is just padding or special tokens
        if not answer or answer.strip() in [self.tokenizer.cls_token, self.tokenizer.sep_token, self.tokenizer.pad_token]:
             return "[BioBERT QA could not find an answer in the provided context]"

        return answer

# Component contexts
COMPONENT_CONTEXTS = {
    "LogFoldChange": """
    Log Fold Change (LogFC) is a measure of how much a gene's expression changes between two conditions. 
    It's calculated as the logarithm of the ratio of expression values. Positive values indicate upregulation, 
    while negative values indicate downregulation. This metric is crucial for identifying differentially 
    expressed genes in biological studies.
    """,
    
    "StatisticalSignificance": """
    Statistical significance in biological data analysis refers to the probability that observed differences 
    are not due to random chance. P-values and adjusted p-values (FDR) are used to determine this significance. 
    A lower p-value indicates stronger evidence against the null hypothesis, while FDR controls for multiple 
    testing errors in large datasets.
    """,
    
    "GeneOntology": """
    Gene Ontology (GO) terms describe gene functions in three categories: molecular function, biological process, 
    and cellular component. GO analysis helps in understanding the biological meaning of gene sets by identifying 
    enriched terms. Pathways are collections of genes that work together in specific biological processes.
    """,
    
    "GeneRegulation": """
    Gene regulation analysis identifies genes that are upregulated (increased expression) or downregulated 
    (decreased expression) under specific conditions. This helps in understanding how cells respond to different 
    stimuli or conditions, and which biological processes are affected.
    """,
    
    "CoExpressionNetworks": """
    Co-expression networks represent relationships between genes based on their expression patterns across samples. 
    Genes with similar expression patterns are connected, forming clusters that often share biological functions. 
    These networks help in identifying functional modules and understanding gene interactions.
    """
}

# Initialize the service
biobert_service = BioBERTService() 