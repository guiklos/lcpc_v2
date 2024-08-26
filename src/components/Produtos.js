import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/Products.module.css';

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
  const [editingProductId, setEditingProductId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

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

  const handleInputChange = (id, field, value) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const handleUpdate = async (id) => {
    const productToUpdate = products.find((product) => product.id === id);
    try {
      await axios.put(`http://localhost:5188/Product/${id}`, productToUpdate);
      alert('Produto atualizado com sucesso!');
      setEditingProductId(null);
    } catch (err) {
      setError('Erro ao atualizar produto');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5188/Product/${id}`);
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    } catch (err) {
      setError('Erro ao deletar produto');
    }
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

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Produtos</h1>
      </div>
      <div className={styles.formContainer}>
        <h2>Criar Produto</h2>
        {isAdding ? (
          <>
            <input
              type="text"
              name="name"
              placeholder="Nome"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              type="number"
              name="productType"
              placeholder="Tipo de Produto"
              value={newProduct.productType}
              onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}
            />
            <input
              type="text"
              name="description"
              placeholder="Descrição"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <input
              type="number"
              name="value"
              placeholder="Valor"
              value={newProduct.value}
              onChange={(e) => setNewProduct({ ...newProduct, value: e.target.value })}
            />
            <input
              type="number"
              name="thickness"
              placeholder="Espessura"
              value={newProduct.thickness}
              onChange={(e) => setNewProduct({ ...newProduct, thickness: e.target.value })}
            />
            <input
              type="number"
              name="width"
              placeholder="Largura"
              value={newProduct.width}
              onChange={(e) => setNewProduct({ ...newProduct, width: e.target.value })}
            />
            <input
              type="number"
              name="length"
              placeholder="Comprimento"
              value={newProduct.length}
              onChange={(e) => setNewProduct({ ...newProduct, length: e.target.value })}
            />
            <button onClick={handleCreate}>Salvar</button>
            <button onClick={() => setIsAdding(false)}>Cancelar</button>
          </>
        ) : (
          <button onClick={() => setIsAdding(true)}>Adicionar Novo Produto</button>
        )}
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo de Produto</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Espessura</th>
              <th>Largura</th>
              <th>Comprimento</th>
              <th>CreatedAt</th>
              <th>UpdatedAt</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) =>
                      handleInputChange(product.id, 'name', e.target.value)
                    }
                    disabled={editingProductId !== product.id}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={product.productType}
                    onChange={(e) =>
                      handleInputChange(product.id, 'productType', e.target.value)
                    }
                    disabled={editingProductId !== product.id}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={product.description}
                    onChange={(e) =>
                      handleInputChange(product.id, 'description', e.target.value)
                    }
                    disabled={editingProductId !== product.id}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={product.value}
                    onChange={(e) =>
                      handleInputChange(product.id, 'value', e.target.value)
                    }
                    disabled={editingProductId !== product.id}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={product.thickness}
                    onChange={(e) =>
                      handleInputChange(product.id, 'thickness', e.target.value)
                    }
                    disabled={editingProductId !== product.id}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={product.width}
                    onChange={(e) =>
                      handleInputChange(product.id, 'width', e.target.value)
                    }
                    disabled={editingProductId !== product.id}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={product.length}
                    onChange={(e) =>
                      handleInputChange(product.id, 'length', e.target.value)
                    }
                    disabled={editingProductId !== product.id}
                  />
                </td>
                <td>{new Date(product.createdAt).toLocaleString()}</td>
                <td>{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}</td>
                <td>
                  {editingProductId === product.id ? (
                    <>
                      <button onClick={() => handleUpdate(product.id)}>Salvar</button>
                      <button onClick={() => setEditingProductId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => setEditingProductId(product.id)}>Editar</button>
                  )}
                  <button onClick={() => handleDelete(product.id)}>Excluir</button>
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
