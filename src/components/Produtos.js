// src/components/Users.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Styles/Users.module.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ Username: '', Password: '', Email: '' });

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

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:5188/User', newUser);
      setNewUser({ Username: '', Password: '', Email: '' });
      const response = await axios.get('http://localhost:5188/User');
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao criar usuário');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5188/User/${editingUser.Id}`, editingUser);
      setEditingUser(null);
      const response = await axios.get('http://localhost:5188/User');
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao atualizar usuário');
    }
  };

const handleDelete = async (id) => {
  console.log(`Deleting user with ID: ${id}`);
  try {
    const response = await axios.delete(`http://localhost:5188/User/${id}`);
    console.log('Delete response:', response);
    const updatedResponse = await axios.get('http://localhost:5188/User');
    setUsers(updatedResponse.data);
  } catch (err) {
    console.error('Delete error:', err.response ? err.response.data : err.message);
    setError('Erro ao deletar usuário');
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
        <button onClick={handleCreate}>Criar</button>
      </div>
      <div className={styles.formContainer}>
        <h2>Editar Usuário</h2>
        {editingUser && (
          <>
            <input
              type="text"
              name="Username"
              value={editingUser.Username}
              onChange={(e) => setEditingUser({ ...editingUser, Username: e.target.value })}
            />
            <input
              type="password"
              name="Password"
              value={editingUser.Password}
              onChange={(e) => setEditingUser({ ...editingUser, Password: e.target.value })}
            />
            <input
              type="email"
              name="Email"
              value={editingUser.Email}
              onChange={(e) => setEditingUser({ ...editingUser, Email: e.target.value })}
            />
            <button onClick={handleUpdate}>Atualizar</button>
          </>
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
  {users.map(user => (
    <tr key={user.id}>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td>{new Date(user.createdAt).toLocaleString()}</td>
      <td>{new Date(user.updatedAt).toLocaleString()}</td>
      <td>
        <button onClick={() => handleEdit(user)}>Editar</button>
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
