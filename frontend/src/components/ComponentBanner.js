import React from 'react';

const ComponentBanner = ({ title }) => {
  return (
    <div style={{
      backgroundColor: '#1890ff',
      padding: '10px 15px',
      borderBottom: '1px solid #e8e8e8',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderRadius: '4px 4px 0 0',
      marginBottom: '10px',
      width: '100%'
    }}>
      <h3 style={{
        margin: 0,
        color: 'black',
        fontSize: '16px',
        fontWeight: '500',
        textAlign: 'left'
      }}>
        {title}
      </h3>
    </div>
  );
};

export default ComponentBanner; 