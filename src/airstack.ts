import axios from 'axios';

const API_URL = 'https://api.airstack.xyz/graphql';

export const fetchData = async (query: string) => {
  try {
    const response = await axios.post(
      API_URL,
      { query },
      { headers: { Authorization: `Bearer 13827f8b8c521443da97ed54d4d6a891d` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
