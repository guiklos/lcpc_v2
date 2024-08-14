import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/Clientes.module.css';

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newClient, setNewClient] = useState({
    name: '',
    streetplace: '',
    neighborhood: '',
    number: '',
    complement: '',
    phone: '',
    email: '',
    cnpj: '',
    fkCityId: ''
  });
  const [editingClientId, setEditingClientId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [cities, setCities] = useState([]); // Estado para armazenar cidades

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5188/Client');
        setClients(response.data);
      } catch (err) {
        setError('Erro ao carregar os clientes');
      } finally {
        setLoading(false);
      }
    };

    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:5188/City');
        setCities(response.data);
      } catch (err) {
        setError('Erro ao carregar as cidades');
      }
    };

    fetchClients();
    fetchCities();
  }, []);

  const handleInputChange = (field, value) => {
    setNewClient((prevClient) => ({
      ...prevClient,
      [field]: value
    }));
  };

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:5188/Client', newClient);
      setNewClient({
        name: '',
        streetplace: '',
        neighborhood: '',
        number: '',
        complement: '',
        phone: '',
        email: '',
        cnpj: '',
        fkCityId: ''
      });
      const response = await axios.get('http://localhost:5188/Client');
      setClients(response.data);
      setIsAdding(false);
    } catch (err) {
      setError('Erro ao criar cliente');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5188/Client/${id}`);
      setClients((prevClients) => prevClients.filter((client) => client.id !== id));
    } catch (err) {
      setError('Erro ao excluir cliente');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Clientes</h1>
      </div>
      <div className={styles.formContainer}>
        <h2>Criar Cliente</h2>
        {isAdding ? (
          <>
            <input
              type="text"
              placeholder="Nome"
              value={newClient.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Rua"
              value={newClient.streetplace}
              onChange={(e) => handleInputChange('streetplace', e.target.value)}
            />
            <input
              type="text"
              placeholder="Bairro"
              value={newClient.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
            />
            <input
              type="text"
              placeholder="Número"
              value={newClient.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
            />
            <input
              type="text"
              placeholder="Complemento"
              value={newClient.complement}
              onChange={(e) => handleInputChange('complement', e.target.value)}
            />
            <input
              type="text"
              placeholder="Telefone"
              value={newClient.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <input
              type="text"
              placeholder="CNPJ"
              value={newClient.cnpj}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
            />
            <select
              value={newClient.fkCityId}
              onChange={(e) => handleInputChange('fkCityId', e.target.value)}
            >
              <option value="">Selecione a cidade</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <button className={styles.submitButton} onClick={handleCreate}>Salvar</button>
            <button className={styles.submitButton} onClick={() => setIsAdding(false)}>Cancelar</button>
          </>
        ) : (
          <button className={styles.createButton} onClick={() => setIsAdding(true)}>Adicionar Novo Cliente</button>
        )}
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Rua</th>
              <th>Bairro</th>
              <th>Número</th>
              <th>Complemento</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>CNPJ</th>
              <th>Cidade</th>
              <th>CreatedAt</th>
              <th>UpdatedAt</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.streetplace}</td>
                <td>{client.neighborhood}</td>
                <td>{client.number}</td>
                <td>{client.complement}</td>
                <td>{client.phone}</td>
                <td>{client.email}</td>
                <td>{client.cnpj}</td>
                <td>{client.city}</td>
                <td>{new Date(client.createdAt).toLocaleString()}</td>
                <td>{client.updatedAt ? new Date(client.updatedAt).toLocaleString() : 'N/A'}</td>
                <td>
                  <button onClick={() => handleDelete(client.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clientes;
