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
    totalValue: 0,
    shippingDate: '',
    expectedDeliveryDate: '',
    state: '',
    nInstallments: '',
    fkUserId: '',
    fkClientId: '',
    items: []
  });
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [itemsOrdem, setItemsOrdem] = useState([]);
  const [products, setProducts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pedidosRes, usersRes, clientsRes, itemsRes, productsRes] = await Promise.all([
          axios.get('http://localhost:5188/Order'),
          axios.get('http://localhost:5188/User'),
          axios.get('http://localhost:5188/Client'),
          axios.get('http://localhost:5188/ItemOrder'),
          axios.get('http://localhost:5188/Product')
        ]);
        setPedidos(pedidosRes.data);
        setUsers(usersRes.data);
        setClients(clientsRes.data);
        setItemsOrdem(itemsRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => date ? new Date(date).toISOString() : '';

  const calculateTotalValue = (items) => items.reduce((total, item) => total + (item.quantity * item.itemValue), 0);

  const handleInputChange = (field, value) => {
    setEditingPedido(prev => ({ ...prev, [field]: value }));
  };

  const handleNewInputChange = (field, value) => {
    setNewPedido(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newPedido.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    const newTotalValue = calculateTotalValue(updatedItems);
    setNewPedido(prev => ({ ...prev, items: updatedItems, totalValue: newTotalValue }));
  };

  const addItem = () => {
    setNewPedido(prev => {
      const newItems = [...prev.items, { fkProductId: '', quantity: 1, itemValue: 0 }];
      return { ...prev, items: newItems, totalValue: calculateTotalValue(newItems) };
    });
  };

  const removeItem = (index) => {
    const updatedItems = newPedido.items.filter((_, i) => i !== index);
    setNewPedido(prev => ({ ...prev, items: updatedItems, totalValue: calculateTotalValue(updatedItems) }));
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
      setEditingPedido(null);
    } catch (err) {
      setError('Erro ao salvar pedido');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5188/Order/${id}`);
      setPedidos(prev => prev.filter(pedido => pedido.id !== id));
      setConfirmDelete(null);
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

      const response = await axios.post('http://localhost:5188/Order', formattedPedido);
      const createdPedido = response.data;

      for (const item of newPedido.items) {
        await axios.post('http://localhost:5188/ItemOrder', {
          ...item,
          fkOrderId: createdPedido.id
        });
      }

      const pedidosResponse = await axios.get('http://localhost:5188/Order');
      setPedidos(pedidosResponse.data);
      setNewPedido({
        description: '',
        totalValue: 0,
        shippingDate: '',
        expectedDeliveryDate: '',
        state: '',
        nInstallments: '',
        fkUserId: '',
        fkClientId: '',
        items: []
      });
      setShowForm(false);
    } catch (err) {
      setError('Erro ao criar pedido');
    }
  };

  const getUserNameById = (userId) => {
    const user = users.find(user => user.id === userId);
    return user ? user.username : 'Desconhecido';
  };

  const getClientNameById = (clientId) => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : 'Desconhecido';
  };

  const getProductDetails = (productId) => {
    const product = products.find(product => product.id === productId);
    return product ? `${product.name} - ${product.value}` : 'Desconhecido';
  };

  const filterItemsOrdemByPedido = (pedidoId) => {
    return itemsOrdem.filter(item => item.fkOrderId === pedidoId);
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pedidos</h1>
        <button className={styles.createButton} onClick={() => setShowForm(true)}>Criar Pedido</button>
      </div>
      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingPedido ? 'Editar Pedido' : 'Criar Pedido'}</h2>
          <div className={styles.form}>
            <label>
              Descrição
              <input
                type="text"
                placeholder="Descrição"
                value={editingPedido ? editingPedido.description : newPedido.description}
                onChange={(e) => (editingPedido ? handleInputChange('description', e.target.value) : handleNewInputChange('description', e.target.value))}
              />
            </label>
            <label>
              Valor Total
              <input
                type="number"
                placeholder="Valor Total"
                value={editingPedido ? editingPedido.totalValue : newPedido.totalValue}
                readOnly
              />
            </label>
            <label>
              Data de Envio
              <input
                type="datetime-local"
                value={editingPedido ? editingPedido.shippingDate?.split('T')[0] + 'T' + (editingPedido.shippingDate.split('T')[1] || '00:00:00') : newPedido.shippingDate?.split('T')[0] + 'T' + (newPedido.shippingDate.split('T')[1] || '00:00:00')}
                onChange={(e) => (editingPedido ? handleInputChange('shippingDate', e.target.value) : handleNewInputChange('shippingDate', e.target.value))}
              />
            </label>
            <label>
              Data de Entrega Esperada
              <input
                type="datetime-local"
                value={editingPedido ? editingPedido.expectedDeliveryDate?.split('T')[0] + 'T' + (editingPedido.expectedDeliveryDate.split('T')[1] || '00:00:00') : newPedido.expectedDeliveryDate?.split('T')[0] + 'T' + (newPedido.expectedDeliveryDate.split('T')[1] || '00:00:00')}
                onChange={(e) => (editingPedido ? handleInputChange('expectedDeliveryDate', e.target.value) : handleNewInputChange('expectedDeliveryDate', e.target.value))}
              />
            </label>
            <label>
              Estado
              <input
                type="text"
                placeholder="Estado"
                value={editingPedido ? editingPedido.state : newPedido.state}
                onChange={(e) => (editingPedido ? handleInputChange('state', e.target.value) : handleNewInputChange('state', e.target.value))}
              />
            </label>
            <label>
              Número de Parcelas
              <input
                type="number"
                placeholder="Número de Parcelas"
                value={editingPedido ? editingPedido.nInstallments : newPedido.nInstallments}
                onChange={(e) => (editingPedido ? handleInputChange('nInstallments', e.target.value) : handleNewInputChange('nInstallments', e.target.value))}
              />
            </label>
            <label>
              Usuário
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
            </label>
            <label>
              Cliente
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
            </label>

            <div className={styles.itemsContainer}>
              <h3>Itens</h3>
              {newPedido.items.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <select
                    value={item.fkProductId}
                    onChange={(e) => handleItemChange(index, 'fkProductId', e.target.value)}
                  >
                    <option value="">Selecione o Produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.value}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Valor do Item"
                    value={item.itemValue}
                    onChange={(e) => handleItemChange(index, 'itemValue', e.target.value)}
                  />
                  <button className={styles.removeButton} onClick={() => removeItem(index)}>Remover Item</button>
                </div>
              ))}
              <button className={styles.addItemButton} onClick={addItem}>Adicionar Item</button>
            </div>

            <div className={styles.formActions}>
              {editingPedido ? (
                <>
                  <button className={styles.saveButton} onClick={() => handleSave(editingPedido.id)}>Salvar</button>
                  <button className={styles.cancelButton} onClick={() => setEditingPedido(null)}>Cancelar</button>
                </>
              ) : (
                <button className={styles.createButton} onClick={handleCreate}>Criar Pedido</button>
              )}
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className={styles.confirmDelete}>
          <p>Tem certeza que deseja excluir este pedido?</p>
          <button className={styles.confirmButton} onClick={() => handleDelete(confirmDelete)}>Confirmar</button>
          <button className={styles.cancelButton} onClick={() => setConfirmDelete(null)}>Cancelar</button>
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor Total</th>
            <th>Data de Envio</th>
            <th>Data de Entrega Esperada</th>
            <th>Estado</th>
            <th>Número de Parcelas</th>
            <th>Nome do Usuário</th>
            <th>Nome do Cliente</th>
            <th>Itens da Ordem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.description}</td>
              <td>{pedido.totalValue}</td>
              <td>{pedido.shippingDate}</td>
              <td>{pedido.expectedDeliveryDate}</td>
              <td>{pedido.state}</td>
              <td>{pedido.nInstallments}</td>
              <td>{getUserNameById(pedido.fkUserId)}</td>
              <td>{getClientNameById(pedido.fkClientId)}</td>
              <td>
                {filterItemsOrdemByPedido(pedido.id).map((item) => (
                  <div key={item.id}>
                    {getProductDetails(item.fkProductId)} (Quantidade: {item.quantity}, Preço: {item.itemValue})
                  </div>
                ))}
              </td>
              <td>
                <button className={styles.editButton} onClick={() => handleEdit(pedido)}>Editar</button>
                <button className={styles.deleteButton} onClick={() => setConfirmDelete(pedido.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pedidos;
