import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const API_URL = "http://localhost:4000/api/books";

const BooksManager = ({ role }) => {
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [cart, setCart] = useState([]);

  // Form state for admin add book
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newImage, setNewImage] = useState("");

  // Search states
  const [userSearchEmail, setUserSearchEmail] = useState("");
  const [titleSearch, setTitleSearch] = useState("");

  // Edit state
  const [editingBook, setEditingBook] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editImage, setEditImage] = useState("");

  const [showIssuedBooks, setShowIssuedBooks] = useState(false);

  const MAX_BOOKS_ALLOWED = 5;
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
  }, [role, userEmail]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(API_URL);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssuedBooks = async (emailQuery = null) => {
    try {
      const url =
        role === "user"
          ? `${API_URL}/issued?userEmail=${encodeURIComponent(userEmail || "")}`
          : emailQuery
          ? `${API_URL}/issued?userEmail=${encodeURIComponent(emailQuery)}`
          : `${API_URL}/issued`;
      const res = await axios.get(url);
      setIssuedBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Add
  const addBook = async (e) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newImage) {
      alert("Please fill all fields");
      return;
    }
    try {
      await axios.post(API_URL, {
        title: newTitle,
        author: newAuthor,
        image: newImage,
      });
      setNewTitle("");
      setNewAuthor("");
      setNewImage("");
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Edit
  const startEdit = (book) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditImage(book.image);
  };
  const cancelEdit = () => {
    setEditingBook(null);
    setEditTitle("");
    setEditAuthor("");
    setEditImage("");
  };
  const saveEdit = async () => {
    if (!editTitle || !editAuthor || !editImage) {
      alert("Fill all fields");
      return;
    }
    try {
      await axios.put(`${API_URL}/${editingBook._id}`, {
        title: editTitle,
        author: editAuthor,
        image: editImage,
      });
      cancelEdit();
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Delete Book
  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setBooks(books.filter((book) => book._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // User cart handling
  const userCanTakeMoreBooks =
    issuedBooks.length + cart.length < MAX_BOOKS_ALLOWED;

  const addToCart = (book) => {
    if (issuedBooks.length + cart.length >= MAX_BOOKS_ALLOWED) {
      alert("आपने 5 books की limit पूरी कर ली है।");
      return;
    }
    if (!cart.find((item) => item._id === book._id)) {
      setCart([...cart, book]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const issueBooks = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (!userEmail) {
      alert("Please login again");
      return;
    }
    const issueDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(issueDate.getDate() + 7);

    const newIssued = cart.map((book) => ({
      bookId: book._id,
      title: book.title,
      issueDate: issueDate.toISOString().split("T")[0],
      returnDate: returnDate.toISOString().split("T")[0],
    }));

    try {
      await axios.post(`${API_URL}/issued`, { books: newIssued, userEmail });
      setCart([]);
      fetchIssuedBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateFine = (returnDate) => {
    const today = new Date();
    const rDate = new Date(returnDate);
    const diffTime = today - rDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * 5 : 0;
  };

  const handleReturnBook = async (issuedBookId, fine) => {
    if (fine > 0) {
      const confirmPay = window.confirm(
        `Fine ₹${fine} is due. Proceed to pay and return?`
      );
      if (!confirmPay) return;
      alert("Fine Paid Successfully!");
    }
    try {
      await axios.delete(`${API_URL}/issued/${issuedBookId}`);
      fetchIssuedBooks(userSearchEmail || null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(titleSearch.trim().toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    window.location.reload();
  };

  // FOOTER
  const Footer = () => (
    <footer className="bg-gray-900 text-white mt-10 p-6 text-center">
      <p className="text-lg font-semibold">
        © {new Date().getFullYear()} E Librery Management System
      </p>
      <p className="text-sm mb-3">Developed with ❤️ by Ramesh Kumar Yadav</p>
      <div className="flex justify-center gap-4 text-xl">
        <a href="https://facebook.com" className="hover:text-blue-500">
          <FaFacebook />
        </a>
        <a href="https://instagram.com" className="hover:text-pink-500">
          <FaInstagram />
        </a>
        <a href="https://twitter.com" className="hover:text-sky-400">
          <FaTwitter />
        </a>
      </div>
    </footer>
  );

  // ================= ADMIN UI =================
  if (role === "admin") {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto p-6 flex-grow">
          {/* Admin Header */}
          <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setShowIssuedBooks(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Books
            </button>
            <button
              onClick={() => setShowIssuedBooks(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Issued Books
            </button>
          </div>

          {!showIssuedBooks && (
            <>
              {/* Add Book Form */}
              <form onSubmit={addBook} className="mb-6 flex flex-wrap gap-2">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Title"
                  className="border p-2 rounded w-full sm:w-auto"
                />
                <input
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Author"
                  className="border p-2 rounded w-full sm:w-auto"
                />
                <input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Image URL"
                  className="border p-2 rounded w-full sm:w-auto"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </form>

              {/* Books List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {books.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white shadow rounded overflow-hidden"
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold">{book.title}</h3>
                      <p>{book.author}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => startEdit(book)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBook(book._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Form */}
              {editingBook && (
                <div className="mt-6 p-4 bg-gray-50 border rounded">
                  <h3>Edit Book</h3>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    placeholder="Author"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="Image URL"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-400 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {showIssuedBooks && (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <input
                  value={userSearchEmail}
                  onChange={(e) => setUserSearchEmail(e.target.value)}
                  placeholder="Search by user email..."
                  className="border p-2 rounded w-full sm:w-auto"
                />
                <button
                  onClick={() => fetchIssuedBooks(userSearchEmail)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Search
                </button>
              </div>
              {issuedBooks.length === 0 ? (
                <p>No issued books found</p>
              ) : (
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2">User Email</th>
                      <th className="border px-4 py-2">Title</th>
                      <th className="border px-4 py-2">Issue Date</th>
                      <th className="border px-4 py-2">Return Date</th>
                      <th className="border px-4 py-2">Fine</th>
                      <th className="border px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedBooks.map((book) => {
                      const fine = calculateFine(book.returnDate);
                      return (
                        <tr key={book._id}>
                          <td className="border px-4 py-2">{book.userEmail}</td>
                          <td className="border px-4 py-2">{book.title}</td>
                          <td className="border px-4 py-2">{book.issueDate}</td>
                          <td className="border px-4 py-2">
                            {book.returnDate}
                          </td>
                          <td className="border px-4 py-2">₹{fine}</td>
                          <td className="border px-4 py-2">
                            <button
                              onClick={() => handleReturnBook(book._id, fine)}
                              className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Return
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ================= USER UI =================
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto p-6 flex-grow">
        <div className="flex flex-wrap justify-between mb-4 gap-2">
          <h1 className="text-2xl font-bold">Book Store</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowIssuedBooks(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Books
            </button>
            <button
              onClick={() => setShowIssuedBooks(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              My Issued
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {!showIssuedBooks && (
          <>
            <input
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              placeholder="Search by title..."
              className="border p-2 rounded w-full mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-white shadow rounded overflow-hidden flex flex-col"
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-bold">{book.title}</h3>
                      <p>{book.author}</p>
                    </div>
                    <button
                      onClick={() => addToCart(book)}
                      disabled={
                        !userCanTakeMoreBooks ||
                        cart.find((c) => c._id === book._id)
                      }
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      {cart.find((c) => c._id === book._id)
                        ? "Added"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart */}
            <div className="mt-6">
              <h2 className="font-bold mb-2">Cart</h2>
              {cart.length === 0 ? (
                <p>No books in cart</p>
              ) : (
                <ul>
                  {cart.map((book) => (
                    <li
                      key={book._id}
                      className="flex justify-between border p-2 mb-2 rounded"
                    >
                      {book.title}
                      <button
                        onClick={() => removeFromCart(book._id)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={issueBooks}
                disabled={cart.length === 0}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              >
                Issue Books
              </button>
            </div>
          </>
        )}

        {showIssuedBooks && (
          <div>
            <h1 className="font-bold mb-2">My Issued Books</h1>
            {issuedBooks.length === 0 ? (
              <p>No issued books</p>
            ) : (
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Issue Date</th>
                    <th className="border px-4 py-2">Return Date</th>
                    <th className="border px-4 py-2">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBooks.map((book) => (
                    <tr key={book._id}>
                      <td className="border px-4 py-2">{book.title}</td>
                      <td className="border px-4 py-2">{book.issueDate}</td>
                      <td className="border px-4 py-2">{book.returnDate}</td>
                      <td className="border px-4 py-2">
                        ₹{calculateFine(book.returnDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BooksManager;
