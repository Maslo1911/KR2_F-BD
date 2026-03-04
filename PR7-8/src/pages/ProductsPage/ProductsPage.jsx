import React, { useEffect, useState } from "react";
import "./ProductsPage.css";
import ProductsList from "../../components/ProductsList";
import ProductModal from "../../components/ProductModal";
import { api } from "../../api";
import AuthModal from "../../components/AuthModal";
export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create | edit
    const [editingProduct, setEditingProduct] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState("");
    useEffect(() => {
        loadProducts();
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        }, []);
    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };
    const openCreate = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };
    const openEdit = (product) => {setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };
    const openRegister = () => {
        setAuthModalMode("register");
        setAuthModalOpen(true);
    };
    const openLogin = () => {
        setAuthModalMode("login");
        setAuthModalOpen(true);
    };
    const closeAuthModal = () => {
        setAuthModalOpen(false);
        setAuthModalMode("");
    };
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    };
    const handleDelete = async (id) => {
        if (!user) {
            alert("Необходимо авторизоваться");
            return;
        }
        const ok = window.confirm("Удалить товар?");
        if (!ok) return;
        try {
            await api.deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления товара");
        }
    };
    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newProduct = await api.createProduct(payload);
                setProducts((prev) => [ ... prev, newProduct]);
            } else {
                const updatedProduct = await api.updateProduct(payload.id, payload);
                setProducts((prev) =>
                    prev.map((p) => (p.id === payload.id ? updatedProduct : p))
                );
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения товара");
        }
    };
    const handleSubmitAuthModal = async (payload) => {
        try {
            let response;

            if (authModalMode === "register") {
                // Регистрируемся
                await api.registerUser(payload);

                // И сразу входим с теми же данными
                response = await api.loginUser({
                    email: payload.email,
                    password: payload.password
                });
            } else {
                // Просто входим
                response = await api.loginUser(payload);
            }
            console.log("Response from login:", response);

            if (response.user && response.token) {
                console.log("User data:", response.user);
                setUser(response.user);
                closeAuthModal(); // Закрываем окно только после успешного входа
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error ||
                `Ошибка ${authModalMode === "register" ? "регистрации" : "входа"}`;
            alert(errorMessage);
        }
    };
    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Store707</div>
                    <div className="header__right">
                        {user ? (
                            <>
                                <span className="user-greeting">
                                    Привет, {user.first_name}!
                                </span>
                                <button className="btn btn--secondary" onClick={handleLogout}>
                                    Выход
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn--secondary" onClick={openLogin}>
                                    Вход
                                </button>
                                <button className="btn btn--secondary" onClick={openRegister}>
                                    Регистрация
                                </button>
                            </>
                        )}
                    </div>
                </div> </header>
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Товары</h1>
                        <button className="btn btn--primary" onClick=
                            {openCreate}>
                            + Создать
                        </button>
                    </div>
                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <ProductsList
                            products={products}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </main>
            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Store707
                </div>
            </footer>
            <ProductModal open={modalOpen}
                       mode={modalMode}
                       initialProduct={editingProduct}
                       onClose={closeModal}
                       onSubmit={handleSubmitModal}
            />
            <AuthModal open={authModalOpen}
                          mode={authModalMode}
                          onClose={closeAuthModal}
                          onSubmit={handleSubmitAuthModal}
            />
        </div> );
}
