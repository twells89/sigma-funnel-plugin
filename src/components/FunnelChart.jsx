import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

function formatValue(value, format) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  switch (format) {
    case 'Integer': return Math.round(value).toLocaleString()
    case 'Currency ($)':
      if (Math.abs(value) >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
      if (Math.abs(value) >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
      return '$' + value.toFixed(0)
    case 'Thousands (K)': return (value / 1000).toFixed(1) + 'K'
    case 'Millions (M)': return (value / 1000000).toFixed(2) + 'M'
    default:
      if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M'
      if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K'
      return Math.round(value).toLocaleString()
  }
}

const colorSchemes = {
  'Blue Gradient': ['#1e3a5f', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  'Green Gradient': ['#14532d', '#15803d', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  'Purple Gradient': ['#581c87', '#7e22ce', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff'],
  'Orange Gradient': ['#7c2d12', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
  'Multi-Color': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
}

function FunnelChart({
  data, direction, style, colorScheme, showValues, showPercentages,
  showConversion, chartTitle, valueFormat
}) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) setDimensions({ width, height })
      }
    })
    resizeObserver.observe(container)
    const rect = container.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) setDimensions({ width: rect.width, height: rect.height })
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0 || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const isVertical = direction === 'Vertical'
    const isSmooth = style === 'Smooth'
    const margin = isVertical 
      ? { top: 20, right: 140, bottom: 20, left: 140 }
      : { top: 60, right: 20, bottom: 40, left: 20 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    if (width <= 0 || height <= 0) return

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const colors = colorSchemes[colorScheme] || colorSchemes['Blue Gradient']
    const n = data.length

    if (isVertical) {
      const segmentHeight = height / n
      const centerX = width / 2
      const minWidth = width * 0.15 // Minimum width at bottom

      data.forEach((d, i) => {
        const topWidth = Math.max((width * d.percentage) / 100, minWidth)
        const nextPercentage = data[i + 1]?.percentage || (d.percentage * 0.3)
        const bottomWidth = Math.max((width * nextPercentage) / 100, minWidth)
        
        const y = i * segmentHeight
        const color = colors[i % colors.length]

        // Create trapezoid path with touching edges
        let path
        if (isSmooth) {
          const cp = segmentHeight * 0.3
          path = `M ${centerX - topWidth/2} ${y}
                  C ${centerX - topWidth/2} ${y + cp}, 
                    ${centerX - bottomWidth/2} ${y + segmentHeight - cp}, 
                    ${centerX - bottomWidth/2} ${y + segmentHeight}
                  L ${centerX + bottomWidth/2} ${y + segmentHeight}
                  C ${centerX + bottomWidth/2} ${y + segmentHeight - cp},
                    ${centerX + topWidth/2} ${y + cp},
                    ${centerX + topWidth/2} ${y}
                  Z`
        } else {
          path = `M ${centerX - topWidth/2} ${y}
                  L ${centerX - bottomWidth/2} ${y + segmentHeight}
                  L ${centerX + bottomWidth/2} ${y + segmentHeight}
                  L ${centerX + topWidth/2} ${y}
                  Z`
        }

        g.append('path')
          .attr('d', path)
          .attr('fill', color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            d3.select(event.target).attr('opacity', 0.8)
            setTooltip({ x: event.offsetX, y: event.offsetY, data: d })
          })
          .on('mousemove', (event) => {
            setTooltip({ x: event.offsetX, y: event.offsetY, data: d })
          })
          .on('mouseleave', (event) => {
            d3.select(event.target).attr('opacity', 1)
            setTooltip(null)
          })

        // Left labels (category name)
        g.append('text')
          .attr('x', centerX - topWidth/2 - 15)
          .attr('y', y + segmentHeight / 2)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#374151')
          .attr('font-size', '13px')
          .attr('font-weight', '600')
          .text(d.category)

        // Right labels (value and percentage)
        let labelY = y + segmentHeight / 2 - (showValues && showPercentages ? 8 : 0)
        
        if (showValues) {
          g.append('text')
            .attr('x', centerX + topWidth/2 + 15)
            .attr('y', labelY)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#374151')
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .text(formatValue(d.value, valueFormat))
          labelY += 18
        }

        if (showPercentages) {
          g.append('text')
            .attr('x', centerX + topWidth/2 + 15)
            .attr('y', labelY)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#6b7280')
            .attr('font-size', '12px')
            .text(`${d.percentage.toFixed(1)}%`)
        }

        // Conversion rate between segments
        if (showConversion && i > 0) {
          const convColor = d.conversionRate >= 70 ? '#10b981' : d.conversionRate >= 40 ? '#f59e0b' : '#ef4444'
          g.append('text')
            .attr('x', centerX + topWidth/2 + 15)
            .attr('y', y + 8)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .attr('fill', convColor)
            .attr('font-size', '11px')
            .attr('font-weight', '500')
            .text(`↓ ${d.conversionRate.toFixed(1)}%`)
        }
      })
    } else {
      // Horizontal funnel
      const segmentWidth = width / n
      const centerY = height / 2
      const minHeight = height * 0.2

      data.forEach((d, i) => {
        const leftHeight = Math.max((height * d.percentage) / 100, minHeight)
        const nextPercentage = data[i + 1]?.percentage || (d.percentage * 0.3)
        const rightHeight = Math.max((height * nextPercentage) / 100, minHeight)
        
        const x = i * segmentWidth
        const color = colors[i % colors.length]

        let path
        if (isSmooth) {
          const cp = segmentWidth * 0.3
          path = `M ${x} ${centerY - leftHeight/2}
                  C ${x + cp} ${centerY - leftHeight/2},
                    ${x + segmentWidth - cp} ${centerY - rightHeight/2},
                    ${x + segmentWidth} ${centerY - rightHeight/2}
                  L ${x + segmentWidth} ${centerY + rightHeight/2}
                  C ${x + segmentWidth - cp} ${centerY + rightHeight/2},
                    ${x + cp} ${centerY + leftHeight/2},
                    ${x} ${centerY + leftHeight/2}
                  Z`
        } else {
          path = `M ${x} ${centerY - leftHeight/2}
                  L ${x + segmentWidth} ${centerY - rightHeight/2}
                  L ${x + segmentWidth} ${centerY + rightHeight/2}
                  L ${x} ${centerY + leftHeight/2}
                  Z`
        }

        g.append('path')
          .attr('d', path)
          .attr('fill', color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            d3.select(event.target).attr('opacity', 0.8)
            setTooltip({ x: event.offsetX, y: event.offsetY, data: d })
          })
          .on('mousemove', (event) => {
            setTooltip({ x: event.offsetX, y: event.offsetY, data: d })
          })
          .on('mouseleave', (event) => {
            d3.select(event.target).attr('opacity', 1)
            setTooltip(null)
          })

        // Top label (category)
        g.append('text')
          .attr('x', x + segmentWidth / 2)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#374151')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.category)

        // Bottom labels
        if (showValues) {
          g.append('text')
            .attr('x', x + segmentWidth / 2)
            .attr('y', height + 18)
            .attr('text-anchor', 'middle')
            .attr('fill', '#374151')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(formatValue(d.value, valueFormat))
        }

        // Conversion arrows between segments
        if (showConversion && i < n - 1) {
          const nextD = data[i + 1]
          const convColor = nextD.conversionRate >= 70 ? '#10b981' : nextD.conversionRate >= 40 ? '#f59e0b' : '#ef4444'
          g.append('text')
            .attr('x', x + segmentWidth - 5)
            .attr('y', centerY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', convColor)
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .text(`${nextD.conversionRate.toFixed(0)}%→`)
        }
      })
    }
  }, [dimensions, data, direction, style, colorScheme, showValues, showPercentages, showConversion, valueFormat])

  return (
    <div className="funnel-container">
      {chartTitle && <h2 className="chart-title">{chartTitle}</h2>}
      <div className="chart-wrapper" ref={containerRef}>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        {tooltip && (
          <div 
            className="tooltip" 
            style={{ 
              left: Math.min(tooltip.x + 10, dimensions.width - 160), 
              top: Math.max(tooltip.y - 80, 10)
            }}
          >
            <div className="tooltip-title">{tooltip.data.category}</div>
            <div className="tooltip-row">
              <span className="tooltip-label">Value:</span>
              <span className="tooltip-value">{formatValue(tooltip.data.value, valueFormat)}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">% of Total:</span>
              <span className="tooltip-value">{tooltip.data.percentage.toFixed(1)}%</span>
            </div>
            {tooltip.data.conversionRate < 100 && (
              <div className="tooltip-row">
                <span className="tooltip-label">Conversion:</span>
                <span className="tooltip-value">{tooltip.data.conversionRate.toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FunnelChart
