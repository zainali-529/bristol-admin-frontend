import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function PriceHistoryChart({ electricityHistory = [], gasHistory = [], showElectricity = true, showGas = true }) {
  const isDark = document.documentElement.classList.contains('dark')

  // Prepare data
  const labels = electricityHistory.map(entry => {
    const date = new Date(entry.date)
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  })

  const data = {
    labels,
    datasets: [
      showElectricity && {
        label: 'Electricity (£/kWh)',
        data: electricityHistory.map(entry => entry.price),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      showGas && {
        label: 'Gas (£/kWh)',
        data: gasHistory.map(entry => entry.price),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ].filter(Boolean),
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
        mode: 'index',
        intersect: false,
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
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
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
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  )
}

export default PriceHistoryChart

