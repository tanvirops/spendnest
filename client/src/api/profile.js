import axiosClient from "./axiosClient"

export const getProfile = async () => {
    const {data} = await axiosClient.get('/profile');
    return data;
}

export const updateProfile = async (data) => {
    const response = await axiosClient.put('/profile', data);
    return response.data;
}

export const changePassword = async (data) => {
    const res = await axiosClient.post('/profile/change-password', data);
    console.log(res)
    return  res;
}