import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function PriceComparisonChart({ electricityData, gasData }) {
  const isDark = document.documentElement.classList.contains('dark')

  const data = {
    labels: ['Current', 'Average', 'High', 'Low'],
    datasets: [
      {
        label: 'Electricity (£/kWh)',
        data: [
          electricityData?.current || 0,
          electricityData?.average || 0,
          electricityData?.high || 0,
          electricityData?.low || 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Gas (£/kWh)',
        data: [
          gasData?.current || 0,
          gasData?.average || 0,
          gasData?.high || 0,
          gasData?.low || 0,
        ],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: '#f97316',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500',
          },
          color: isDark ? '#F5EDEB' : '#333333',
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1E1B1A' : '#ffffff',
        titleColor: isDark ? '#F5EDEB' : '#333333',
        bodyColor: isDark ? '#BBAAA4' : '#7C7C7C',
        borderColor: isDark ? '#AE613A33' : '#AE613A33',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += '£' + context.parsed.y.toFixed(4)
            }
            return label
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#BBAAA4' : '#7C7C7C',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: isDark ? 'rgba(174, 97, 58, 0.1)' : 'rgba(174, 97, 58, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#BBAAA4' : '#7C7C7C',
          font: {
            size: 11,
          },
          callback: function(value) {
            return '£' + value.toFixed(4)
          },
        },
      },
    },
  }

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  )
}

export default PriceComparisonChart

