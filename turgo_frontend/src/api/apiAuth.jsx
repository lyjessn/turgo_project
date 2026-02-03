import useAxios from ".";

export const SignUp = async (data) => {
    try {
        
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
         
        const response = await useAxios.post("/register", formData); 
        
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const SignIn = async (data) => {
    try {
        const response = await useAxios.post("/login", data); return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const LogOut = async () => {
    try {
        const response = await useAxios.post("/logout", {},
            { headers: 
                { 
                    Authorization: `Bearer ${sessionStorage.getItem("token")}` 
                } 
            },
        ); 
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const getRole = async () => {
    try {
        const response = await useAxios.get("/getrole",
            { headers: 
                { 
                    Authorization: `Bearer ${sessionStorage.getItem("token")}` 
                } 
            }
        ); 
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}