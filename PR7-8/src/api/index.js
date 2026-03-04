import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
}
});

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
    createProduct: async (product) => {
        let response = await apiClient.post("/products", product);
        return response.data;
    },
    getProducts: async () => {
        let response = await apiClient.get("/products");
        return response.data;
    },
    getProductById: async (id) => {
        let response = await apiClient.get(`/products/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    updateProduct: async (id, product) => {
        const response = await apiClient.put(`/products/${id}`, product, {
            headers: getAuthHeaders()
        });
        return response.data
    },
    deleteProduct: async (id) => {
        let response = await apiClient.delete(`/products/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    // Авторизация
    registerUser: async (userData) => {
        const response = await apiClient.post("/auth/register", userData);

        // После регистрации сразу логиним пользователя
        if (response.data) {
            // Сохраняем пользователя в localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
        }

        return response.data;
    },

    loginUser: async (credentials) => {
        const response = await apiClient.post("/auth/login", credentials);

        // Сохраняем токен
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);

            // Получаем данные пользователя
            const userResponse = await apiClient.get("/auth/me", {
                headers: { Authorization: `Bearer ${response.data.accessToken}` }
            });

            if (userResponse.data) {
                localStorage.setItem('user', JSON.stringify(userResponse.data));
                return {
                    user: userResponse.data,
                    token: response.data.accessToken
                };
            }
        }

        return response.data;
    },
}
