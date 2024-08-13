import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/Users.module.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ Username: '', Password: '', Email: '' });
  const [editingUserId, setEditingUserId] = useState(null); // Estado para rastrear o ID do usuário sendo editado
  const [isAdding, setIsAdding] = useState(false); // Estado para rastrear se estamos no modo de adição

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5188/User');
        setUsers(response.data);
      } catch (err) {
        setError('Erro ao carregar os usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (id, field, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, [field]: value } : user
      )
    );
  };

  const handleUpdate = async (id) => {
    const userToUpdate = users.find((user) => user.id === id);
    try {
      await axios.put(`http://localhost:5188/User/${id}`, userToUpdate);
      alert('Usuário atualizado com sucesso!');
      setEditingUserId(null); // Sair do modo de edição após salvar
    } catch (err) {
      setError('Erro ao atualizar usuário');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5188/User/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (err) {
      setError('Erro ao deletar usuário');
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:5188/User', newUser);
      setNewUser({ Username: '', Password: '', Email: '' });
      const response = await axios.get('http://localhost:5188/User');
      setUsers(response.data);
      setIsAdding(false); // Sair do modo de adição após criar o usuário
    } catch (err) {
      setError('Erro ao criar usuário');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Usuários</h1>
      </div>
      <div className={styles.formContainer}>
        <h2>Criar Usuário</h2>
        {isAdding ? (
          <>
            <input
              type="text"
              name="Username"
              placeholder="Username"
              value={newUser.Username}
              onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
            />
            <input
              type="password"
              name="Password"
              placeholder="Password"
              value={newUser.Password}
              onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
            />
            <input
              type="email"
              name="Email"
              placeholder="Email"
              value={newUser.Email}
              onChange={(e) => setNewUser({ ...newUser, Email: e.target.value })}
            />
            <button onClick={handleCreate}>Salvar</button>
            <button onClick={() => setIsAdding(false)}>Cancelar</button>
          </>
        ) : (
          <button onClick={() => setIsAdding(true)}>Adicionar Novo Usuário</button>
        )}
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>CreatedAt</th>
              <th>UpdatedAt</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="text"
                    value={user.username}
                    onChange={(e) =>
                      handleInputChange(user.id, 'username', e.target.value)
                    }
                    disabled={editingUserId !== user.id} // Desativa o campo se não estiver no modo de edição
                  />
                </td>
                <td>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      handleInputChange(user.id, 'email', e.target.value)
                    }
                    disabled={editingUserId !== user.id} // Desativa o campo se não estiver no modo de edição
                  />
                </td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>{new Date(user.updatedAt).toLocaleString()}</td>
                <td>
                  {editingUserId === user.id ? (
                    <>
                      <button onClick={() => handleUpdate(user.id)}>Salvar</button>
                      <button onClick={() => setEditingUserId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => setEditingUserId(user.id)}>Editar</button>
                  )}
                  <button onClick={() => handleDelete(user.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
