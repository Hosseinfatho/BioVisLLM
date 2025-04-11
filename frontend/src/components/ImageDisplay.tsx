import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper } from '@mui/material';
import * as d3 from 'd3';

interface ImageDisplayProps {
  selectedSample: string;
  onRegionSelect: (region: any) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ selectedSample, onRegionSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectionBox, setSelectionBox] = useState<any>(null);

  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !dimensions.height) return;

    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove();

    // Add image
    svg.append('image')
      .attr('href', `/samples/${selectedSample}.jpg`)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add selection rectangle
    const selection = svg.append('rect')
      .attr('class', 'selection-box')
      .attr('fill', 'rgba(0, 123, 255, 0.2)')
      .attr('stroke', '#007bff')
      .attr('stroke-width', 2)
      .style('display', 'none');

    // Mouse event handlers
    svg.on('mousedown', (event) => {
      const [x, y] = d3.pointer(event);
      setIsDrawing(true);
      setSelectionBox({ x, y, width: 0, height: 0 });
      
      selection
        .attr('x', x)
        .attr('y', y)
        .style('display', 'block');
    });

    svg.on('mousemove', (event) => {
      if (!isDrawing) return;
      
      const [x, y] = d3.pointer(event);
      const width = x - selectionBox.x;
      const height = y - selectionBox.y;
      
      selection
        .attr('width', Math.abs(width))
        .attr('height', Math.abs(height))
        .attr('x', width < 0 ? x : selectionBox.x)
        .attr('y', height < 0 ? y : selectionBox.y);
    });

    svg.on('mouseup', () => {
      if (!isDrawing) return;
      
      setIsDrawing(false);
      const bbox = selection.node()?.getBBox();
      
      if (bbox) {
        onRegionSelect({
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height
        });
      }
    });

    return () => {
      svg.on('mousedown', null);
      svg.on('mousemove', null);
      svg.on('mouseup', null);
    };
  }, [selectedSample, dimensions, isDrawing, selectionBox, onRegionSelect]);

  return (
    <Paper elevation={3} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ cursor: 'crosshair' }}
        />
      </Box>
    </Paper>
  );
};

export default ImageDisplay; 