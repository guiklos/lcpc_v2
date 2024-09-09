import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import InputMask from 'react-input-mask'; // Importar a biblioteca
import styles from '../Styles/Clientes.module.css';

Modal.setAppElement('#root'); // Ajuste para o id do elemento root no seu HTML

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteIsOpen, setConfirmDeleteIsOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [cities, setCities] = useState([]);
  const [emailError, setEmailError] = useState(null); // Estado para armazenar erro de email

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

  const openModal = (client = null) => {
    setCurrentClient(client || {
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
    setIsEditing(!!client);
    setModalIsOpen(true);
    setEmailError(null); // Limpar erro de email ao abrir o modal
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentClient(null);
  };

  const openConfirmDeleteModal = (client) => {
    setClientToDelete(client);
    setConfirmDeleteIsOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setConfirmDeleteIsOpen(false);
    setClientToDelete(null);
  };

  const handleInputChange = (field, value) => {
    setCurrentClient((prevClient) => ({
      ...prevClient,
      [field]: value
    }));
  };

  // Função para validar o formato do email
  const isValidEmail = (email) => {
    // Expressão regular para validação de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSave = async () => {
    if (!isValidEmail(currentClient.email)) {
      setEmailError('O email fornecido não é válido. Por favor, insira um email válido.');
      return;
    }

    try {
      // Remover máscara dos campos antes de enviar
      const cleanedClient = {
        ...currentClient,
        phone: removeMask(currentClient.phone),
        cnpj: removeMask(currentClient.cnpj)
      };

      if (isEditing) {
        await axios.put(`http://localhost:5188/Client/${currentClient.id}`, cleanedClient);
      } else {
        await axios.post('http://localhost:5188/Client', cleanedClient);
      }

      const response = await axios.get('http://localhost:5188/Client');
      setClients(response.data);
      closeModal();
    } catch (err) {
      setError('Erro ao salvar cliente');
    }
  };

  const formatPhone = (phone) => {
    return phone
      .replace(/\D/g, '') // Remove todos os caracteres não numéricos
      .replace(/^(\d{2})(\d)/, '($1) $2') // Formata o DDD e o primeiro dígito
      .replace(/(\d{4})(\d)/, '$1-$2') // Adiciona o hífen
      .replace(/(\d{4})(\d)/, '$1-$2'); // Formata o restante
  };

  const formatCNPJ = (cnpj) => {
    return cnpj
      .replace(/\D/g, '') // Remove todos os caracteres não numéricos
      .replace(/^(\d{2})(\d)/, '$1.$2') // Adiciona o primeiro ponto
      .replace(/\.(\d{3})(\d)/, '.$1/$2') // Adiciona a barra
      .replace(/(\d{4})(\d)/, '$1-$2'); // Adiciona o hífen
  };

  const removeMask = (value) => {
    return value.replace(/\D/g, '');
  };

  const handleDelete = async () => {
    if (clientToDelete) {
      try {
        await axios.delete(`http://localhost:5188/Client/${clientToDelete.id}`);
        setClients((prevClients) => prevClients.filter((client) => client.id !== clientToDelete.id));
        closeConfirmDeleteModal();
      } catch (err) {
        setError('Erro ao excluir cliente');
      }
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Clientes</h1>
      </div>
      <button className={styles.createButton} onClick={() => openModal()}>Adicionar Novo Cliente</button>

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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              // Encontrar o nome da cidade usando fkCityId
              const cityName = cities.find(city => city.id === client.fkCityId)?.name || 'Não especificado';

              return (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.streetplace}</td>
                  <td>{client.neighborhood}</td>
                  <td>{client.number}</td>
                  <td>{client.complement}</td>
                  <td>{formatPhone(client.phone)}</td>
                  <td>{client.email}</td>
                  <td>{formatCNPJ(client.cnpj)}</td>
                  <td>{cityName}</td>
                  <td>
                    <button onClick={() => openModal(client)}>Editar</button>
                    <button onClick={() => openConfirmDeleteModal(client)}>Excluir</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={isEditing ? 'Editar Cliente' : 'Criar Cliente'}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>{isEditing ? 'Editar Cliente' : 'Criar Cliente'}</h2>
        <input
          type="text"
          placeholder="Nome"
          value={currentClient?.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
        <input
          type="text"
          placeholder="Rua"
          value={currentClient?.streetplace || ''}
          onChange={(e) => handleInputChange('streetplace', e.target.value)}
        />
        <input
          type="text"
          placeholder="Bairro"
          value={currentClient?.neighborhood || ''}
          onChange={(e) => handleInputChange('neighborhood', e.target.value)}
        />
        <input
          type="text"
          placeholder="Número"
          value={currentClient?.number || ''}
          onChange={(e) => handleInputChange('number', e.target.value)}
        />
        <input
          type="text"
          placeholder="Complemento"
          value={currentClient?.complement || ''}
          onChange={(e) => handleInputChange('complement', e.target.value)}
        />
        <InputMask
          mask="(99) 99999-9999"
          placeholder="Telefone"
          value={currentClient?.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={currentClient?.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
        {emailError && <p className={styles.error}>{emailError}</p>} {/* Exibe o erro de email */}
        <InputMask
          mask="99.999.999/9999-99"
          placeholder="CNPJ"
          value={currentClient?.cnpj || ''}
          onChange={(e) => handleInputChange('cnpj', e.target.value)}
        />
        <select
          value={currentClient?.fkCityId || ''}
          onChange={(e) => handleInputChange('fkCityId', e.target.value)}
        >
          <option value="">Selecione a cidade</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <button onClick={handleSave}>Salvar</button>
        <button onClick={closeModal}>Cancelar</button>
      </Modal>

      <Modal
        isOpen={confirmDeleteIsOpen}
        onRequestClose={closeConfirmDeleteModal}
        contentLabel="Confirmar Exclusão"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Confirmar Exclusão</h2>
        <p>Você tem certeza que deseja excluir este cliente?</p>
        <button onClick={handleDelete}>Sim, excluir</button>
        <button onClick={closeConfirmDeleteModal}>Cancelar</button>
      </Modal>
    </div>
  );
};

export default Clientes;
