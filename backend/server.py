from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import re
import os
import subprocess
import json
from process import (
    # get_um_positions_with_clusters, 
    get_hires_image_size,
    get_unique_cell_types,
    get_cell_type_coordinates,
    get_samples,
    get_cell_types,
    get_gene_list,
    get_gene_list_for_cell2cellinteraction,
    get_kosara_data,
    get_selected_region_data,
    get_NMF_GO_data,
    get_cell_cell_interaction_data
    # get_umap_positions_with_clusters,
    # get_gene_list,
    # get_specific_gene_expression
)
from biobert_service import biobert_service, COMPONENT_CONTEXTS
import matplotlib.pyplot as plt
import seaborn as sns
import scanpy as sc
import sys
from functools import lru_cache
import time

# Add the Python directory to the system path for importing DEAPLOG module
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Python'))

from DEAPLOG import run_deaplog_analysis

# Define workspace root for file paths
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Initialize Flask app with static folder
app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Ensure static directories exist for storing figures
os.makedirs(os.path.join(app.static_folder, 'figures'), exist_ok=True)

@app.route('/', methods=['GET'])
def get_helloword():
    """Basic test endpoint"""
    return 'Hello World!'

@app.route('/get_available_samples', methods=['GET'])
def get_available_samples():
    """Get list of available samples"""
    return jsonify(get_samples())

@app.route('/get_hires_image_size', methods=['POST'])
def get_hires_image_size_route():
    """Get high-resolution image size for selected samples"""
    sample_ids = request.json['sample_ids']
    return jsonify(get_hires_image_size(sample_ids))

@app.route('/get_unique_cell_types', methods=['POST'])
def get_unique_cell_types_route():
    """Get unique cell types for selected samples"""
    sample_ids = request.json['sample_ids']
    return jsonify(get_unique_cell_types(sample_ids))

@app.route('/get_tile', methods=['GET'])
def serve_tile():
    """Serve image tiles for visualization"""
    sample_id = request.args.get('sample_id')
    x = request.args.get('x', type=int)
    y = request.args.get('y', type=int)

    if x is None or y is None:
        return jsonify({'error': 'Missing x or y parameters'}), 400

    filename = f"tile_{x*256}_{y*256}.tif"

    processed_sample_id = f"{sample_id}_processed"
    processed_sample_tiles = f"{sample_id}_processed_tiles"
    tile_dir = os.path.join("../Data", processed_sample_id, processed_sample_tiles)

    return send_from_directory(tile_dir, filename)

@app.route('/get_cell_type_coordinates', methods=['POST'])
def get_cell_type_coordinates_route():
    """Get cell type coordinates for selected samples"""
    sample_ids = request.json['sample_ids']
    return jsonify(get_cell_type_coordinates(sample_ids))

@app.route('/get_cell_types', methods=['POST'])
def get_cell_types_route():
    """Get cell types for selected samples"""
    sample_name = request.json['sample_name']
    return jsonify(get_cell_types(sample_name))

@app.route('/get_all_gene_list', methods=['POST'])
def get_all_gene_list():
    """Get list of all genes for selected samples"""
    sample_names = request.json['sample_names']
    return jsonify(get_gene_list(sample_names))

@app.route('/get_cell2cell_gene_list', methods=['POST'])
def get_cell2cell_gene_list_route():
    """Get list of all genes for selected samples"""
    sample_name = request.json['sample_name']
    return jsonify(get_gene_list_for_cell2cellinteraction(sample_name))

@app.route('/get_kosara_data', methods=['POST'])
def get_kosara_data_route():
    """Get Kosara visualization data"""
    sample_ids = request.json['sample_ids']
    gene_list = request.json['gene_list']
    cell_list = request.json['cell_list']
    return jsonify(get_kosara_data(sample_ids, gene_list, cell_list))

@app.route('/get_selected_region_data', methods=['POST'])
def get_selected_region_data_route():
    """Get gene expressiondata for selected regions"""
    sample_id = request.json['sample_id']
    cell_list = request.json['cell_list']
    return jsonify(get_selected_region_data(sample_id, cell_list))

@app.route('/get_NMF_GO_data', methods=['POST'])
def get_NMF_GO_data_route():
    """Get NMF GO data"""
    sample_id = request.json['sample_id']
    cell_list = request.json['cell_list']
    return jsonify(get_NMF_GO_data(sample_id, cell_list))

@app.route('/get_cell_cell_interaction_data', methods=['POST'])
def get_cell_cell_interaction_data_route():
    """Get cell-cell interaction data"""
    sample_id = request.json['sample_id']
    receiver = request.json['receiver']
    sender = request.json['sender']
    receiverGene = request.json['receiverGene']
    senderGene = request.json['senderGene']
    cellIds = request.json['cellIds']
    return jsonify(get_cell_cell_interaction_data(sample_id, receiver, sender, receiverGene, senderGene, cellIds))

#################### OLD CODE ####################
@app.route('/get_um_positions_with_clusters', methods=['POST'])
def get_um_positions_with_clusters_route():
    bin_size = request.json['bin_size']
    kmeans = request.json['kmeans']
    return jsonify(get_um_positions_with_clusters(bin_size, kmeans).to_dict(orient='records'))


@app.route('/get_umap_positions', methods=['POST'])
def get_umap_positions_route():
    bin_size = request.json['bin_size']
    kmeans = request.json['kmeans']
    return jsonify(get_umap_positions_with_clusters(bin_size, kmeans).to_dict(orient='records'))


@app.route('/get_gene_name_search')
def get_gene_name_search():
    """Search for genes by name"""
    query = request.args.get('q', '').strip().lower()
    gene_list = get_gene_list()
     # Return the full list if no query is provided
    if not query:
        return jsonify(gene_list)
    pattern = re.compile(re.escape(query), re.IGNORECASE)
    results = [item for item in gene_list if pattern.search(item)]
    
    return jsonify(results)

@app.route('/get_specific_gene_expression', methods=['POST'])
def get_specific_gene_expression_route():
    bin_size = request.json['bin_size']
    gene_name = request.json['gene_name']
    return jsonify(get_specific_gene_expression(bin_size, gene_name).to_dict(orient='records'))
 
@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Run DEAPLOG analysis on the provided data"""
    try:
        # Get parameters from request
        data = request.get_json()
        data_path = data.get('data_path')
        sample_percent = data.get('sample_percent')
        
        if not data_path:
            return jsonify({'error': 'data_path is required'}), 400
            
        # Load data
        adata = sc.read_h5ad(data_path)
        rdata = adata.copy()
        
        # Run analysis
        results = run_deaplog_analysis(rdata, adata, sample_percent)
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/explain_component', methods=['POST'])
def explain_component():
    data = request.json
    component_name = data.get('component_name')
    
    if component_name not in COMPONENT_CONTEXTS:
        return jsonify({"error": "Component not found"}), 404
        
    context = COMPONENT_CONTEXTS[component_name]
    explanation = biobert_service.explain_component(component_name, context)
    
    return jsonify({
        "component": component_name,
        "explanation": explanation
    })

@app.route('/generate_go_analysis', methods=['POST'])
def generate_go_analysis():
    try:
        data = request.json
        selected_cells = data.get('selected_cells', [])[:3]  # Get top 3 cells
        selected_genes = data.get('selected_genes', [])[:3]  # Get top 3 genes
        
        if not selected_cells or not selected_genes:
            return jsonify({"error": "Please select at least one cell and one gene"}), 400
        # Create a context for BioBERT
        context = f"""
        The following analysis focuses on Gene Ontology (GO) Terms and Pathways related to:
        - Selected cell types: {', '.join(selected_cells)}
        - Selected genes: {', '.join(selected_genes)}
                Gene Ontology terms describe gene functions in three categories:
        1. Molecular Function: The biochemical activity of gene products
        2. Biological Process: The larger biological objective accomplished by multiple molecular functions
        3. Cellular Component: Where in the cell the gene product is active
                Pathways represent collections of genes that work together in specific biological processes.
        """# Create a question for BioBERT
        question = f"""
        What are the most significant Gene Ontology terms and pathways associated with these cell types and genes?
        How do these GO terms and pathways relate to the biological functions and processes in these cells?
        """
        
        # Get explanation from BioBERT
        explanation = biobert_service.explain_component("GeneOntology", context)
        
        return jsonify({
            "selected_cells": selected_cells,
            "selected_genes": selected_genes,
            "go_analysis": explanation
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_regional_relationship_analysis(cells, genes, model, tokenizer):
    # ---- Placeholder for your actual BioBERT logic ----
    # 1. Construct a prompt/query using the cells and genes.
    #    Example prompt: "Analyze the relationship between genes [gene1, gene2,...] and cell types [cell1, cell2,...] in the selected region."
    prompt = f"Analyze the relationship between genes {genes} and cell types {cells} in the selected region."

    # 2. Use the tokenizer and model to generate text based on the prompt.
    #    This is a simplified example; actual usage depends on the specific BioBERT task (e.g., question answering, text generation)
    # inputs = tokenizer(prompt, return_tensors="pt")
    # outputs = model.generate(**inputs) # Or model(**inputs) depending on model type
    # generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # --- Replace with your actual BioBERT generation ---
    generated_text = f"Based on BioBERT analysis, the genes {', '.join(genes)} show significant association with cell types {', '.join(cells)} within the context of the selected region. [More detailed BioBERT output specific to regional relationships]."
    # --- End Placeholder ---

    return generated_text

@app.route('/analyze_regional_relationship', methods=['POST'])
def handle_regional_relationship():
    try:
        data = request.get_json()
        if not data or 'cells' not in data or 'genes' not in data:
            return jsonify({"error": "Missing 'cells' or 'genes' in request"}), 400

        cells = data['cells']
        genes = data['genes']

        # Ensure cells and genes are lists (basic validation)
        if not isinstance(cells, list) or not isinstance(genes, list):
             return jsonify({"error": "'cells' and 'genes' must be lists"}), 400

        print(f"Backend received for /analyze_regional_relationship: cells={cells}, genes={genes}")

        # Call your BioBERT analysis function
        # You might need to pass your loaded model/tokenizer here
        analysis_paragraph = get_regional_relationship_analysis(cells, genes, None, None) # Replace None with actual model/tokenizer if needed

        # Return the result as JSON
        return jsonify({"analysis": analysis_paragraph})

    except Exception as e:
        print(f"Error in /analyze_regional_relationship: {e}")
        # Return a generic server error
        return jsonify({"error": "An internal server error occurred"}), 500

# Placeholder analysis functions (replace with actual BioBERT logic)
# -----------------------------------------------------------------

def get_spatial_comparison_analysis(cells, genes, model, tokenizer):
    prompt = f"Analyze the spatial comparison between regions focusing on genes {genes} and cell types {cells}, including statistical significance (p-values, FDR)."
    # --- Replace with your actual BioBERT generation ---
    generated_text = f"BioBERT spatial comparison analysis for genes {', '.join(genes)} and cells {', '.join(cells)}: [Details on expression differences, p-values, FDR]."
    # --- End Placeholder ---
    return generated_text

def get_pathway_enrichment_analysis(cells, genes, model, tokenizer):
    prompt = f"Perform pathway and functional enrichment analysis (GO, KEGG, Reactome) for genes {genes} in the context of cell types {cells}."
    # --- Replace with your actual BioBERT generation ---
    generated_text = f"BioBERT pathway enrichment analysis for genes {', '.join(genes)} and cells {', '.join(cells)}: [Details on enriched GO terms, pathways, and their significance]."
    # --- End Placeholder ---
    return generated_text

def get_coexpression_analysis(cells, genes, model, tokenizer):
    prompt = f"Analyze gene co-expression patterns and potential interactions for genes {genes} across cell types {cells}."
    # --- Replace with your actual BioBERT generation ---
    generated_text = f"BioBERT co-expression and interaction analysis for genes {', '.join(genes)} and cells {', '.join(cells)}: [Details on co-expression clusters and potential interactions]."
    # --- End Placeholder ---
    return generated_text

def get_disease_relevance_analysis(cells, genes, model, tokenizer):
    prompt = f"Analyze the disease or immune relevance of genes {genes} and their spatial patterns in cell types {cells}."
    # --- Replace with your actual BioBERT generation ---
    generated_text = f"BioBERT disease/immune relevance analysis for genes {', '.join(genes)} and cells {', '.join(cells)}: [Details on links to diseases, immune infiltration, etc.]."
    # --- End Placeholder ---
    return generated_text

# New Flask Routes for Analysis Components
# -----------------------------------------

@app.route('/analyze_spatial_comparison', methods=['POST'])
def handle_spatial_comparison():
    try:
        data = request.get_json()
        if not data or 'cells' not in data or 'genes' not in data:
            return jsonify({"error": "Missing 'cells' or 'genes' in request"}), 400
        cells = data['cells']
        genes = data['genes']
        if not isinstance(cells, list) or not isinstance(genes, list):
             return jsonify({"error": "'cells' and 'genes' must be lists"}), 400
        print(f"Backend received for /analyze_spatial_comparison: cells={cells}, genes={genes}")
        # Replace None with actual model/tokenizer if needed
        analysis_paragraph = get_spatial_comparison_analysis(cells, genes, None, None)
        return jsonify({"analysis": analysis_paragraph})
    except Exception as e:
        print(f"Error in /analyze_spatial_comparison: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

@app.route('/analyze_pathway_enrichment', methods=['POST'])
def handle_pathway_enrichment():
    # Note: Frontend might still be using /generate_go_analysis.
    # If so, either update frontend or reuse the logic from generate_go_analysis here.
    # This route provides a dedicated endpoint.
    try:
        data = request.get_json()
        if not data or 'cells' not in data or 'genes' not in data:
            return jsonify({"error": "Missing 'cells' or 'genes' in request"}), 400
        cells = data['cells']
        genes = data['genes']
        if not isinstance(cells, list) or not isinstance(genes, list):
             return jsonify({"error": "'cells' and 'genes' must be lists"}), 400
        print(f"Backend received for /analyze_pathway_enrichment: cells={cells}, genes={genes}")
        # Replace None with actual model/tokenizer if needed
        analysis_paragraph = get_pathway_enrichment_analysis(cells, genes, None, None)
        return jsonify({"analysis": analysis_paragraph})
    except Exception as e:
        print(f"Error in /analyze_pathway_enrichment: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

@app.route('/analyze_coexpression', methods=['POST'])
def handle_coexpression():
    try:
        data = request.get_json()
        if not data or 'cells' not in data or 'genes' not in data:
            return jsonify({"error": "Missing 'cells' or 'genes' in request"}), 400
        cells = data['cells']
        genes = data['genes']
        if not isinstance(cells, list) or not isinstance(genes, list):
             return jsonify({"error": "'cells' and 'genes' must be lists"}), 400
        print(f"Backend received for /analyze_coexpression: cells={cells}, genes={genes}")
        # Replace None with actual model/tokenizer if needed
        analysis_paragraph = get_coexpression_analysis(cells, genes, None, None)
        return jsonify({"analysis": analysis_paragraph})
    except Exception as e:
        print(f"Error in /analyze_coexpression: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

@app.route('/analyze_disease_relevance', methods=['POST'])
def handle_disease_relevance():
    # Note: Frontend might still be using /analyze_logfc.
    # If so, either update frontend or reuse the logic from that endpoint here.
    # This route provides a dedicated endpoint.
    try:
        data = request.get_json()
        if not data or 'cells' not in data or 'genes' not in data:
            return jsonify({"error": "Missing 'cells' or 'genes' in request"}), 400
        cells = data['cells']
        genes = data['genes']
        if not isinstance(cells, list) or not isinstance(genes, list):
             return jsonify({"error": "'cells' and 'genes' must be lists"}), 400
        print(f"Backend received for /analyze_disease_relevance: cells={cells}, genes={genes}")
        # Replace None with actual model/tokenizer if needed
        analysis_paragraph = get_disease_relevance_analysis(cells, genes, None, None)
        return jsonify({"analysis": analysis_paragraph})
    except Exception as e:
        print(f"Error in /analyze_disease_relevance: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

# --- End of new routes and functions ---

if __name__ == "__main__":
    app.run(debug=True, port=5003)
