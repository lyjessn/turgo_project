import axiosClient from "./axiosClient";

export const Register = async (formData) => {
  try {
    const res = await axiosClient.post("/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerByAdmin = async (formData) => {
  try {
    const res = await axiosClient.post("/registerByAdmin", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerByOwner = async (formData) => {
  try {
    const res = await axiosClient.post("/registerByOwner", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const SignIn = async (data) => {
    try {
        const res = await axiosClient.post("/login", data);

        return res.data;
    } catch (error) {
       throw error.response?.data || error;
    }
};

export const GetUserData = async () => {
  try {
    const res = await axiosClient.get("/getUserData");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
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
        throw error.response?.data || error;
    }
}

export const getRole = async () => {
    try {
        const res = await axiosClient.get("/getrole", {
            headers: { 
                Authorization: `Bearer ${sessionStorage.getItem("token")}` 
            } 
        }); 
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}