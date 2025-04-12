import React, { useState } from 'react';
import { Button, Modal, Spin } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const ComponentExplanation = ({ componentName }) => {
  const [visible, setVisible] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/explain_component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ component_name: componentName }),
      });
      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error fetching explanation:', error);
    }
    setLoading(false);
  };

  const showModal = () => {
    setVisible(true);
    fetchExplanation();
  };

  return (
    <>
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        onClick={showModal}
        style={{ marginLeft: '10px' }}
      />
      <Modal
        title={`${componentName} Explanation`}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <p>{explanation}</p>
        )}
      </Modal>
    </>
  );
};

export default ComponentExplanation; 