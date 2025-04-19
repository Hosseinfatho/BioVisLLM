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
from biobert_service import biobert_service
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

@app.route('/analyze_regional_relationship', methods=['POST'])
def handle_regional_relationship():
    try:
        data = request.json
        question = data.get('question')
        cells = data.get('cells', [])
        genes = data.get('genes', [])

        if not cells or not genes or not question:
            return jsonify({"error": "Missing question, cells, or genes"}), 400

        # Create a slightly more descriptive context
        context = f"Context for Regional Gene-Cell Relationship analysis. Involved cell types: {', '.join(cells)}. Involved genes: {', '.join(genes)}."

        explanation = biobert_service.explain_component(
            component_name="RegionalRelationship",
            context=context, # Pass the more descriptive context
            question=question
        )

        return jsonify({"analysis": explanation})
    except Exception as e:
        app.logger.error(f"Error in regional relationship analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_spatial_comparison', methods=['POST'])
def handle_spatial_comparison():
    try:
        data = request.json
        question = data.get('question')
        cells = data.get('cells', [])
        genes = data.get('genes', [])

        if not cells or not genes or not question:
            return jsonify({"error": "Missing question, cells, or genes"}), 400

        # Create a slightly more descriptive context
        context = f"Context for Spatial Comparison analysis. Involved cell types: {', '.join(cells)}. Involved genes: {', '.join(genes)}."

        explanation = biobert_service.explain_component(
            component_name="SpatialComparison",
            context=context, # Pass the more descriptive context
            question=question
        )

        return jsonify({"analysis": explanation})
    except Exception as e:
        app.logger.error(f"Error in spatial comparison analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_pathway_enrichment', methods=['POST'])
def handle_pathway_enrichment():
    try:
        data = request.json
        question = data.get('question')
        cells = data.get('cells', [])
        genes = data.get('genes', [])

        if not cells or not genes or not question:
            return jsonify({"error": "Missing question, cells, or genes"}), 400

        # Create a slightly more descriptive context
        context = f"Context for Pathway and Functional Enrichment analysis. Involved cell types: {', '.join(cells)}. Involved genes: {', '.join(genes)}."

        explanation = biobert_service.explain_component(
            component_name="PathwayEnrichment",
            context=context, # Pass the more descriptive context
            question=question
        )

        return jsonify({"analysis": explanation})
    except Exception as e:
        app.logger.error(f"Error in pathway enrichment analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_coexpression', methods=['POST'])
def handle_coexpression():
    try:
        data = request.json
        question = data.get('question')
        cells = data.get('cells', [])
        genes = data.get('genes', [])

        if not cells or not genes or not question:
            return jsonify({"error": "Missing question, cells, or genes"}), 400

        # Create a slightly more descriptive context
        context = f"Context for Gene Co-expression and Interaction analysis. Involved cell types: {', '.join(cells)}. Involved genes: {', '.join(genes)}."

        explanation = biobert_service.explain_component(
            component_name="CoExpression",
            context=context, # Pass the more descriptive context
            question=question
        )
        return jsonify({"analysis": explanation})
    except Exception as e:
        app.logger.error(f"Error in coexpression analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_disease_relevance', methods=['POST'])
def handle_disease_relevance():
    try:
        data = request.json
        question = data.get('question')
        cells = data.get('cells', [])
        genes = data.get('genes', [])

        if not cells or not genes or not question:
            return jsonify({"error": "Missing question, cells, or genes"}), 400

        # Create a slightly more descriptive context
        context = f"Context for Disease or Immune Relevance analysis. Involved cell types: {', '.join(cells)}. Involved genes: {', '.join(genes)}."

        explanation = biobert_service.explain_component(
            component_name="DiseaseRelevance",
            context=context, # Pass the more descriptive context
            question=question
        )
        return jsonify({"analysis": explanation})
    except Exception as e:
        app.logger.error(f"Error in disease relevance analysis: {e}")
        return jsonify({"error": str(e)}), 500

# --- End of new routes and functions ---

if __name__ == "__main__":
    app.run(debug=True, port=5003)
