import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Đăng ký các thành phần ChartJS (Giống như file PlaceBidModal)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Định nghĩa các màu sắc mặc định cho dataset
const defaultColors = [
  { // Dataset 0 (ví dụ: Tín chỉ kiếm được)
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    pointBackgroundColor: '#667eea',
  },
  { // Dataset 1 (ví dụ: Tín chỉ đã bán)
    borderColor: '#f093fb',
    backgroundColor: 'rgba(240, 147, 251, 0.1)',
    pointBackgroundColor: '#f093fb',
  }
];

// Định nghĩa Options (Tùy chỉnh)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#b8bcc8',
        font: {
          family: 'Inter' // Giả sử bạn có font này
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#b8bcc8'
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#b8bcc8'
      }
    }
  }
};

const WalletChart = ({ 
  data = { labels: [], datasets: [] }, // Data thật sẽ được truyền vào đây
  height = '300px'
}) => {

  // Xử lý data: Gán màu sắc và style mặc định cho datasets
  const processedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      ...defaultColors[index % defaultColors.length], // Lấy màu tương ứng
      tension: 0.4,
      fill: true
    }))
  };

  return (
    <div style={{ height, position: 'relative' }}>
      {/* Sử dụng component <Line> của react-chartjs-2.
        Nó sẽ tự động render và update khi prop `data` thay đổi.
        Không cần dùng useEffect hay ref.
      */}
      <Line data={processedData} options={chartOptions} />
    </div>
  );
};

export default WalletChart;