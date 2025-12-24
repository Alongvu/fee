import React, { useEffect, useState } from "react";
import "./ContactProduct.css";

const ContactProduct = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch("http://localhost:4000/allcontact");
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách liên hệ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
    try {
      await fetch(`http://localhost:4000/contact/${id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("❌ Lỗi khi xóa phản hồi:", error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await fetch(`http://localhost:4000/contact/${id}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, completed: true } : c))
      );
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật phản hồi:", error);
    }
  };

  return (
    <div className="admin-contact-container">
      <h1 className="admin-contact-title"> Customer feedback list</h1>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="no-data">No customers have contacted us yet..</p>
      ) : (
        <table className="contact-table">
          <thead>
            <tr>
              <th>Full name</th><th>Email</th><th>Message</th><th>Date</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr key={index} className={contact.completed ? "completed-row" : ""}>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.message}</td>
                <td>{new Date(contact.createdAt).toLocaleString()}</td>
                <td>{contact.completed ? "✅ Đã xử lý" : "Chưa xử lý"}</td>
                <td>
                  {!contact.completed && (
                    <button className="complete-btn" onClick={() => handleComplete(contact._id)}>
                      ✅
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => handleDelete(contact._id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContactProduct;
