import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({});
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [
          dashboardRes, 
          usersRes, 
          paymentsRes, 
          certificatesRes,
          leaderboardRes
        ] = await Promise.all([
          axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/certificates', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/score/leaderboard', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setDashboard(dashboardRes.data);
        setUsers(usersRes.data);
        setPayments(paymentsRes.data);
        setCertificates(certificatesRes.data);
        setLeaderboard(leaderboardRes.data.leaderboard);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        setError(error.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const openModal = (type, data = null) => {
    setModal({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
  };

  const handleCreateOrUpdate = async (type, data) => {
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      let response;
      if (type === 'user') {
        if (modal.data) {
          response = await axios.put(`/api/admin/user/${modal.data._id}`, data, { headers });
          setUsers(users.map(u => (u._id === modal.data._id ? response.data : u)));
        } else {
          response = await axios.post('/api/auth/signup', data, { headers });
          setUsers([...users, response.data.user]);
        }
      } else if (type === 'payment') {
        if (modal.data) {
          response = await axios.put(`/api/admin/payment/${modal.data._id}`, data, { headers });
          setPayments(payments.map(p => (p._id === modal.data._id ? response.data : p)));
        } else {
          response = await axios.post('/api/admin/payment', data, { headers });
          setPayments([...payments, response.data]);
        }
      } else if (type === 'certificate') {
        if (modal.data) {
          response = await axios.put(`/api/admin/certificate/${modal.data._id}`, data, { headers });
          setCertificates(certificates.map(c => (c._id === modal.data._id ? response.data : c)));
        } else {
          response = await axios.post('/api/admin/certificate', data, { headers });
          setCertificates([...certificates, response.data.certificate]);
        }
      }
      closeModal();
    } catch (error) {
      console.error(`Error ${modal.data ? 'updating' : 'creating'} ${type}:`, error);
      setError(error.response?.data?.message || `Failed to ${modal.data ? 'update' : 'create'} ${type}`);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`/api/admin/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (type === 'user') setUsers(users.filter(u => u._id !== id));
      if (type === 'payment') setPayments(payments.filter(p => p._id !== id));
      if (type === 'certificate') setCertificates(certificates.filter(c => c._id !== id));
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setError(`Failed to delete ${type}: ${error.response?.data?.message || error.message}`);
    }
  };

  const Modal = () => {
    const [formData, setFormData] = useState(modal.data || {});

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleCreateOrUpdate(modal.type, formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-semibold text-purple-950 mb-5">
            {modal.data ? `Edit ${modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}` : `Create ${modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}`}
          </h2>
          <div>
            {modal.type === 'user' && (
              <>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role || 'user'}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {!modal.data && (
                  <div className="mb-5">
                    <label className="block text-gray-800 font-medium mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password || ''}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                      required
                    />
                  </div>
                )}
              </>
            )}
            {modal.type === 'payment' && (
              <>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">User ID</label>
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Payment ID</label>
                  <input
                    type="text"
                    name="payment_id"
                    value={formData.payment_id || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Score</label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Amount (Paise)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                  />
                </div>
              </>
            )}
            {modal.type === 'certificate' && (
              <>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Score</label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Payment ID</label>
                  <input
                    type="text"
                    name="paymentId"
                    value={formData.paymentId || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 font-medium mb-1">Issued At</label>
                  <input
                    type="date"
                    name="issuedAt"
                    value={formData.issuedAt ? new Date(formData.issuedAt).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 text-base font-medium transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-purple-900 text-white px-5 py-2.5 rounded-lg hover:bg-purple-950 text-base font-medium transition-all duration-300 transform hover:scale-105"
              >
                {modal.data ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <div className="text-red-600 p-6 text-center text-lg font-inter">Error: {error}</div>;
  if (loading) return <div className="text-purple-900 p-6 text-center text-lg font-inter">Loading...</div>;

  return (
    <div className="w-screen h-screen flex flex-col font-inter text-gray-800 bg-gray-100">
      {/* Header */}
      <header className="bg-purple-900 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </header>

      {/* Navigation */}
      <nav className="bg-purple-800 p-3">
        <div className="flex space-x-3 overflow-x-auto">
          {['dashboard', 'users', 'payments', 'certificates', 'leaderboard'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 text-base whitespace-nowrap transform hover:scale-105 ${
                activeTab === tab
                  ? 'bg-purple-950 text-white'
                  : 'bg-purple-700 text-white hover:bg-purple-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="w-full">
          {activeTab === 'dashboard' && (
            <div>
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-900 text-white p-4 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold">Total Users</h3>
                  <p className="text-3xl font-bold">{dashboard.totalUsers || 0}</p>
                </div>
                <div className="bg-purple-900 text-white p-4 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold">Total Payments</h3>
                  <p className="text-3xl font-bold">{dashboard.totalPayments || 0}</p>
                </div>
                <div className="bg-purple-900 text-white p-4 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold">Total Amount Paid</h3>
                  <p className="text-3xl font-bold">₹{(dashboard.totalAmountPaid || 0).toFixed(2)}</p>
                </div>
                <div className="bg-purple-900 text-white p-4 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold">Total Certificates</h3>
                  <p className="text-3xl font-bold">{dashboard.totalCertificates || 0}</p>
                </div>
                <div className="bg-purple-900 text-white p-4 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold">Most Popular Game</h3>
                  <p className="text-xl">{dashboard.mostPopularGame || 'None'}</p>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-semibold text-purple-950 mb-4">Top Performers</h3>
                {leaderboard.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {leaderboard.map((user, i) => (
                      <li key={i} className="text-gray-800">
                        {user.name} ({user.email}) - Total Score: {user.score}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No top performers</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-purple-950">All Users</h3>
                <button
                  onClick={() => openModal('user')}
                  className="bg-purple-900 text-white px-5 py-2.5 rounded-lg hover:bg-purple-950 text-base font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Create User
                </button>
              </div>
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-purple-200 sticky top-0">
                    <tr>
                      <th className="p-3 text-purple-950 font-semibold">Name</th>
                      <th className="p-3 text-purple-950 font-semibold">Email</th>
                      <th className="p-3 text-purple-950 font-semibold">Role</th>
                      <th className="p-3 text-purple-950 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map(user => (
                        <tr key={user._id} className="border-b hover:bg-purple-100 transition-all">
                          <td className="p-3">{user.name}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">{user.role}</td>
                          <td className="p-3 flex space-x-2">
                            <button
                              onClick={() => openModal('user', user)}
                              className="bg-blue-800 text-white px-4 py-1.5 rounded-lg hover:bg-blue-900 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete('user', user._id)}
                              className="bg-red-800 text-white px-4 py-1.5 rounded-lg hover:bg-red-900 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-3 text-center text-gray-600">
                          No users
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-purple-950">All Payments</h3>
                <button
                  onClick={() => openModal('payment')}
                  className="bg-purple-900 text-white px-5 py-2.5 rounded-lg hover:bg-purple-950 text-base font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Create Payment
                </button>
              </div>
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-purple-200 sticky top-0">
                    <tr>
                      <th className="p-3 text-purple-950 font-semibold">User</th>
                      <th className="p-3 text-purple-950 font-semibold">Email</th>
                      <th className="p-3 text-purple-950 font-semibold">Payment ID</th>
                      <th className="p-3 text-purple-950 font-semibold">Score</th>
                      <th className="p-3 text-purple-950 font-semibold">Amount (₹)</th>
                      <th className="p-3 text-purple-950 font-semibold">Date</th>
                      <th className="p-3 text-purple-950 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map(payment => (
                        <tr key={payment._id} className="border-b hover:bg-purple-100 transition-all">
                          <td className="p-3">{payment.userId?.name || 'Unknown'}</td>
                          <td className="p-3">{payment.email}</td>
                          <td className="p-3">{payment.payment_id}</td>
                          <td className="p-3">{payment.score}</td>
                          <td className="p-3">
                            {payment.amount != null ? payment.amount.toFixed(2) : 'N/A'}
                          </td>
                          <td className="p-3">{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="p-3 flex space-x-2">
                            <button
                              onClick={() => openModal('payment', payment)}
                              className="bg-blue-800 text-white px-4 py-1.5 rounded-lg hover:bg-blue-900 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete('payment', payment._id)}
                              className="bg-red-800 text-white px-4 py-1.5 rounded-lg hover:bg-red-900 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-3 text-center text-gray-600">
                          No payments
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-purple-950">All Certificates</h3>
                <button
                  onClick={() => openModal('certificate')}
                  className="bg-purple-900 text-white px-5 py-2.5 rounded-lg hover:bg-purple-950 text-base font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Create Certificate
                </button>
              </div>
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-purple-200 sticky top-0">
                    <tr>
                      <th className="p-3 text-purple-950 font-semibold">Name</th>
                      <th className="p-3 text-purple-950 font-semibold">Email</th>
                      <th className="p-3 text-purple-950 font-semibold">Score</th>
                      <th className="p-3 text-purple-950 font-semibold">Payment ID</th>
                      <th className="p-3 text-purple-950 font-semibold">Issued At</th>
                      <th className="p-3 text-purple-950 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.length > 0 ? (
                      certificates.map(cert => (
                        <tr key={cert._id} className="border-b hover:bg-purple-100 transition-all">
                          <td className="p-3">{cert.name}</td>
                          <td className="p-3">{cert.email}</td>
                          <td className="p-3">{cert.score}</td>
                          <td className="p-3">{cert.paymentId}</td>
                          <td className="p-3">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                          <td className="p-3 flex space-x-2">
                            <button
                              onClick={() => openModal('certificate', cert)}
                              className="bg-blue-800 text-white px-4 py-1.5 rounded-lg hover:bg-blue-900 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete('certificate', cert._id)}
                              className="bg-red-800 text-white px-4 py-1.5 rounded-lg hover:bg-red-900 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              Delete
                            </button>
                            <a
                              href={`/api/certificates/download/${cert._id}`}
                              download
                              className="bg-purple-900 text-white px-4 py-1.5 rounded-lg hover:bg-purple-950 text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-3 text-center text-gray-600">
                          No certificates
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-purple-950 mb-4">Leaderboard</h3>
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-purple-200 sticky top-0">
                    <tr>
                      <th className="p-3 text-purple-950 font-semibold">Rank</th>
                      <th className="p-3 text-purple-950 font-semibold">Name</th>
                      <th className="p-3 text-purple-950 font-semibold">Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length > 0 ? (
                      leaderboard.map((user, i) => (
                        <tr key={i} className="border-b hover:bg-purple-100 transition-all">
                          <td className="p-3">{i + 1}</td>
                          <td className="p-3">{user.name}</td>
                          <td className="p-3">{user.score}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-3 text-center text-gray-600">
                          No leaderboard data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {modal.isOpen && <Modal />}
    </div>
  );
}

export default AdminDashboard;