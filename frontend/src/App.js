import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ja } from 'date-fns/locale';
import { _adapters } from 'chart.js'; // ← 必須！

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

_adapters._date.override({ locale: ja }); // ← これがないと x軸が描画されない！

ChartJS.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale
);

// Chart.jsに登録
ChartJS.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale
);

function App() {
  const [chartData, setChartData] = useState(null);

  // 文字列のGMT日付をISOフォーマットに変換
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

        console.log("candlestickData", candlestickData);
        console.log(typeof candlestickData[0].x, candlestickData[0].x instanceof Date)

        setChartData({
          datasets: [
            {
              label: 'USD/JPY 4時間足',
              data: candlestickData,
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
          tooltipFormat: 'yyyy-MM-dd HH:mm',
          unit: 'hour'
        },
        adapters: {
          date: {
            locale: ja  // ← ここがキモ
          }
        },
        title: { display: true, text: '日時' }
      },
      y: {
        title: { display: true, text: '価格（円）' }
      }
    }
  };

  return (
    <div style={{ width: '90%', margin: '0 auto', paddingTop: '30px' }}>
      <h2>USD/JPY 4時間足ローソク足チャート</h2>
      {chartData ? <Chart type='candlestick' data={chartData} options={options} /> : <p>読み込み中...</p>}
    </div>
  );
}

export default App;
