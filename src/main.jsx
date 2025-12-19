import React from 'react'
import ReactDOM from 'react-dom/client'
import { client } from '@sigmacomputing/plugin'
import App from './App'
import './index.css'

client.config.configureEditorPanel([
  { name: 'source', type: 'element', label: 'Data Source' },
  { name: 'categoryColumn', type: 'column', source: 'source', allowMultiple: false, label: 'Stage/Category Column' },
  { name: 'valueColumn', type: 'column', source: 'source', allowMultiple: false, label: 'Value Column' },
  
  { name: 'displayOptions', type: 'group', label: 'Display Options' },
  { name: 'funnelDirection', type: 'dropdown', source: 'displayOptions', label: 'Direction', values: ['Vertical', 'Horizontal'], defaultValue: 'Vertical' },
  { name: 'funnelStyle', type: 'dropdown', source: 'displayOptions', label: 'Style', values: ['Sharp', 'Smooth'], defaultValue: 'Sharp' },
  { name: 'colorScheme', type: 'dropdown', source: 'displayOptions', label: 'Color Scheme', values: ['Blue Gradient', 'Green Gradient', 'Purple Gradient', 'Orange Gradient', 'Multi-Color'], defaultValue: 'Blue Gradient' },
  { name: 'showValues', type: 'toggle', source: 'displayOptions', label: 'Show Values', defaultValue: true },
  { name: 'showPercentages', type: 'toggle', source: 'displayOptions', label: 'Show Percentages', defaultValue: true },
  { name: 'showConversion', type: 'toggle', source: 'displayOptions', label: 'Show Conversion Rates', defaultValue: true },
  
  { name: 'labelsOptions', type: 'group', label: 'Labels' },
  { name: 'chartTitle', type: 'text', source: 'labelsOptions', label: 'Chart Title' },
  { name: 'valueFormat', type: 'dropdown', source: 'labelsOptions', label: 'Value Format', values: ['Auto', 'Integer', 'Currency ($)', 'Thousands (K)', 'Millions (M)'], defaultValue: 'Auto' },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
