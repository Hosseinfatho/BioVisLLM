import React from 'react';
import { Select } from 'antd';

const ModelSelector = ({ onModelChange }) => {
  const models = [
    { value: 'biobert', label: 'BioBERT' },
    { value: 'gemini', label: 'Gemini' },
    // { value: 'gpt', label: 'GPT (Coming Soon)', disabled: true }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '20px',
      zIndex: 1000
    }}>
      <Select
        defaultValue="biobert"
        style={{ width: 150 }}
        options={models}
        onChange={onModelChange}
      />
    </div>
  );
};

export default ModelSelector; 