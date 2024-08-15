import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/Pedidos.module.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPedido, setEditingPedido] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newPedido, setNewPedido] = useState({
    description: '',
    totalValue: '',
    shippingDate: '',
    expectedDeliveryDate: '',
    state: '',
    nInstallments: '',
    fkUserId: '',
    fkClientId: ''
  });
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://localhost:5188/Order');
        setPedidos(response.data);
        console.log('Pedidos:', response.data); // Debug
      } catch (err) {
        setError('Erro ao carregar os pedidos');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5188/User');
        setUsers(response.data);
        console.log('Users:', response.data); // Debug
      } catch (err) {
        setError('Erro ao carregar os usuários');
      }
    };

    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5188/Client');
        setClients(response.data);
        console.log('Clients:', response.data); // Debug
      } catch (err) {
        setError('Erro ao carregar os clientes');
      }
    };

    fetchPedidos();
    fetchUsers();
    fetchClients();
  }, []);

  const formatDate = (date) => {
    return date ? new Date(date).toISOString() : '';
  };

  const handleInputChange = (field, value) => {
    setEditingPedido((prevPedido) => ({
      ...prevPedido,
      [field]: value
    }));
  };

  const handleNewInputChange = (field, value) => {
    setNewPedido((prevPedido) => ({
      ...prevPedido,
      [field]: value
    }));
  };

  const handleSave = async (pedidoId) => {
    try {
      const formattedPedido = {
        ...editingPedido,
        shippingDate: formatDate(editingPedido.shippingDate),
        expectedDeliveryDate: formatDate(editingPedido.expectedDeliveryDate)
      };

      await axios.put(`http://localhost:5188/Order/${pedidoId}`, formattedPedido);
      const response = await axios.get('http://localhost:5188/Order');
      setPedidos(response.data);
      setEditingPedido(null); // Limpa o pedido em edição
    } catch (err) {
      setError('Erro ao salvar pedido');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5188/Order/${id}`);
      setPedidos((prevPedidos) => prevPedidos.filter((pedido) => pedido.id !== id));
    } catch (err) {
      setError('Erro ao excluir pedido');
    }
  };

  const handleEdit = (pedido) => {
    setEditingPedido(pedido);
  };

  const handleCreate = async () => {
    try {
      const formattedPedido = {
        ...newPedido,
        shippingDate: formatDate(newPedido.shippingDate),
        expectedDeliveryDate: formatDate(newPedido.expectedDeliveryDate)
      };

      await axios.post('http://localhost:5188/Order', formattedPedido);
      const response = await axios.get('http://localhost:5188/Order');
      setPedidos(response.data);
      setNewPedido({
        description: '',
        totalValue: '',
        shippingDate: '',
        expectedDeliveryDate: '',
        state: '',
        nInstallments: '',
        fkUserId: '',
        fkClientId: ''
      });
      setShowForm(false);
    } catch (err) {
      setError('Erro ao criar pedido');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pedidos</h1>
        <button onClick={() => setShowForm(true)}>Criar Pedido</button>
      </div>
      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingPedido ? 'Editar Pedido' : 'Criar Pedido'}</h2>
          <div className={styles.form}>
            <input
              type="text"
              placeholder="Descrição"
              value={editingPedido ? editingPedido.description : newPedido.description}
              onChange={(e) => (editingPedido ? handleInputChange('description', e.target.value) : handleNewInputChange('description', e.target.value))}
            />
            <input
              type="number"
              placeholder="Valor Total"
              value={editingPedido ? editingPedido.totalValue : newPedido.totalValue}
              onChange={(e) => (editingPedido ? handleInputChange('totalValue', e.target.value) : handleNewInputChange('totalValue', e.target.value))}
            />
            <input
              type="datetime-local"
              placeholder="Data de Envio"
              value={editingPedido ? editingPedido.shippingDate?.split('T')[0] + 'T' + (editingPedido.shippingDate.split('T')[1] || '00:00:00') : newPedido.shippingDate?.split('T')[0] + 'T' + (newPedido.shippingDate.split('T')[1] || '00:00:00')}
              onChange={(e) => (editingPedido ? handleInputChange('shippingDate', e.target.value) : handleNewInputChange('shippingDate', e.target.value))}
            />
            <input
              type="datetime-local"
              placeholder="Data de Entrega Esperada"
              value={editingPedido ? editingPedido.expectedDeliveryDate?.split('T')[0] + 'T' + (editingPedido.expectedDeliveryDate.split('T')[1] || '00:00:00') : newPedido.expectedDeliveryDate?.split('T')[0] + 'T' + (newPedido.expectedDeliveryDate.split('T')[1] || '00:00:00')}
              onChange={(e) => (editingPedido ? handleInputChange('expectedDeliveryDate', e.target.value) : handleNewInputChange('expectedDeliveryDate', e.target.value))}
            />
            <input
              type="text"
              placeholder="Estado"
              value={editingPedido ? editingPedido.state : newPedido.state}
              onChange={(e) => (editingPedido ? handleInputChange('state', e.target.value) : handleNewInputChange('state', e.target.value))}
            />
            <input
              type="number"
              placeholder="Número de Parcelas"
              value={editingPedido ? editingPedido.nInstallments : newPedido.nInstallments}
              onChange={(e) => (editingPedido ? handleInputChange('nInstallments', e.target.value) : handleNewInputChange('nInstallments', e.target.value))}
            />
            <select
              value={editingPedido ? editingPedido.fkUserId : newPedido.fkUserId}
              onChange={(e) => (editingPedido ? handleInputChange('fkUserId', e.target.value) : handleNewInputChange('fkUserId', e.target.value))}
            >
              <option value="">Selecione o Usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <select
              value={editingPedido ? editingPedido.fkClientId : newPedido.fkClientId}
              onChange={(e) => (editingPedido ? handleInputChange('fkClientId', e.target.value) : handleNewInputChange('fkClientId', e.target.value))}
            >
              <option value="">Selecione o Cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {editingPedido ? (
              <div>
                <button onClick={() => handleSave(editingPedido.id)}>Salvar</button>
                <button onClick={() => setEditingPedido(null)}>Cancelar</button>
              </div>
            ) : (
              <button onClick={handleCreate}>Criar</button>
            )}
          </div>
          <button onClick={() => setShowForm(false)}>Fechar Formulário</button>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor Total</th>
              <th>Data de Envio</th>
              <th>Data de Entrega Esperada</th>
              <th>Estado</th>
              <th>Número de Parcelas</th>
              <th>Usuário</th>
              <th>Cliente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{editingPedido?.id === pedido.id ? (
                  <input
                    type="text"
                    value={editingPedido.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                ) : (
                  pedido.description
                )}</td>
                <td>{editingPedido?.id === pedido.id ? (
                  <input
                    type="number"
                    value={editingPedido.totalValue}
                    onChange={(e) => handleInputChange('totalValue', e.target.value)}
                  />
                ) : (
                  pedido.totalValue
                )}</td>
                <td>{editingPedido?.id === pedido.id ? (
                  <input
                    type="datetime-local"
                    value={editingPedido.shippingDate?.split('T')[0] + 'T' + (editingPedido.shippingDate.split('T')[1] || '00:00:00')}
                    onChange={(e) => handleInputChange('shippingDate', e.target.value)}
                  />
                ) : (
                  pedido.shippingDate
                )}</td>
                <td>{editingPedido?.id === pedido.id ? (
                  <input
                    type="datetime-local"
                    value={editingPedido.expectedDeliveryDate?.split('T')[0] + 'T' + (editingPedido.expectedDeliveryDate.split('T')[1] || '00:00:00')}
                    onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                  />
                ) : (
                  pedido.expectedDeliveryDate
                )}</td>
                <td>{editingPedido?.id === pedido.id ? (
                  <input
                    type="text"
                    value={editingPedido.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                ) : (
                  pedido.state
                )}</td>
                <td>{editingPedido?.id === pedido.id ? (
                  <input
                    type="number"
                    value={editingPedido.nInstallments}
                    onChange={(e) => handleInputChange('nInstallments', e.target.value)}
                  />
                ) : (
                  pedido.nInstallments
                )}</td>
                <td>
                  {editingPedido?.id === pedido.id ? (
                    <select
                      value={editingPedido.fkUserId}
                      onChange={(e) => handleInputChange('fkUserId', e.target.value)}
                    >
                      <option value="">Selecione o Usuário</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  ) : (
                    users.find((user) => user.id === pedido.fkUserId)?.username
                  )}
                </td>
                <td>
                  {editingPedido?.id === pedido.id ? (
                    <select
                      value={editingPedido.fkClientId}
                      onChange={(e) => handleInputChange('fkClientId', e.target.value)}
                    >
                      <option value="">Selecione o Cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    clients.find((client) => client.id === pedido.fkClientId)?.name
                  )}
                </td>
                <td>
                  {editingPedido?.id === pedido.id ? (
                    <div>
                      <button onClick={() => handleSave(pedido.id)}>Salvar</button>
                      <button onClick={() => setEditingPedido(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => handleEdit(pedido)}>Editar</button>
                      <button onClick={() => handleDelete(pedido.id)}>Excluir</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pedidos;
