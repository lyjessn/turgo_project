import axiosClient from "./axiosClient";

export const SignUp = async (data) => {
    try {
        
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
         
        const res = await axiosClient.post("/register", formData); 
        
        return res.data;
    } catch (error) {
        throw error.res.data;
    }
};

export const SignIn = async (data) => {
    try {
        const res = await axiosClient.post("/login", data);

        return res.data;
    } catch (error) {
        throw error.res.data;
    }
};

export const LogOut = async () => {
    try {
        const res = await axiosClient.post("/logout", {},
            { headers: 
                { 
                    Authorization: `Bearer ${sessionStorage.getItem("token")}` 
                } 
            },
        ); 
        return res.data;
    } catch (error) {
        throw error.res.data;
    }
}

export const getRole = async () => {
    try {
        const res = await axiosClient.get("/getrole",
            { headers: 
                { 
                    Authorization: `Bearer ${sessionStorage.getItem("token")}` 
                } 
            }
        ); 
        return res.data;
    } catch (error) {
        throw error.res.data;
    }
}