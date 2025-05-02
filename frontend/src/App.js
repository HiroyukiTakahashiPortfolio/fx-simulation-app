import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ja } from 'date-fns/locale';
import { _adapters } from 'chart.js';

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';

import {
  CandlestickController,
  CandlestickElement
} from 'chartjs-chart-financial';

import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Chart.jsに各要素登録
ChartJS.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale
);

// date-fnsのロケールを上書き
_adapters._date.override({ locale: ja });

function App() {
  const [chartData, setChartData] = useState(null);

  const fixDate = (str) => {
    return str.replace(/^(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1").replace(" GMT+0900", "+09:00");
  };

  useEffect(() => {
    axios.get('http://localhost:8000/api/chart-data/')
      .then(response => {
        const rawData = response.data;

        const candlestickData = rawData.map(item => ({
          x: new Date(fixDate(item.time)),
          o: parseFloat(item.open),
          h: parseFloat(item.high),
          l: parseFloat(item.low),
          c: parseFloat(item.close)
        }));

        const trimmedData = candlestickData.slice(0, 50); // ← ← ここで切る

        console.log("candlestickData", trimmedData);
        console.log(typeof trimmedData[0].x, trimmedData[0].x instanceof Date);

        setChartData({
          datasets: [
            {
              label: 'USD/JPY 4時間足',
              data: trimmedData,
              parsing: false,
              borderColor: 'rgba(80, 80, 80, 1)',
              color: {
                up: 'rgba(0, 200, 0, 1)',
                down: 'rgba(200, 0, 0, 1)',
                unchanged: 'rgba(80, 80, 80, 1)',
              }
            }
          ]
        });
      })
      .catch(error => {
        console.error('APIエラー:', error);
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'MM/dd HH:mm',
          },
          tooltipFormat: 'yyyy-MM-dd HH:mm'
        },
        ticks: {
          source: 'data',
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: function(value) {
            return new Date(value).toLocaleString('ja-JP', {
              hour: '2-digit',
              day: '2-digit',
              month: '2-digit'
            });
          }
        },
        title: {
          display: true,
          text: '日時',
        }
      },
      y: {
        title: {
          display: true,
          text: '価格（円）'
        }
      }
    },
    datasets: {
      candlestick: {
        barThickness: 6
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '600px', backgroundColor: '#eee', padding: '50px' }}>
      <h2>USD/JPY 4時間足ローソク足チャート</h2>
      {chartData ? (
        <Chart
          type="candlestick"
          data={chartData}
          options={options}
          width={1200}
          height={600}
          style={{ backgroundColor: 'white' }}
        />
      ) : (
        <p>読み込み中...</p>
      )}
    </div>
  );
}

export default App;
