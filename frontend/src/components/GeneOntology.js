import React from 'react';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const GeneOntology = () => {
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ComponentBanner title="Gene Ontology (GO) Terms / Pathways" />
        <ComponentExplanation componentName="GeneOntology" />
      </div>
      <div style={{ padding: '20px' }}>
        {/* Content will go here */}
      </div>
    </div>
  );
};

export default GeneOntology; 