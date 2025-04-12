import React from 'react';

const ComponentBanner = ({ title }) => {
  return (
    <div style={{
      backgroundColor: '#f0f2f5',
      padding: '10px 15px',
      borderBottom: '1px solid #e8e8e8',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderRadius: '4px 4px 0 0',
      marginBottom: '10px'
    }}>
      <h3 style={{
        margin: 0,
        color: '#1890ff',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        {title}
      </h3>
    </div>
  );
};

export default ComponentBanner; 