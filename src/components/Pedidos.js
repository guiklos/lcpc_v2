import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/Pedidos.module.css';

const Pedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState({
    fkProductId: '',
    fkOrderId: '',
    quantity: '',
    itemValue: ''
  });
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5188/ItemOrder');
        setOrders(response.data);
      } catch (err) {
        setError('Erro ao carregar os pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleInputChange = (id, field, value) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  const handleUpdate = async (id) => {
    const orderToUpdate = orders.find((order) => order.id === id);
    try {
      await axios.put(`http://localhost:5188/ItemOrder/${id}`, orderToUpdate);
      alert('Pedido atualizado com sucesso!');
      setEditingOrderId(null);
    } catch (err) {
      setError('Erro ao atualizar pedido');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5188/ItemOrder/${id}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    } catch (err) {
      setError('Erro ao deletar pedido');
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:5188/ItemOrder', newOrder);
      setNewOrder({
        fkProductId: '',
        fkOrderId: '',
        quantity: '',
        itemValue: ''
      });
      const response = await axios.get('http://localhost:5188/ItemOrder');
      setOrders(response.data);
      setIsAdding(false);
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
      </div>
      <div className={styles.formContainer}>
        <h2>Criar Pedido</h2>
        {isAdding ? (
          <>
            <input
              type="text"
              name="fkProductId"
              placeholder="ID do Produto"
              value={newOrder.fkProductId}
              onChange={(e) => setNewOrder({ ...newOrder, fkProductId: e.target.value })}
            />
            <input
              type="text"
              name="fkOrderId"
              placeholder="ID do Pedido"
              value={newOrder.fkOrderId}
              onChange={(e) => setNewOrder({ ...newOrder, fkOrderId: e.target.value })}
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantidade"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
            />
            <input
              type="number"
              name="itemValue"
              placeholder="Valor do Item"
              value={newOrder.itemValue}
              onChange={(e) => setNewOrder({ ...newOrder, itemValue: e.target.value })}
            />
            <button onClick={handleCreate}>Salvar</button>
            <button onClick={() => setIsAdding(false)}>Cancelar</button>
          </>
        ) : (
          <button onClick={() => setIsAdding(true)}>Adicionar Novo Pedido</button>
        )}
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID do Produto</th>
              <th>ID do Pedido</th>
              <th>Quantidade</th>
              <th>Valor do Item</th>
              <th>Criado Em</th>
              <th>Atualizado Em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <input
                    type="text"
                    value={order.fkProductId}
                    onChange={(e) =>
                      handleInputChange(order.id, 'fkProductId', e.target.value)
                    }
                    disabled={editingOrderId !== order.id}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={order.fkOrderId}
                    onChange={(e) =>
                      handleInputChange(order.id, 'fkOrderId', e.target.value)
                    }
                    disabled={editingOrderId !== order.id}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={order.quantity}
                    onChange={(e) =>
                      handleInputChange(order.id, 'quantity', e.target.value)
                    }
                    disabled={editingOrderId !== order.id}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={order.itemValue}
                    onChange={(e) =>
                      handleInputChange(order.id, 'itemValue', e.target.value)
                    }
                    disabled={editingOrderId !== order.id}
                  />
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}</td>
                <td>
                  {editingOrderId === order.id ? (
                    <>
                      <button onClick={() => handleUpdate(order.id)}>Salvar</button>
                      <button onClick={() => setEditingOrderId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => setEditingOrderId(order.id)}>Editar</button>
                  )}
                  <button onClick={() => handleDelete(order.id)}>Excluir</button>
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
