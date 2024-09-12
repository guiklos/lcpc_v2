import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import styles from '../Styles/Products.module.css';

// Configuração do Modal para trabalhar com a aplicação
Modal.setAppElement('#root');

const Produtos = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    productType: '',
    description: '',
    value: '',
    thickness: '',
    width: '',
    length: '',
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5188/Product');
        setProducts(response.data);
      } catch (err) {
        setError('Erro ao carregar os produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (field, value) => {
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      const newProductData = {
        ...newProduct,
        productType: Number(newProduct.productType),
        value: Number(newProduct.value),
        thickness: Number(newProduct.thickness),
        width: Number(newProduct.width),
        length: Number(newProduct.length),
      };

      await axios.post('http://localhost:5188/Product', newProductData);
      setNewProduct({
        name: '',
        productType: '',
        description: '',
        value: '',
        thickness: '',
        width: '',
        length: '',
      });
      const response = await axios.get('http://localhost:5188/Product');
      setProducts(response.data);
      setIsAdding(false);
    } catch (err) {
      setError('Erro ao criar produto');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5188/Product/${editingProduct.id}`, editingProduct);
      alert('Produto atualizado com sucesso!');
      setEditingProduct(null);
      const response = await axios.get('http://localhost:5188/Product');
      setProducts(response.data);
    } catch (err) {
      setError('Erro ao atualizar produto');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5188/Product/${confirmDeleteProduct}`);
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== confirmDeleteProduct));
      setConfirmDeleteProduct(null);
    } catch (err) {
      setError('Erro ao deletar produto');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsAdding(true);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingProduct(null);
  };

  const openDeleteConfirmModal = (productId) => {
    setConfirmDeleteProduct(productId);
  };

  const closeDeleteConfirmModal = () => {
    setConfirmDeleteProduct(null);
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Produtos</h1>
      </div>
      <div className={styles.formContainer}>
        <button onClick={() => setIsAdding(true)} className={styles.createButton}>Adicionar Novo Produto</button>
        <Modal
          isOpen={isAdding}
          onRequestClose={closeModal}
          contentLabel={editingProduct ? 'Editar Produto' : 'Criar Produto'}
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <h2>{editingProduct ? 'Editar Produto' : 'Criar Produto'}</h2>
          <input
            type="text"
            placeholder="Nome"
            value={editingProduct ? editingProduct.name : newProduct.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          <input
            type="number"
            placeholder="Tipo de Produto"
            value={editingProduct ? editingProduct.productType : newProduct.productType}
            onChange={(e) => handleInputChange('productType', e.target.value)}
          />
          <input
            type="text"
            placeholder="Descrição"
            value={editingProduct ? editingProduct.description : newProduct.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          <input
            type="number"
            placeholder="Valor"
            value={editingProduct ? editingProduct.value : newProduct.value}
            onChange={(e) => handleInputChange('value', e.target.value)}
          />
          <div className={styles.inputWithUnit}>
            <input
              type="number"
              placeholder="Espessura"
              value={editingProduct ? editingProduct.thickness : newProduct.thickness}
              onChange={(e) => handleInputChange('thickness', e.target.value)}
            />
            <span>cm</span>
          </div>
          <div className={styles.inputWithUnit}>
            <input
              type="number"
              placeholder="Largura"
              value={editingProduct ? editingProduct.width : newProduct.width}
              onChange={(e) => handleInputChange('width', e.target.value)}
            />
            <span>cm</span>
          </div>
          <div className={styles.inputWithUnit}>
            <input
              type="number"
              placeholder="Comprimento"
              value={editingProduct ? editingProduct.length : newProduct.length}
              onChange={(e) => handleInputChange('length', e.target.value)}
            />
            <span>cm</span>
          </div>
          <button className={styles.submitButton} onClick={editingProduct ? handleUpdate : handleCreate}>
            {editingProduct ? 'Salvar' : 'Criar'}
          </button>
          <button className={styles.submitButton} onClick={closeModal}>Cancelar</button>
        </Modal>
        <Modal
          isOpen={!!confirmDeleteProduct}
          onRequestClose={closeDeleteConfirmModal}
          contentLabel="Confirmar Exclusão"
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <h2>Confirmar Exclusão</h2>
          <p>Você tem certeza que deseja excluir este produto?</p>
          <button className={styles.submitButton} onClick={handleDelete}>Confirmar</button>
          <button className={styles.submitButton} onClick={closeDeleteConfirmModal}>Cancelar</button>
        </Modal>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Valor{" (R$)"}</th>
              <th>Espessura (cm)</th>
              <th>Largura (cm)</th>
              <th>Comprimento (cm)</th>
              <th>Criado em:</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.value}</td>
                <td>{product.thickness} cm</td>
                <td>{product.width} cm</td>
                <td>{product.length} cm</td>
                <td>{new Date(product.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button onClick={() => openEditModal(product)}>Editar</button>
                  <button onClick={() => openDeleteConfirmModal(product.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Produtos;
