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
    discount: 0,
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
  const [successMessage, setSuccessMessage] = useState('');

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

  const calculateTotalValue = (items, discount) => {
    const total = items.reduce((total, item) => total + (item.quantity * item.itemValue), 0);
    return total - (total * (discount / 100)); // Aplica o desconto percentual
  };

  const handleInputChange = (field, value) => {
    setEditingPedido(prev => {
      const updatedPedido = { ...prev, [field]: value };
      return {
        ...updatedPedido,
        totalValue: calculateTotalValue(updatedPedido.items, updatedPedido.discount) // Atualiza o totalValue
      };
    });
  };

  const handleNewInputChange = (field, value) => {
    setNewPedido(prev => {
      const updatedPedido = { ...prev, [field]: value };
      return {
        ...updatedPedido,
        totalValue: calculateTotalValue(updatedPedido.items, updatedPedido.discount) // Atualiza o totalValue
      };
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = editingPedido ? [...editingPedido.items] : [...newPedido.items];
    
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'fkProductId') {
      const selectedProduct = products.find(product => product.id === value);
      if (selectedProduct) {
        updatedItems[index].itemValue = selectedProduct.value;
      }
    }
    
    const newTotalValue = calculateTotalValue(updatedItems, editingPedido ? editingPedido.discount : newPedido.discount);
    if (editingPedido) {
      setEditingPedido(prev => ({ ...prev, items: updatedItems, totalValue: newTotalValue }));
    } else {
      setNewPedido(prev => ({ ...prev, items: updatedItems, totalValue: newTotalValue }));
    }
  };

  const addItem = () => {
    if (editingPedido) {
      setEditingPedido(prev => {
        const newItems = [...prev.items, { fkProductId: '', quantity: 1, itemValue: 0 }];
        return { ...prev, items: newItems, totalValue: calculateTotalValue(newItems, prev.discount) };
      });
    } else {
      setNewPedido(prev => {
        const newItems = [...prev.items, { fkProductId: '', quantity: 1, itemValue: 0 }];
        return { ...prev, items: newItems, totalValue: calculateTotalValue(newItems, prev.discount) };
      });
    }
  };

  const removeItem = (index) => {
    if (editingPedido) {
      const updatedItems = editingPedido.items.filter((_, i) => i !== index);
      setEditingPedido(prev => ({ ...prev, items: updatedItems, totalValue: calculateTotalValue(updatedItems, prev.discount) }));
    } else {
      const updatedItems = newPedido.items.filter((_, i) => i !== index);
      setNewPedido(prev => ({ ...prev, items: updatedItems, totalValue: calculateTotalValue(updatedItems, prev.discount) }));
    }
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
      setShowForm(false);
      setSuccessMessage('Pedido salvo com sucesso!');
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
    const itemsForEditingPedido = filterItemsOrdemByPedido(pedido.id);
    setEditingPedido({ ...pedido, items: itemsForEditingPedido });
    setShowForm(true);
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
      const itemsResponse = await axios.get('http://localhost:5188/ItemOrder');
      setPedidos(pedidosResponse.data);
      setItemsOrdem(itemsResponse.data);
      setNewPedido({
        description: '',
        totalValue: 0,
        discount: 0,
        shippingDate: '',
        expectedDeliveryDate: '',
        state: '',
        nInstallments: '',
        fkUserId: '',
        fkClientId: '',
        items: []
      });
      setShowForm(false);
      setSuccessMessage('Pedido criado com sucesso!');
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

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingPedido ? 'Editar Pedido' : 'Criar Pedido'}</h2>
              <button className={styles.closeButton} onClick={() => { setShowForm(false); setEditingPedido(null); }}>×</button>
            </div>

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
                Data de Envio
                <input
                  type="date"
                  value={editingPedido ? formatDate(editingPedido.shippingDate) : newPedido.shippingDate}
                  onChange={(e) => (editingPedido ? handleInputChange('shippingDate', e.target.value) : handleNewInputChange('shippingDate', e.target.value))}
                />
              </label>
              <label>
                Data de Entrega Prevista
                <input
                  type="date"
                  value={editingPedido ? formatDate(editingPedido.expectedDeliveryDate) : newPedido.expectedDeliveryDate}
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
                Nº de Parcelas
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
                  <option value="">Selecione um Usuário</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </label>
              <label>
                Cliente
                <select
                  value={editingPedido ? editingPedido.fkClientId : newPedido.fkClientId}
                  onChange={(e) => (editingPedido ? handleInputChange('fkClientId', e.target.value) : handleNewInputChange('fkClientId', e.target.value))}
                >
                  <option value="">Selecione um Cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Desconto (%)
                <input
                  type="number"
                  min="0"
                  placeholder="Desconto (%)"
                  value={editingPedido ? editingPedido.discount : newPedido.discount}
                  onChange={(e) => (editingPedido ? handleInputChange('discount', e.target.value) : handleNewInputChange('discount', e.target.value))}
                />
              </label>

              <h3>Itens do Pedido</h3>
              {editingPedido ? (
                editingPedido.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <select
                      value={item.fkProductId}
                      onChange={(e) => handleItemChange(index, 'fkProductId', e.target.value)}
                    >
                      <option value="">Selecione um Produto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{getProductDetails(product.id)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    />
                    <span>{item.itemValue}</span>
                    <button className={styles.removeItemButton} onClick={() => removeItem(index)}>Remover</button>
                  </div>
                ))
              ) : (
                newPedido.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <select
                      value={item.fkProductId}
                      onChange={(e) => handleItemChange(index, 'fkProductId', e.target.value)}
                    >
                      <option value="">Selecione um Produto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{getProductDetails(product.id)}</option>
                      ))}
                    </select>
                    <span>Quantidade:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    />
                    <span>  Valor: {item.itemValue}    </span>
                    <button className={styles.removeItemButton} onClick={() => removeItem(index)}>Remover</button>
                  </div>
                ))
              )}
              <button className={styles.addItemButton} onClick={addItem}>Adicionar Item</button>

              <h3>Total: {editingPedido ? calculateTotalValue(editingPedido.items, editingPedido.discount) : calculateTotalValue(newPedido.items, newPedido.discount)}</h3>

              <button className={styles.saveButton} onClick={editingPedido ? () => handleSave(editingPedido.id) : handleCreate}>
                {editingPedido ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Data de Envio</th>
            <th>Data de Entrega Prevista</th>
            <th>Estado</th>
            <th>Parcelas</th>
            <th>Usuário</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Itens do pedido</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(pedido => (
            <tr key={pedido.id}>
              <td>{pedido.description}</td>
              <td>{pedido.shippingDate}</td>
              <td>{pedido.expectedDeliveryDate}</td>
              <td>{pedido.state}</td>
              <td>{pedido.nInstallments}</td>
              <td>{getUserNameById(pedido.fkUserId)}</td>
              <td>{getClientNameById(pedido.fkClientId)}</td>
              <td>{pedido.totalValue}</td>
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

      {confirmDelete && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>Tem certeza que deseja excluir este pedido?</p>
            <button onClick={() => handleDelete(confirmDelete)}>Sim</button>
            <button onClick={() => setConfirmDelete(null)}>Não</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
