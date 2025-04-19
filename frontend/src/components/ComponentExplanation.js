import React from 'react';
import { Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const ComponentExplanation = ({ title, explanation }) => {
    return (
        <Popover 
            content={
                <div style={{ maxWidth: '300px' }}>
                    <p>{explanation}</p>
                </div>
            }
            title={`What is ${title}?`}
            trigger="click"
        >
            <QuestionCircleOutlined 
                style={{ 
                    marginLeft: '10px', 
                    fontSize: '16px', 
                    color: '#1890ff',
                    cursor: 'pointer'
                }} 
            />
        </Popover>
    );
};

export default ComponentExplanation; 