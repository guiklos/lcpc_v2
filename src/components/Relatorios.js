import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from '../Styles/Relatorios.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);

const Relatorios = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Todos');
  const [reportType, setReportType] = useState('Pedidos');
  const [clientId, setClientId] = useState(''); 
  const [productType, setProductType] = useState('');
  const [reportData, setReportData] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5188/Client', axiosConfig);
        setClients(response.data);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    };

    fetchClients();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (reportType === 'Pedidos') {
        response = await axios.get('http://localhost:5188/Order/report', {
          params: {
            startDate: startDate ? new Date(startDate).toISOString() : '',
            endDate: endDate ? new Date(endDate).toISOString() : '',
            status: status === 'Todos' ? '' : status,
          },
          ...axiosConfig,
        });
      } else if (reportType === 'Faturamento') {
        response = await axios.get('http://localhost:5188/Order/billing-report', {
          params: {
            startDate: startDate ? new Date(startDate).toISOString() : '',
            endDate: endDate ? new Date(endDate).toISOString() : '',
            clientId: clientId || '',
          },
          ...axiosConfig,
        });
      } else if (reportType === 'Produtos') {
        response = await axios.get('http://localhost:5188/Order/top-sold-products', {
          params: {
            startDate: startDate ? new Date(startDate).toISOString() : '',
            endDate: endDate ? new Date(endDate).toISOString() : '',
            productType: productType || '',
          },
          ...axiosConfig,
        });
      }
      setReportData(response.data);
    } catch (error) {
      setError('Erro ao gerar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (reportType === 'Pedidos') {
      const labels = reportData.map((order) => order.clientName);
      const totalValues = reportData.map((order) => order.totalValue);
      return (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Valor Total por Cliente',
                data: totalValues,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          }}
        />
      );
    } else if (reportType === 'Faturamento') {
      const labels = reportData.map((billing) => billing.clientName);
      const totalOrderValues = reportData.map((billing) => billing.totalOrderValue);
      return (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Faturamento Total por Cliente',
                data: totalOrderValues,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
              },
            ],
          }}
        />
      );
    } else if (reportType === 'Produtos') {
      const labels = reportData.map((product) => product.productName);
      const quantitiesSold = reportData.map((product) => product.quantitySold);
      return (
        <div style={{ width: '50%', margin: 'auto' }}> {/* Ajuste de tamanho para o gráfico */}
          <Pie
            data={{
              labels,
              datasets: [
                {
                  label: 'Quantidade Vendida',
                  data: quantitiesSold,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                  ],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Relatórios</h1>
      </div>

      <form className={styles.form}>
        <label>
          Tipo de Relatório:
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="Pedidos">Relatório de Pedidos</option>
            <option value="Faturamento">Relatório de Faturamento por Cliente</option>
            <option value="Produtos">Relatório de Produtos Mais Vendidos</option>
          </select>
        </label>

        <label>
          Data de Início:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          Data de Fim:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        {reportType === 'Pedidos' && (
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Pending">Pendente</option>
              <option value="Completed">Concluído</option>
              <option value="Shipped">Enviado</option>
            </select>
          </label>
        )}

        {reportType === 'Faturamento' && (
          <label>
            Cliente:
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Todos os Clientes</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {reportType === 'Produtos' && (
          <label>
            Categoria de Produto:
            <select value={productType} onChange={(e) => setProductType(e.target.value)}>
              <option value="">Todas as Categorias</option>
              <option value="Padrao">Padrão</option>
              <option value="Pintado">Pintado</option>
              <option value="Naval">Naval</option>
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={handleGenerateReport}
          className={styles.generateButton}
        >
          Gerar Relatório
        </button>
      </form>

      <div className={styles.resultContainer}>
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : reportData.length > 0 ? (
          <>
            <h2>Resultado do Relatório</h2>
            {renderChart()}
            <br /> <br /> 
            <table className={styles.table}>
              <thead>
                <tr>
                  {reportType === 'Pedidos' ? (
                    <>
                      <th>Nome do Cliente</th>
                      <th>Data do Pedido</th>
                      <th>Status</th>
                      <th>Valor Total</th>
                      <th>Produtos</th>
                    </>
                  ) : reportType === 'Faturamento' ? (
                    <>
                      <th>Nome do Cliente</th>
                      <th>Total de Pedidos</th>
                      <th>Valor Total dos Pedidos</th>
                      <th>Valor Médio por Pedido</th>
                    </>
                  ) : (
                    <>
                      <th>Nome do Produto</th>
                      <th>Categoria</th>
                      <th>Quantidade Vendida</th>
                      <th>Valor Total</th>
                      <th>Valor Médio</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportType === 'Pedidos'
                  ? reportData.map((order) => (
                      <tr key={order.orderId}>

                        <td>{order.clientName}</td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>{order.status}</td>
                        <td>{order.totalValue.toFixed(2)}</td>
                        <td>
                          <ul>
                            {order.products.map((product, index) => (
                              <li key={index}>{product}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))
                  : reportType === 'Faturamento'
                  ? reportData.map((billing) => (
                      <tr key={billing.clientName}>
                        <td>{billing.clientName}</td>
                        <td>{billing.totalOrders}</td>
                        <td>{billing.totalOrderValue.toFixed(2)}</td>
                        <td>{billing.averageOrderValue.toFixed(2)}</td>
                      </tr>
                    ))
                  : reportData.map((product) => (
                      <tr key={product.productName}>
                        <td>{product.productName}</td>
                        <td>{product.productType}</td>
                        <td>{product.quantitySold}</td>
                        <td>{product.totalSalesValue.toFixed(2)}</td>
                        <td>{product.averageSalesValue.toFixed(2)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Nenhum dado encontrado para os critérios selecionados.</p>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
