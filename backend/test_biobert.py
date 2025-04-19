from biobert_service import biobert_service, COMPONENT_CONTEXTS

def test_biobert():
    print("Testing BioBERT service...")
    
    # Test with GeneOntology component
    component_name = "GeneOntology"
    context = COMPONENT_CONTEXTS[component_name]
    
    try:
        print(f"Getting explanation for {component_name}...")
        explanation = biobert_service.explain_component(component_name, context)
        print("\nTest successful!")
        print(f"Component: {component_name}")
        print(f"Explanation: {explanation}")
    except Exception as e:
        print(f"\nError occurred: {e}")

if __name__ == "__main__":
    test_biobert() 