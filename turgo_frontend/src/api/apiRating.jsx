import axiosClient from "./axiosClient";

export const getRatingsByTarget = async (tipe,id,bintang=null,page=1)=>{
    try {
        let url=`/ratings/${tipe}/${id}?page=${page}`;
        if(bintang!==null)
            url+=`&bintang=${bintang}`;
        const res=await axiosClient.get(url);
        return res.data.data;
    } catch(error) {
        throw error.response?.data||error;
    }
};

export const getRatingSummary = async (tipe,id)=>{
    try {
        const res=await axiosClient.get(`/ratings/${tipe}/${id}/summary`);
        return res.data.data;
    } catch(error) {
        throw error.response?.data||error;
    }
};


export const createRating = async (data)=>{
    try {
        const res=await axiosClient.post(`/rating`,data);
        return res.data.data;
    } catch(error) {
        throw error.response?.data||error;
    }
};

export const getRateableItems = async (id)=>{
    try {
        const res=await axiosClient.get(`/rating/available/${id}`);
        return res.data.data;
    } catch(error) {
        throw error.response?.data||error;
    }
};