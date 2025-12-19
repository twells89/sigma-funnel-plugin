import React, { useMemo } from 'react'
import { useConfig, useElementData, useElementColumns } from '@sigmacomputing/plugin'
import FunnelChart from './components/FunnelChart'

function App() {
  const config = useConfig()
  const sourceElementId = config?.source
  const sigmaData = useElementData(sourceElementId)
  const columns = useElementColumns(sourceElementId)

  const categoryColumnId = config?.categoryColumn
  const valueColumnId = config?.valueColumn
  const sortOrder = config?.sortOrder || 'By Value (Largest First)'
  const excludeCategories = config?.excludeCategories || ''
  const funnelDirection = config?.funnelDirection || 'Vertical'
  const funnelStyle = config?.funnelStyle || 'Sharp'
  const colorScheme = config?.colorScheme || 'Blue Gradient'
  const showValues = config?.showValues !== false
  const showPercentages = config?.showPercentages !== false
  const showConversion = config?.showConversion !== false
  const chartTitle = config?.chartTitle || ''
  const valueFormat = config?.valueFormat || 'Auto'

  // Parse excluded categories
  const excludedSet = useMemo(() => {
    if (!excludeCategories.trim()) return new Set()
    return new Set(
      excludeCategories
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0)
    )
  }, [excludeCategories])

  const funnelData = useMemo(() => {
    if (!sigmaData || !categoryColumnId || !valueColumnId) return null

    const categories = sigmaData[categoryColumnId]
    const values = sigmaData[valueColumnId]

    if (!categories || !values || !Array.isArray(categories) || !Array.isArray(values)) return null

    // Aggregate by category, preserving order of first occurrence
    const aggregated = {}
    const order = []
    
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      const val = Number(values[i])
      
      if (cat !== null && cat !== undefined && !isNaN(val)) {
        // Check if this category should be excluded
        if (excludedSet.has(String(cat).toLowerCase())) continue
        
        if (!(cat in aggregated)) {
          aggregated[cat] = 0
          order.push(cat)
        }
        aggregated[cat] += val
      }
    }

    // Create data array
    let dataArray = order.map(cat => ({ category: cat, value: aggregated[cat] }))

    // Sort based on user preference
    if (sortOrder === 'By Value (Largest First)') {
      dataArray.sort((a, b) => b.value - a.value)
    } else if (sortOrder === 'By Value (Smallest First)') {
      dataArray.sort((a, b) => a.value - b.value)
    }
    // 'Keep Data Order' - no sorting needed

    // Calculate percentages and conversion rates
    const maxValue = dataArray[0]?.value || 1
    
    return dataArray.map((item, index) => ({
      ...item,
      percentage: (item.value / maxValue) * 100,
      conversionRate: index > 0 ? (item.value / dataArray[index - 1].value) * 100 : 100
    }))
  }, [sigmaData, categoryColumnId, valueColumnId, sortOrder, excludedSet])

  const categoryName = useMemo(() => {
    if (!columns || !categoryColumnId) return 'Stage'
    return columns[categoryColumnId]?.name || 'Stage'
  }, [columns, categoryColumnId])

  if (!sourceElementId || !categoryColumnId || !valueColumnId) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">Configure Data Source</h3>
        <p className="empty-state-message">Select a data source, category column, and value column.</p>
      </div>
    )
  }

  if (!funnelData || funnelData.length === 0) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">No Data Available</h3>
        <p className="empty-state-message">The selected columns have no valid data, or all categories have been excluded.</p>
      </div>
    )
  }

  return (
    <FunnelChart
      data={funnelData}
      direction={funnelDirection}
      style={funnelStyle}
      colorScheme={colorScheme}
      showValues={showValues}
      showPercentages={showPercentages}
      showConversion={showConversion}
      chartTitle={chartTitle || `${categoryName} Funnel`}
      valueFormat={valueFormat}
    />
  )
}

export default App
